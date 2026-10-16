# Vault

An Obsidian-style wiki: Vite + React, fully client-side.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # static site in dist/ (host anywhere)

## Add content
Add or edit `.md` files in `notes/` (any folder depth). Media files go in the same folder.
Full syntax (links, embeds, code, quizzes) is in `notes/How to add notes.md`.

## Customise
- `SITE_URL` at the top of `src/App.jsx` sets where the star / SITE link goes.
- Panel limits (`SNAP`, `MIN`, `MAX`) are also at the top of `src/App.jsx`.
- Colours live in `:root` in `src/styles.css`.

## More
- Flow diagrams: ```mermaid blocks. Homepage: `notes/_home.md` (excluded from the graph).
- Name shown top-left: `OWNER_NAME` in `src/App.jsx`.

## Features
Wikilinks, backlinks, graph (zoom/pan, folder colours, tag filter), tags, callouts, note embeds, KaTeX math, mermaid flow diagrams, quizzes (single, multiple, fill-in, shuffle, score), code copy buttons, quick switcher (Ctrl/Cmd+K), prev/next links, saved panel layout, mobile drawers. Syntax reference: `notes/How to add notes.md`.

## Deploy
`npm run build` produces a static `dist/` (relative paths, hash routing) that works on any static host. For GitHub Pages: push to `main`, enable Pages with source "GitHub Actions" (`.github/workflows/deploy.yml` is included). After deploying, set `og:image` in `index.html` to an absolute URL.

## Instructions
All usage instructions live in the app, in the `notes/Demo` folder (Welcome, How to add notes, Customize and Deploy, plus feature demos). Hide that folder with `SHOW_DEMO` at the top of `src/App.jsx`.
