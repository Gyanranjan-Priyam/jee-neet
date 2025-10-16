import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET: Fetch a specific video
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ batchId: string; subjectId: string; chapterId: string; videoId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId, videoId } = await context.params;
    const supabase = createAdminClient();

    const { data: video, error } = await supabase
      .from('chapter_videos')
      .select('*')
      .eq('id', videoId)
      .eq('topic_id', chapterId)
      .eq('is_active', true)
      .single();

    if (error || !video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      video
    });

  } catch (error) {
    console.error("Error in GET video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update a video
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ batchId: string; subjectId: string; chapterId: string; videoId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId, videoId } = await context.params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { title, video_url, video_source } = body;

    if (!title && !video_url && !video_source) {
      return NextResponse.json(
        { error: "At least one field (title, video_url, video_source) is required" },
        { status: 400 }
      );
    }

    // Validate video_source if provided
    if (video_source && !['youtube', 'google_drive', 'direct_link'].includes(video_source)) {
      return NextResponse.json(
        { error: "Invalid video_source. Must be 'youtube', 'google_drive', or 'direct_link'" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (title) updateData.title = title;
    if (video_url) updateData.video_url = video_url;
    if (video_source) updateData.video_source = video_source;

    const { data: updatedVideo, error } = await (supabase as any)
      .from('chapter_videos')
      .update(updateData)
      .eq('id', videoId)
      .eq('topic_id', chapterId)
      .eq('is_active', true)
      .select()
      .single();

    if (error || !updatedVideo) {
      console.error("Error updating video:", error);
      return NextResponse.json(
        { error: "Failed to update video or video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video updated successfully",
      video: updatedVideo
    });

  } catch (error) {
    console.error("Error in PUT video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a video (soft delete)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ batchId: string; subjectId: string; chapterId: string; videoId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId, videoId } = await context.params;
    const supabase = createAdminClient();

    const { data: deletedVideo, error } = await (supabase as any)
      .from('chapter_videos')
      .update({ is_active: false })
      .eq('id', videoId)
      .eq('topic_id', chapterId)
      .eq('is_active', true)
      .select()
      .single();

    if (error || !deletedVideo) {
      return NextResponse.json(
        { error: "Video not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully"
    });

  } catch (error) {
    console.error("Error in DELETE video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}