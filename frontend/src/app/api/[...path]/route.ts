import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://127.0.0.1:8080";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${BACKEND_URL}/api/${path.join("/")}`;

  const { search } = new URL(req.url);
  const url = `${targetUrl}${search}`;

  const contentType = req.headers.get("content-type");
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(url, fetchOptions);

    const resHeaders = new Headers(backendRes.headers);
    resHeaders.delete("content-encoding");

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error(`[API Proxy] Failed to reach backend at ${url}:`, err);
    return NextResponse.json(
      { error: "Backend unreachable", target: url },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
