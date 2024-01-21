Live at https://forwardfeed.github.io/ER-nextdex/static/

## What is it
A web application about the Elite Redux pokemon game, acts as a documentation. ER is made thanks to pret-pokeemerald hence all other games based on this work may reuse a significan part of this project.

## How to make it work
First understand that there is two part in this project:

### 1. The data fetcher/aggregator/parser
from the source files of the game.

It requires TSC or any typescript compiler (transpiler) but more critically a nodeJS environnement.
No dependecies are used in this games

Commands:
- build: just a shortcut to tsc
- run: will execute, one argument can be send to the program
    - sprites: see below run command
    - Any%: will change the output of the gamedata files to gamedata{arg}.json, usefull to upload multiple version of the data.
- sprites: a shortcut to "run sprites", will fetch all sprites and output it in dist/. I advise to use the python script "sprite_add_alpha.py" which will remove the default background color to a transparent color

Quick tip, if you use git on your pokemon project you can get back to a previous version with these bash commands
`git log  --all --grep='V0.0.1'` where `V0.0.1` is the message of a commit marking the version of the game. Copy the commit sha1 hash and then you can do
`git checkout 'the sha1 you got'`. Then now you can fetch the data with this software to then `git switch -` to get back to where you where originally.

By default the data is outputed to /dist/, you can change that with the variable OUTPUT in src/main.ts

### 2. The UI that uses this data
It requires an HTTP server since it uses JS modules. If you code with VSC for example you may uselive-server add-on.

Aside this it is just a static html web app

## Project Structure

### nextdex_config.json
It is created upon launching the data fetcher
Fields:
    - "project_root": absolute path of your game files, YOU MUST ADAPT THIS FIELD
    - "verified": automatic, will set itself to true if you fed a right project_root.

### src/ 
holds the gamefile parsing and compactify into a data called gameData.js, outputed to dist/
Althougt it shouldn't, most of the parameters are inside the code and not as environnement variable or configuration files
You run it with npm or tsc

### target/
Build of the src/ application

### dist/
Output dir by default of some files.

### static/
a simple vanilla js + jquery + css + HTML Web application, this is what is live and should be interacted with as a end user.

