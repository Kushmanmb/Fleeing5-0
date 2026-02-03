# Farcaster Configuration

This directory contains the Farcaster miniapp configuration file.

## Important: URL Configuration

The `farcaster.json` file currently contains localhost URLs as placeholders. Before deploying this application, you **must** update all URLs in the miniapp section to point to your actual deployment domain.

### URLs that need updating:
- `homeUrl`
- `iconUrl`
- `splashImageUrl`
- `screenshotUrls`
- `heroImageUrl`
- `ogImageUrl`

### For local development:
The localhost URLs (port 8080) are suitable for testing during development. You can run a local server using:
```bash
cd dist
python -m http.server 8080
# or
npx http-server -p 8080
```

### For production deployment:
Replace all localhost URLs with your actual deployment domain (e.g., your custom domain or hosting provider URL).

**Note**: Since this repository is private, GitHub Pages is not available. You'll need to deploy to a custom hosting provider or use a paid GitHub plan to enable GitHub Pages for private repositories.
