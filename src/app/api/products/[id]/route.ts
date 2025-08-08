import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct } from "@/lib/products";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const {
      name,
      priceInGrosz,
      priceInCents,
      description,
      imagePaths,
      imagePublicIds,
      isAvailable,
    } = body;

    const product = await updateProduct(productId, {
      ...(name && { name }),
      ...(priceInGrosz && { priceInGrosz: Number(priceInGrosz) }),
      ...(priceInCents && { priceInCents: Number(priceInCents) }),
      ...(description && { description }),
      ...(imagePaths && { imagePaths }),
      ...(imagePublicIds && { imagePublicIds }),
      ...(isAvailable !== undefined && { isAvailable }),
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
