import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth-middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/giveaways/:path*",
    "/meet-and-greet/:path*",
    "/contact/:path*",
    "/login",
    "/signup",
    "/public",
  ],
};
