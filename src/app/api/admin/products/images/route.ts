import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_EMAIL = "uaerealprojects@gmail.com";

async function checkAdmin(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return false;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    if (!productId) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("position", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ images: data || [] });
  } catch (error: unknown) {
    console.error("Error listing images:", error);
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("product_id") as string | null;

    if (!file || !productId) {
      return NextResponse.json({ error: "file and product_id are required" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${productId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const supabase = createServiceClient();

    const { data: existing, error: countError } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: false })
      .eq("product_id", productId);

    if (countError) throw countError;
    const imageCount = existing?.length || 0;
    if (imageCount >= 10) {
      return NextResponse.json({ error: "Maximum 10 images per product" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const { data: imageRecord, error: insertError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        url: publicUrl,
        alt: file.name,
        position: imageCount,
        is_remote: false,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, image: imageRecord });
  } catch (error: unknown) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, product_id } = await request.json();
    if (!id || !product_id) {
      return NextResponse.json({ error: "id and product_id are required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: image } = await supabase
      .from("product_images")
      .select("url, is_remote")
      .eq("id", id)
      .eq("product_id", product_id)
      .single();

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (!image.is_remote) {
      const storagePath = image.url.split("/product-images/")[1];
      if (storagePath) {
        await supabase.storage.from("product-images").remove([storagePath]);
      }
    }

    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    const { data: remaining } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", product_id)
      .order("position", { ascending: true });

    if (remaining) {
      for (let i = 0; i < remaining.length; i++) {
        await supabase
          .from("product_images")
          .update({ position: i })
          .eq("id", remaining[i].id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
