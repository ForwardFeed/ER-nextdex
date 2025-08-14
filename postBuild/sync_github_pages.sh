#!/bin/env bash

#exit at failure
set -e

git checkout github-pages
git merge main -m "merged from main branch" --no-ff -X theirs

git add .
git commit -m "updated build from main"
git push

git checkout main