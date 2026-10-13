#!/usr/bin/env bash
# Construit deploy/public/ : nouvelle version à la racine, ancienne version (EasyProf-4) en secours sur /v4/
set -euo pipefail
cd "$(dirname "$0")"
(cd ../src && python3 build.py)
rm -rf public && mkdir -p public/v4
cp ../EasyProf-5.html public/index.html
cp ../src/EasyProf-4.original.html public/v4/index.html
echo "public/ prêt :"; ls -lh public public/v4
