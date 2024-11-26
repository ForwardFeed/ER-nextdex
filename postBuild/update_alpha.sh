#/bin/bash
#exit on a single error
set -e

if [ jq ]
then
    prjAlpha=$(cat ./nextdex_config.json | jq -r '.project_root_alpha')
    if [ "$prjAlpha" == "null" ]
    then
        prjAlpha=""
    fi
fi
curr="$(pwd)"
if [ -z "$prjAlpha" ]
then
    prjAlpha=$1
fi

if [ -z "$prjAlpha" ]
then
    echo "missing project file specific to alpha"
    exit 1
fi

if [ -d "$prjAlpha" ]
then
    echo "Using alpha folder "$prjAlpha""
else
    echo "could not find alpha folder "$prjAlpha"" 
    exit 2
fi

cd "${prjAlpha}"
git checkout .
git pull
cd "${curr}"
npm run build && npm run run -- -ip "${prjAlpha}" -sv 2 -rd -o Alphatest
git commit -am "updated data" && git push && git checkout github-pages && git merge main && git push && git checkout main

echo "updated alpha data OK"
