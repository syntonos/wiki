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

## Deploy to GitHub Pages
The project already contains everything needed: a relative-path build, hash routing (no server rules), a `.gitignore` and the workflow `.github/workflows/deploy.yml`.
1. Create a GitHub repository and push the project to the `main` branch.
2. In the repository open Settings, then Pages, and set **Source** to **GitHub Actions**.
3. Push again (or run the workflow from the Actions tab). The site appears at `https://USER.github.io/REPO/`.
4. Every later push to `main` rebuilds and redeploys automatically, so adding a note is: add the file, commit, push.
5. After the first deploy, change `og:image` in `index.html` to the absolute URL of `og.png` so link previews work.

Any other static host works too: run `npm run build` and upload the `dist/` folder.

Back to [[Welcome]].
