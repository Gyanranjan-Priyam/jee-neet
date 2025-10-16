import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET: Fetch all videos for a chapter
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ batchId: string; subjectId: string; chapterId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId } = await context.params;
    const supabase = createAdminClient();

    // First verify that the chapter exists and belongs to the right subject and batch
    const { data: chapter, error: chapterError } = await supabase
      .from('batch_subject_topics')
      .select(`
        id,
        subject_id,
        batch_subjects!inner(
          id,
          name,
          batch_id
        )
      `)
      .eq('id', chapterId)
      .eq('batch_subjects.id', subjectId)
      .eq('batch_subjects.batch_id', batchId)
      .maybeSingle();

    if (chapterError || !chapter) {
      console.error('Chapter lookup error:', chapterError);
      return NextResponse.json(
        { error: "Chapter not found", details: chapterError?.message, chapterId },
        { status: 404 }
      );
    }

    // Check if chapter_videos table exists and fetch videos
    const { data: videos, error } = await supabase
      .from('chapter_videos')
      .select('*')
      .eq('topic_id', chapterId)
      .eq('is_active', true)
      .order('video_type', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error("Error fetching videos:", error);
      // If table doesn't exist, return empty videos instead of error
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('chapter_videos table does not exist, returning empty videos');
        return NextResponse.json({
          success: true,
          videos: { lectures: [], dpp_videos: [] },
          total: 0,
          message: 'Videos table not yet created'
        });
      }
      return NextResponse.json(
        { error: "Failed to fetch videos", details: error.message },
        { status: 500 }
      );
    }

    // Group videos by type
    const groupedVideos = {
      lectures: videos?.filter((v: any) => v.video_type === 'lecture') || [],
      dpp_videos: videos?.filter((v: any) => v.video_type === 'dpp_video') || []
    };

    return NextResponse.json({
      success: true,
      videos: groupedVideos,
      total: videos?.length || 0
    });

  } catch (error) {
    console.error("Error in GET /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]/videos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new video
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ batchId: string; subjectId: string; chapterId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId } = await context.params;
    const supabase = createAdminClient();
    const body = await request.json();

    // Validate required fields
    const { 
      title, 
      video_url, 
      video_type, 
      video_source, 
      description,
      file_size,
      order_index 
    } = body;

    if (!title || !video_url || !video_type || !video_source) {
      return NextResponse.json(
        { error: "Missing required fields: title, video_url, video_type, video_source" },
        { status: 400 }
      );
    }

    // Validate video_type
    if (!['lecture', 'dpp_video'].includes(video_type)) {
      return NextResponse.json(
        { error: "Invalid video_type. Must be 'lecture' or 'dpp_video'" },
        { status: 400 }
      );
    }

    // Validate video_source
    if (!['youtube', 'google_drive', 'direct_link', 'cloudinary'].includes(video_source)) {
      return NextResponse.json(
        { error: "Invalid video_source. Must be 'youtube', 'google_drive', 'direct_link', or 'cloudinary'" },
        { status: 400 }
      );
    }

    // Verify chapter exists and belongs to the right subject and batch
    const { data: chapter, error: chapterError } = await supabase
      .from('batch_subject_topics')
      .select(`
        id,
        subject_id,
        batch_subjects!inner(
          id,
          name,
          batch_id
        )
      `)
      .eq('id', chapterId)
      .eq('batch_subjects.id', subjectId)
      .eq('batch_subjects.batch_id', batchId)
      .maybeSingle();

    if (chapterError || !chapter) {
      console.error('Chapter verification failed:', chapterError);
      return NextResponse.json(
        { error: "Chapter not found", details: chapterError?.message, chapterId },
        { status: 404 }
      );
    }

    // Get the next order index for this video type
    const { data: maxOrderData, error: orderError } = await supabase
      .from('chapter_videos')
      .select('order_index')
      .eq('topic_id', chapterId)
      .eq('video_type', video_type)
      .order('order_index', { ascending: false })
      .limit(1) as { data: { order_index: number }[] | null; error: any };

    // If table doesn't exist, return helpful error
    if (orderError && (orderError.code === 'PGRST116' || orderError.message.includes('does not exist'))) {
      return NextResponse.json(
        { 
          error: "Videos table not created yet", 
          details: "Please create the chapter_videos table first",
          sql: "Run: CREATE TABLE chapter_videos (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, topic_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE, title VARCHAR(255) NOT NULL, video_url TEXT NOT NULL, video_type VARCHAR(50) NOT NULL CHECK (video_type IN ('lecture', 'dpp_video')), video_source VARCHAR(50) NOT NULL CHECK (video_source IN ('youtube', 'google_drive', 'direct_link')), order_index INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);"
        },
        { status: 500 }
      );
    }

    const finalOrderIndex = order_index !== undefined ? parseInt(order_index) : (maxOrderData?.[0]?.order_index || 0) + 1;

    // Create the video record
    const { data: newVideo, error: insertError } = await (supabase as any)
      .from('chapter_videos')
      .insert({
        topic_id: chapterId,
        title: title.trim(),
        description: description?.trim() || null,
        video_url,
        video_type,
        video_source,
        order_index: finalOrderIndex,
        file_size: file_size ? parseInt(file_size) : null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating video:", insertError);
      // Check if it's a table/column not found error
      if (insertError.code === 'PGRST116' || insertError.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: "Videos table or column not found", 
            details: insertError.message,
            suggestion: "Please ensure the chapter_videos table exists with topic_id column"
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create video", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video created successfully",
      video: newVideo
    }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]/videos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}