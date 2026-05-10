import { NextRequest, NextResponse } from "next/server";

// This runs at REQUEST TIME — can read runtime env vars correctly
const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:8080";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${BACKEND_URL}/api/${path.join("/")}`;

  // Forward query string
  const { search } = new URL(req.url);
  const url = `${targetUrl}${search}`;

  const headers = new Headers(req.headers);
  // Remove hop-by-hop headers
  headers.delete("host");

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // Forward body for non-GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(url, fetchOptions);

    const resHeaders = new Headers(backendRes.headers);
    resHeaders.delete("content-encoding"); // avoid decompression issues

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
