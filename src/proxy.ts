import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/scan(.*)",
  "/api/public(.*)",    // Public API endpoints
  "/share/(.*)",
  "/share-target(.*)", // Web Share Target
  "/hall-of-shame",
  "/api/quiz(.*)",
  "/leaderboard(.*)",  // Leaderboard is public
  "/batch",            // Batch page - auth handled inside
  "/developers",       // Developer docs are public
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and the manifest
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
    "/(api|trpc)(.*)",
  ],
};