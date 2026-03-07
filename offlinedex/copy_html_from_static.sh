#!/usr/bin/env bash

#exit at failure
set -e

# Cheap but works for me
if [ -d offlinedex ]; then
    cd offlinedex
    
fi
if [ ! -d src-tauri ]; then
    echo "please execute this script from the root folder"
    exit 1
fi

# a bit safe check
BASE="../static/"
OUT="./src/"
if [ ! -d "$BASE" ]; then
    echo "CANNOT FIND BASE FOLDER $BASE"
    exit 2
fi
if [ ! -d "$OUT" ]; then
    echo "CANNOT FIND OUT FOLDER $OUT"
    exit 3
fi

# remove previous content to be sure
rm -rf "$OUT"{*,.[!.]*}

# create soft links to the website data, so nothing has to be copied a millionth time again
function make_link(){
    if [ -z "$1" ]; then
        echo "make_link needs the source as first argument"
        return 0
    fi
    if [ -z "$2" ]; then
        echo "make_link needs the target as second argument"
        return 0
    fi
    SOURCE="$(pwd)/${BASE}${1}"
    LINK="$(pwd)/${OUT}${2}"
    if [ ! -f "$SOURCE" ]; then
        if [ ! -d "$SOURCE" ]; then
            echo "could not find file/folder source: ${SOURCE}"
            exit 4
        fi
    fi
    ln -sv "$SOURCE" "$LINK"
    if [ ! -f "$LINK" ]; then
        if [ ! -d "$LINK" ]; then
            echo "LINK CREATION FAILED: ${LINK} from ${SOURCE}"
            rm "$LINK" 
            exit 5
        fi
    fi
}

make_link "index.html" "index.html"
make_link "css/" "css"