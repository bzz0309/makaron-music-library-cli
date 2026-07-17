# Tencent SCF relay

This dependency-free Node.js 18 Web Function exposes only the public Agent routes of the Makaron music library. It does not expose administrator upload routes and cannot proxy arbitrary destinations.

The relay forwards registration, search, recommendation, signed access, and Range audio requests to the Cloudflare Worker. It rewrites signed audio URLs so clients continue through the Tencent endpoint.

Deployment requires the same random `MUSICLIB_RELAY_SECRET` in Tencent SCF and the Cloudflare Worker. Never commit or print that value.
