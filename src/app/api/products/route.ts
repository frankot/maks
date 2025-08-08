import { NextRequest, NextResponse } from "next/server";
import { createProduct, getProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    if (featured === "true") {
      const { getFeaturedProducts } = await import("@/lib/products");
      const products = await getFeaturedProducts();
      return NextResponse.json(products);
    } else {
      const products = await getProducts();
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      name,
      priceInGrosz,
      priceInCents,
      description,
      imagePaths,
      imagePublicIds,
      isAvailable,
    } = body;

    if (!name || !priceInGrosz || !priceInCents || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await createProduct({
      id,
      name,
      priceInGrosz: Number(priceInGrosz),
      priceInCents: Number(priceInCents),
      description,
      imagePaths: imagePaths || [],
      imagePublicIds: imagePublicIds || [],
      isAvailable: isAvailable ?? true,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
