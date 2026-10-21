/**
 * Serves static assets uploaded with wrangler (see wrangler.toml).
 * Use when deploying to *.workers.dev — a Worker script alone has no HTML.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/open" || url.pathname === "/open/") {
      return Response.redirect(new URL("/", url), 302);
    }
    return env.ASSETS.fetch(request);
  },
};
