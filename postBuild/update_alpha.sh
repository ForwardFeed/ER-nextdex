#/bin/bash
#exit on a single error
set -e

prjAlpha=$(cat ./nextdex_config.json | jq -r '.project_root_alpha')
curr="$(pwd)"

cd "${prjAlpha}"
git checkout .
git pull
cd "${curr}"
npm run build && npm run run -- -ip "${prjAlpha}" -sv 2 -rd -o Alphatest
git commit -am "updated data" && git push && git check github-pages && git merge main && git push && git checkout main

echo "updated alpha data OK"
