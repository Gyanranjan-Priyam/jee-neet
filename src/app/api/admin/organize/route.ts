import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'cleanup_orphaned_files':
        return await cleanupOrphanedFiles();
      
      case 'organize_existing_files':
        return await organizeExistingFiles();
      
      case 'check_class_organization':
        return await checkClassOrganization();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database organization API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function cleanupOrphanedFiles() {
  try {
    const { data, error } = await (supabaseAdmin as any).rpc('cleanup_orphaned_files');
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${data || 0} orphaned files`,
      orphanedCount: data || 0
    });
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup orphaned files' },
      { status: 500 }
    );
  }
}

async function organizeExistingFiles() {
  try {
    // Get all files that might need storage path updates
    const { data: files, error: filesError } = await (supabaseAdmin as any)
      .from('files')
      .select('*')
      .order('created_at', { ascending: true });

    if (filesError) {
      return NextResponse.json(
        { error: filesError.message },
        { status: 500 }
      );
    }

    let updatedCount = 0;
    const updatePromises = [];

    for (const file of files || []) {
      // Check if storage_path already follows class-wise organization
      const expectedPrefix = `${file.created_by}/${file.class_type}/`;
      
      if (!file.storage_path.includes(`/${file.class_type}/`)) {
        // Need to update storage path to include class organization
        const fileName = file.storage_path.split('/').pop();
        const newStoragePath = `${file.created_by}/${file.class_type}/${fileName}`;
        
        updatePromises.push(
          (supabaseAdmin as any)
            .from('files')
            .update({ 
              storage_path: newStoragePath,
              updated_at: new Date().toISOString()
            })
            .eq('id', file.id)
        );
        
        updatedCount++;
      }
    }

    // Execute all updates
    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} files for class-wise organization`,
      updatedCount
    });
  } catch (error) {
    console.error('Error organizing existing files:', error);
    return NextResponse.json(
      { error: 'Failed to organize existing files' },
      { status: 500 }
    );
  }
}

async function checkClassOrganization() {
  try {
    // Check folder organization
    const { data: folders, error: foldersError } = await (supabaseAdmin as any)
      .from('folders')
      .select('id, name, class_type, category, parent_id')
      .order('class_type', { ascending: true });

    if (foldersError) {
      return NextResponse.json(
        { error: foldersError.message },
        { status: 500 }
      );
    }

    // Check file organization
    const { data: files, error: filesError } = await (supabaseAdmin as any)
      .from('files')
      .select('id, name, class_type, category, storage_path, folder_id')
      .order('class_type', { ascending: true });

    if (filesError) {
      return NextResponse.json(
        { error: filesError.message },
        { status: 500 }
      );
    }

    // Analyze organization
    const foldersByClass = folders?.reduce((acc: Record<string, any[]>, folder: any) => {
      const key = `${folder.category}-${folder.class_type}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(folder);
      return acc;
    }, {} as Record<string, any[]>) || {};

    const filesByClass = files?.reduce((acc: Record<string, any[]>, file: any) => {
      const key = `${file.category}-${file.class_type}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {} as Record<string, any[]>) || {};

    // Check for files with outdated storage paths
    const filesNeedingUpdate = files?.filter((file: any) => 
      !file.storage_path.includes(`/${file.class_type}/`)
    ) || [];

    // Check for duplicate folder names within the same class
    const duplicateFolders: any[] = [];
    for (const [classKey, classFolders] of Object.entries(foldersByClass)) {
      const nameCount: Record<string, any[]> = {};
      (classFolders as any[]).forEach((folder: any) => {
        const key = `${folder.name}-${folder.parent_id || 'root'}`;
        if (!nameCount[key]) nameCount[key] = [];
        nameCount[key].push(folder);
      });
      
      Object.entries(nameCount).forEach(([nameKey, folders]) => {
        if ((folders as any[]).length > 1) {
          duplicateFolders.push({
            classKey,
            name: nameKey,
            folders: folders
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      organization: {
        totalFolders: folders?.length || 0,
        totalFiles: files?.length || 0,
        foldersByClass,
        filesByClass,
        filesNeedingUpdate: filesNeedingUpdate.length,
        duplicateFolders: duplicateFolders.length,
        duplicateFolderDetails: duplicateFolders
      }
    });
  } catch (error) {
    console.error('Error checking class organization:', error);
    return NextResponse.json(
      { error: 'Failed to check class organization' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get organization status
  return await checkClassOrganization();
}