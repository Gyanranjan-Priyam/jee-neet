import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]/pdfs/[pdfId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string; chapterId: string; pdfId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId, pdfId } = await params;
    const supabase = createAdminClient();
    
    const { data: pdf, error } = await (supabase as any)
      .from("chapter_pdfs")
      .select("*")
      .eq("id", pdfId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pdf,
    });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]/pdfs/[pdfId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string; chapterId: string; pdfId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId, pdfId } = await params;
    const body = await request.json();
    const { title, pdf_url } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updateData: any = {
      title,
      updated_at: new Date().toISOString(),
    };

    // Only update PDF URL if it's provided (for Google Drive PDFs)
    if (pdf_url) {
      updateData.pdf_url = pdf_url;
    }

    const { data: pdf, error } = await (supabase as any)
      .from("chapter_pdfs")
      .update(updateData)
      .eq("id", pdfId)
      .eq("is_active", true)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pdf,
    });
  } catch (error) {
    console.error("Error updating PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]/pdfs/[pdfId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string; chapterId: string; pdfId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId, pdfId } = await params;
    const supabase = createAdminClient();

    // Soft delete - set is_active to false
    const { data: pdf, error } = await (supabase as any)
      .from("chapter_pdfs")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pdfId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    // If it's a Supabase storage file, also delete from storage
    if (pdf.pdf_source === "supabase_storage" && pdf.storage_path) {
      try {
        const { error: storageError } = await supabase.storage
          .from("chapter-pdfs")
          .remove([pdf.storage_path]);

        if (storageError) {
          console.error("Storage deletion error:", storageError);
          // Don't fail the entire operation if storage deletion fails
        }
      } catch (storageError) {
        console.error("Storage deletion error:", storageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "PDF deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}