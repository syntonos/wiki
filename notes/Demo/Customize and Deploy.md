# Customize and Deploy

#demo

Everything about running and configuring the site itself.

## Run it
~~~
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
~~~
Adding or editing notes while `npm run dev` is running updates the page instantly.

## Your name and links
At the top of `src/App.jsx`:
- `OWNER_NAME`: the name shown at the right of the top bar
- `SITE_URL`: where the star and name link to
- `GITHUB_URL` and `INSTAGRAM_URL`: the two logo links

## Show or hide the Demo folder
`SHOW_DEMO` at the top of `src/App.jsx`. Set it to `false` to remove every note inside `notes/Demo` from the sidebar, graph, search, tags and homepage index. It can only be changed in code. Move any note you want to keep out of `Demo` first.

## Homepage
`notes/_home.md` is the homepage. Files whose name starts with `_` are not notes: they stay out of the graph, sidebar and backlinks. An automatic index, tag list and unresolved-link report are appended below your text.

## Panels
Drag the edge of either side panel to resize it. Drag it narrower than `SNAP` and it snaps closed. `SNAP`, `MIN` and `MAX` are at the top of `src/App.jsx`. Your layout is remembered between visits.

## Look
- Colours are CSS variables in `:root` in `src/styles.css`.
- Fonts (Orbitron for titles, JetBrains Mono for body text) are loaded in `index.html` and set in `src/styles.css`.
- The favicon is `public/favicon.svg` (and a PNG copy). The social preview image is `public/og.png`.

## Deploy
`npm run build` makes a static `dist/` folder that works on any static host. For GitHub Pages: push to `main`, set Pages source to "GitHub Actions" (the workflow is already in `.github/workflows/deploy.yml`). After deploying, change `og:image` in `index.html` to an absolute URL.

Back to [[Welcome]].
