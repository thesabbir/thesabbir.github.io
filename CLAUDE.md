# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The GitHub **user page** repo (`thesabbir.github.io`), serving the personal-brand site at the
apex domain **ahmed.bio** (`CNAME`).

`site/build.mjs` renders `dist/` from the résumé Markdown. Hand-built, zero-dependency,
framework-free, no web fonts, **no client JS at all**. That austerity *is* the brand: don't
introduce React/bundlers/CDN assets. The repo previously carried a client-side short-link
redirector (`redirector.js` + `redirectorDB.js`, wired into `404.html`); it was removed, and
`404.html` is now a static page. Short links, if wanted again, belong at the DNS/CDN layer.

The site source is **mirrored from the `resume` repo** (`../resume`), which is the upstream for
`site/build.mjs`, `site/og.html`, `og.png`, and the four `Sabbir_Ahmed_Resume_2026.*` files. Edits
to those belong upstream first, then get copied here — otherwise the two copies drift. The one
intentional divergence is `SITE_URL` in `build.mjs` (`https://ahmed.bio/` here) and the
`ROOT_FILES` copy step that carries `CNAME`/404/redirector into `dist/`.

## Build & deploy

```bash
node site/build.mjs          # → dist/ (git-ignored; CI rebuilds it)
```

`.github/workflows/deploy.yml` builds and publishes `dist/` to Pages on every push to `main`.
Pages source must be **GitHub Actions** in repo settings — not "deploy from branch".

## Keeping the résumé formats in sync

`Sabbir_Ahmed_Resume_2026.md` is the content source of truth; the `.html` is the layout-of-record
that the `.pdf` renders from; the `.docx` is a separate render path. A content change must reach
all four or they drift — see the upstream `resume` repo's CLAUDE.md for the regeneration commands.
