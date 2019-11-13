#!/bin/bash

set -e
set -x

npm run build
git add lib
git diff --quiet && git diff --staged --quiet || git commit -m "build"

npm ci --only=production
git add -f node_modules
git diff --quiet && git diff --staged --quiet ||  git commit -m "node_modules"

git push