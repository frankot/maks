import { NextRequest, NextResponse } from "next/server";
import { getCustomerById } from "@/lib/customers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customer = await getCustomerById(params.id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}
