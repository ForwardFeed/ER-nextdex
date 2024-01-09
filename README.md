Live at https://forwardfeed.github.io/ER-nextdex/static/

## What is it
A web application about the Elite Redux pokemon game, acts as a documentation

## Project Structure

### src/ 
holds the gamefile parsing and compactify into a data called gameData.js, outputed to dist/
Althougt it shouldn't, most of the parameters are inside the code and not as environnement variable or configuration files
You run it with npm or tsc

### target/
Build of the src/ application

### static/
a simple vanilla js + jquery + css + HTML Web application, this is what is live and should be interacted with as a end user.