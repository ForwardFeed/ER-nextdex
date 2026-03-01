# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ER-nextdex is a Pokemon Elite Redux documentation web app. It parses Pokemon Emerald decompilation source files (C code) and presents the data as an interactive web-based Pokedex. Live at: https://forwardfeed.github.io/ER-nextdex/static/

## Commands

```bash
# Generate protobuf TypeScript files from er-config/
npm run protoc

# Compile TypeScript (src/ → target/)
npm run build

# Full pipeline: protoc + build + run data parser
npm run run

# Run data parser with options (see CLI Arguments below)
node ./target/main.js [options]

# Extract sprites only
npm run sprites

# Bundle frontend JS with webpack
npm run webpack

# Compare game versions
npm run comparify

# Restore vanilla data
npm run restore-vanilla
```

There are no tests (`npm test` exits with error by design).

## CLI Arguments for Data Parser

```
-o,  --output              Output filename suffix (e.g. "-o Alpha" → gameDataVAlpha.json)
-ip, --input-path          Override project root path (path to game source files)
-sv, --structure-version   Data parsing version (integer)
-so, --sprites-only        Extract only sprites, skip data processing
-rd, --redirect-data       Output to static/js/data/ instead of out/
-c,  --comparify           Compare multiple game versions
-nc, --no-config           Skip configuration file usage
```

## Architecture

The project has two distinct halves:

### Backend: Data Processing Pipeline (`src/`)

TypeScript that reads Pokemon Emerald C source files and outputs `gameData.json`.

**Entry point:** `src/main.ts` — orchestrates all parsers, assembles `GameData`, then compacts and serializes to JSON.

**Data flow:**
1. Reads `nextdex_config.json` for `project_root` (path to game source) and version info
2. Runs parsers for each data type in parallel where possible
3. Compacts output via `src/compactify.ts` to reduce JSON size
4. Writes to `out/gameData.json` (or `static/js/data/` with `-rd`)

**Parser modules:**
- `src/species/` — Pokemon species: base stats, evolutions, learnsets (level-up, TM/HM, tutor, egg), forms, Pokedex entries, sprite paths
- `src/trainers/` — Trainer teams, rematches, route ordering
- `src/moves.ts`, `src/abilities.ts`, `src/battle_items/` — Move/ability/item data
- `src/locations.ts` — Wild encounter tables
- `src/maps/` — Map data
- `src/additional_data/` — Miscellaneous extra data

**Parsing utilities:**
- `src/utils.ts` — File I/O, macro expansion
- `src/parse_utils.ts` — Regex-based C source parsing helpers
- `src/proto_utils.ts` — Protobuf helpers
- `src/internal_id.ts` — Maps internal IDs between game versions

**Protobuf:** Schemas live in `er-config/`. Run `npm run protoc` to regenerate `src/gen/` (TypeScript types).

### Frontend: Web UI (`static/`)

Vanilla JavaScript + jQuery. No build step needed beyond `npm run webpack` for bundling.

**Entry points:** `static/index.html` → `static/js/index.js`

**Key JS modules:**
- `static/js/hydrate/` — Loads and parses `gameData.json` into in-memory structures
- `static/js/panels/` — UI panels for species, moves, abilities, locations, trainers, team builder
- `static/js/filters.js`, `search.js` — Filtering and search logic
- `static/js/data_version.js` — Handles multiple game version JSON files
- `static/js/load_save.js`, `convert_save.js` — Save file parsing/conversion

Themes are in `static/css/themes/`. Third-party libs (jQuery) are in `static/vendor/`.

### Dev Server (`devDexServer/`)

A webhook-based server that watches for GitHub pushes and auto-reruns the data parser. Runs on port 8080. Used in Docker deployment.

## Configuration

`nextdex_config.json` (auto-created at runtime, not committed) holds:
- `project_root`: path to the Pokemon Emerald game source directory
- `verified`: boolean flag

The game source directory is a separate repo (pokeemerald decompilation) referenced via git submodules.
