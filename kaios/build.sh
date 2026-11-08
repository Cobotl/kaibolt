#!/bin/sh
# Builds a KaiOS packaged app: kaios/application.zip
# Install it with the KaiOS simulator / WebIDE, or submit it to the KaiStore.
set -e
cd "$(dirname "$0")/.."
OUT=kaios/application.zip
rm -f "$OUT"
zip -qr "$OUT" \
    manifest.webapp index.html conduct.html guidelines.html 404.html games.html help.html \
    css/kaios.css css/style.css css/links.css \
    Scripts/kaios.js Scripts/doc.js \
    Images/logos/kaiosapplogo_56.png Images/logos/kaiosapplogo_112.png \
echo "Built $OUT ($(wc -c < "$OUT") bytes)"
