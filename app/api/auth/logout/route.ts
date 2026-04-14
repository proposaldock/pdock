import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await clearUserSession();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
