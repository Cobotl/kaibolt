#!/bin/sh
set -e
cd "$(dirname "$0")/.."
OUT=kaios/application.zip
rm -f "$OUT"
zip -qr "$OUT" \
    manifest.webapp index.html conduct.html guidelines.html 404.html \
    css/kaios.css css/style.css css/links.css \
    js/kaios.js js/doc.js \
    Images/logos/kaiosapplogo_56.png Images/logos/kaiosapplogo_112.png \
    Images/logos/aerocoboltbeta.svg
echo "Built $OUT ($(wc -c < "$OUT") bytes)"
