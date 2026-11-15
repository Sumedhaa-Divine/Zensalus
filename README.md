# Hospital Management System – Sales Presentation

A fast, single-page sales presentation for a Hospital Management System.
It runs entirely in the browser, needs no server or build step, and can be
hosted free on **GitHub Pages**.

## What's inside

```
index.html      the presentation (10 slides)
css/style.css   the design
js/config.js    YOUR DETAILS – the only file you need to edit
js/app.js       navigation and the heartbeat progress line
favicon.svg     browser tab icon
.nojekyll       tells GitHub Pages to serve files as they are
```

## 1. Add your details

Open `js/config.js` and fill in your product name, trial length and
contact details. Anything left empty keeps its `[placeholder]`, so you
can see what's still missing.

To preview on your computer, just double-click `index.html`.

## 2. Publish on GitHub Pages (free)

**Using the GitHub website (no coding tools needed):**

1. Sign in at [github.com](https://github.com) and click **New repository**.
2. Name it (e.g. `hms-pitch`), set it to **Public**, and click **Create repository**.
3. Click **uploading an existing file**, drag in *everything* from this folder
   (including the `css` and `js` folders), then click **Commit changes**.
4. Go to **Settings → Pages**. Under **Build and deployment**, choose
   **Deploy from a branch**, select branch **main** and folder **/ (root)**, then **Save**.
5. Wait a minute or two. Your site will be live at:
   `https://<your-username>.github.io/hms-pitch/`

**Using Git on the command line:**

```bash
git init
git add .
git commit -m "Sales presentation"
git branch -M main
git remote add origin https://github.com/<your-username>/hms-pitch.git
git push -u origin main
```

Then turn on Pages as in step 4 above.

## 3. Updating the site

Edit `js/config.js` (you can do this directly on GitHub with the pencil
icon), commit, and the live site updates within a minute or two.

## Using the presentation

- **Next / previous:** arrow keys, spacebar, the on-screen buttons, or swipe on a phone
- **Jump to a slide:** add `#slide-5` to the end of the link
- **Full screen:** press F11 (Windows) or Ctrl+Cmd+F (Mac)
- Common questions on slide 9 open when clicked, handy for live Q&A

## Custom domain (optional)

To use your own domain (e.g. `pitch.yourdomain.com`), go to
**Settings → Pages → Custom domain** and follow GitHub's DNS instructions.

> Note: the site is public. Anyone with the link can view it, so don't put
> internal notes in `config.js`.
