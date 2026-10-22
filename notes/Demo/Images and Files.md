# Images and Files

#demo

Put images, GIFs, videos and PDFs anywhere inside the `notes/` folder (a sub-folder like `img/` is fine). Files are found by name, so a note in any folder can use them. Files placed in `public/` also work, referenced like `![](images/photo.png)`.

## Images and GIFs
`![[sample.png]]` or with a width in pixels `![[sample.png|300]]`:

![[sample.png|360]]

Standard markdown works as well: `![alt text](img/sample.png)` (the path is relative to the note) or any `https://` address.

## PDFs
`![[sample.pdf]]` shows an inline viewer with **Open** and **Download** buttons (a number sets its height in pixels, e.g. `![[sample.pdf|500]]`):

![[sample.pdf]]

A plain link gives an open link plus a download button: `[[sample.pdf]]` or `[the sample](img/sample.pdf)` renders as [[sample.pdf]] and [the sample](img/sample.pdf). On phones the preview starts collapsed (many mobile browsers only show page one); use Open or Download.

## Video
`![[clip.mp4]]` embeds a video player, and a YouTube link in the same syntax embeds the YouTube player.

## If an image does not show
A red-dotted "missing image" label appears when a file cannot be found. Check the file really is inside `notes/` (or `public/`) in your repository, and that it was committed: on GitHub Pages, files that were never pushed give a 404.

Back to [[Welcome]].
