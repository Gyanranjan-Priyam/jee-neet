import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const batchId = formData.get('batchId') as string;
    const subjectId = formData.get('subjectId') as string;
    const chapterId = formData.get('chapterId') as string;
    const pdfType = formData.get('pdfType') as string;

    if (!file || !batchId || !subjectId || !chapterId || !pdfType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > 52428800) { // 50MB
      return NextResponse.json({ error: "File size must be less than 50MB" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Generate unique file name
    const timestamp = Date.now();
    const fileName = `${batchId}/${subjectId}/${chapterId}/${pdfType}s/${timestamp}_${file.name}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file using admin client (bypasses RLS)
    const { data, error } = await supabase.storage
      .from("chapter-pdfs")
      .upload(fileName, buffer, {
        contentType: file.type
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("chapter-pdfs")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storagePath: fileName,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Server upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}