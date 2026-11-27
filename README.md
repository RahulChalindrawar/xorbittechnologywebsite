# X-Orbit Technology: static site

Run: open `index.html`, or `python3 -m http.server 8080` and visit http://localhost:8080
Deploy: upload the folder to GitHub Pages, Cloudflare Pages or Netlify (no build step).

## Before going live
1. Domain, email and phone are already set (xorbittechnology.com, hr@xorbittechnology.com, +91-8149105906). Replace the LinkedIn/GitHub placeholder links in the footer.
3. The form opens the visitor's email app addressed to hr@xorbittechnology.com. For direct sending, set `FORM_ENDPOINT` (Formspree) in `js/script.js`.
4. Add `sameAs` (LinkedIn etc.) to the Organization JSON-LD once those profiles exist.
5. Add the site in Google Search Console and Bing Webmaster Tools, submit sitemap.xml, validate with the Rich Results Test and PageSpeed Insights.
6. Update `lastmod` in sitemap.xml whenever content changes. `_headers` works on Netlify/Cloudflare Pages.
