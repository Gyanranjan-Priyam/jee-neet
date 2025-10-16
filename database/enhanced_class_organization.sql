-- Enhanced Database Schema for Class-wise Organization
-- Run this in your Supabase SQL Editor to improve class-wise organization

-- Add unique constraint to prevent duplicate folder names within same class/category/parent
-- First, let's drop the constraint if it exists (to avoid errors)
ALTER TABLE folders DROP CONSTRAINT IF EXISTS unique_folder_per_class_parent;

-- Create a unique constraint on (name, class_type, category, parent_id, created_by)
-- This prevents duplicate folder names within the same class/category/parent combination
ALTER TABLE folders ADD CONSTRAINT unique_folder_per_class_parent 
    UNIQUE (name, class_type, category, parent_id, created_by);

-- Add additional indexes for better performance with class-wise queries
CREATE INDEX IF NOT EXISTS idx_folders_class_category_parent ON folders(class_type, category, parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_name_class ON folders(name, class_type);
CREATE INDEX IF NOT EXISTS idx_files_class_category_folder ON files(class_type, category, folder_id);

-- Create a view for better folder organization display
CREATE OR REPLACE VIEW folder_hierarchy AS
SELECT 
    id,
    name,
    parent_id,
    category,
    class_type,
    color,
    created_at,
    updated_at,
    created_by,
    -- Create a display name that includes class info for uniqueness
    CASE 
        WHEN parent_id IS NULL THEN name || ' (' || UPPER(category) || ' - ' || class_type || ')'
        ELSE name
    END as display_name,
    -- Create a storage path preview
    class_type || '/' || REPLACE(REPLACE(name, ' ', '_'), '-', '_') || '_' || class_type || '_' || category as storage_path_preview
FROM folders
ORDER BY class_type, category, name;

-- Create a view for file organization
CREATE OR REPLACE VIEW files_organized AS
SELECT 
    f.id,
    f.name,
    f.path,
    f.folder_id,
    f.category,
    f.class_type,
    f.file_size,
    f.file_type,
    f.storage_path,
    f.created_at,
    f.created_by,
    -- Include folder information
    fo.name as folder_name,
    fo.display_name as folder_display_name,
    -- Create organized path showing class/category/folder structure
    CASE 
        WHEN f.folder_id IS NULL THEN UPPER(f.category) || ' - ' || f.class_type || ' (Root)'
        ELSE UPPER(f.category) || ' - ' || f.class_type || ' / ' || fo.name
    END as organized_path
FROM files f
LEFT JOIN folder_hierarchy fo ON f.folder_id = fo.id
ORDER BY f.class_type, f.category, fo.name, f.name;

-- Add a function to get folder contents with class organization
CREATE OR REPLACE FUNCTION get_folder_contents(
    p_folder_id UUID DEFAULT NULL,
    p_class_type VARCHAR DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
    item_type TEXT,
    id UUID,
    name TEXT,
    class_type VARCHAR,
    category VARCHAR,
    created_at TIMESTAMPTZ,
    file_size BIGINT,
    storage_path TEXT,
    item_count INTEGER
) AS $$
BEGIN
    -- Return folders first
    RETURN QUERY
    SELECT 
        'folder'::TEXT as item_type,
        f.id,
        f.name,
        f.class_type,
        f.category,
        f.created_at,
        NULL::BIGINT as file_size,
        NULL::TEXT as storage_path,
        (SELECT COUNT(*)::INTEGER FROM folders cf WHERE cf.parent_id = f.id) +
        (SELECT COUNT(*)::INTEGER FROM files cf WHERE cf.folder_id = f.id) as item_count
    FROM folders f
    WHERE 
        f.parent_id IS NOT DISTINCT FROM p_folder_id
        AND (p_class_type IS NULL OR f.class_type = p_class_type)
        AND (p_category IS NULL OR f.category = p_category)
        AND f.created_by = p_user_id
    ORDER BY f.name;

    -- Then return files
    RETURN QUERY
    SELECT 
        'file'::TEXT as item_type,
        f.id,
        f.name,
        f.class_type,
        f.category,
        f.created_at,
        f.file_size,
        f.storage_path,
        0::INTEGER as item_count
    FROM files f
    WHERE 
        f.folder_id IS NOT DISTINCT FROM p_folder_id
        AND (p_class_type IS NULL OR f.class_type = p_class_type)
        AND (p_category IS NULL OR f.category = p_category)
        AND f.created_by = p_user_id
    ORDER BY f.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check for folder name conflicts
CREATE OR REPLACE FUNCTION check_folder_name_conflict(
    p_name VARCHAR,
    p_class_type VARCHAR,
    p_category VARCHAR,
    p_parent_id UUID,
    p_user_id UUID DEFAULT auth.uid(),
    p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM folders 
        WHERE name = p_name 
        AND class_type = p_class_type 
        AND category = p_category 
        AND parent_id IS NOT DISTINCT FROM p_parent_id
        AND created_by = p_user_id
        AND (p_exclude_id IS NULL OR id != p_exclude_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a maintenance function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    -- Count orphaned files (files with folder_id that doesn't exist)
    SELECT COUNT(*) INTO cleanup_count
    FROM files f
    LEFT JOIN folders fo ON f.folder_id = fo.id
    WHERE f.folder_id IS NOT NULL AND fo.id IS NULL;
    
    -- Log the cleanup
    RAISE NOTICE 'Found % orphaned files to clean up', cleanup_count;
    
    -- Set orphaned files' folder_id to NULL (move to root)
    UPDATE files 
    SET folder_id = NULL, updated_at = NOW()
    WHERE folder_id IS NOT NULL 
    AND folder_id NOT IN (SELECT id FROM folders);
    
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Enhanced class-wise database organization completed! 
- Added unique constraints for folder names per class
- Created helper views and functions
- Improved indexing for better performance
Run cleanup_orphaned_files() if needed to fix any orphaned files.' as message;