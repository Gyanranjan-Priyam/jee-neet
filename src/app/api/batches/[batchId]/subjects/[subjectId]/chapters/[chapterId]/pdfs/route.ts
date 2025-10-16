import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]/pdfs
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ batchId: string; subjectId: string; chapterId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId } = await context.params;
    const supabase = createAdminClient();
    
    const { data: pdfs, error } = await (supabase as any)
      .from("chapter_pdfs")
      .select("*")
      .eq("topic_id", chapterId)
      .eq("is_active", true)
      .order("pdf_type", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group PDFs by type
    const groupedPdfs = {
      notes: pdfs?.filter((pdf: any) => pdf.pdf_type === "note") || [],
      dpp_pdfs: pdfs?.filter((pdf: any) => pdf.pdf_type === "dpp_pdf") || [],
    };

    return NextResponse.json({
      success: true,
      pdfs: groupedPdfs,
    });
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]/pdfs
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ batchId: string; subjectId: string; chapterId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId } = await context.params;
    const body = await request.json();
    const { title, pdf_url, pdf_type, pdf_source, storage_path, file_size } = body;

    // Validation
    if (!title || !pdf_url || !pdf_type || !pdf_source) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["note", "dpp_pdf"].includes(pdf_type)) {
      return NextResponse.json(
        { error: "Invalid PDF type" },
        { status: 400 }
      );
    }

    if (!["supabase_storage", "google_drive"].includes(pdf_source)) {
      return NextResponse.json(
        { error: "Invalid PDF source" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get the current max order_index for this type
    const { data: maxOrderData } = await (supabase as any)
      .from("chapter_pdfs")
      .select("order_index")
      .eq("topic_id", chapterId)
      .eq("pdf_type", pdf_type)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    // Insert the new PDF
    const { data: pdf, error } = await (supabase as any)
      .from("chapter_pdfs")
      .insert({
        topic_id: chapterId,
        title,
        pdf_url,
        pdf_type,
        pdf_source,
        storage_path,
        file_size,
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pdf,
    });
  } catch (error) {
    console.error("Error creating PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}