import { NextResponse } from "next/server";
import { generateLiveFeed } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(generateLiveFeed(16));
}
