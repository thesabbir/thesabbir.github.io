# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The GitHub **user page** repo (`thesabbir.github.io`), serving the personal-brand site at the
apex domain **ahmed.bio** (`CNAME`): a founder page for Sabbir Ahmed, technical founder of
**Kichu** (kichu.dev).

`site/build.mjs` renders `dist/` from the `content` object at its top. Hand-built, zero-dependency,
framework-free, no web fonts, **no client JS at all**. That austerity *is* the brand: don't
introduce React/bundlers/CDN assets. `404.html` is a static page; short links, if wanted, belong
at the DNS/CDN layer.

**This repo owns the site.** It used to mirror the `resume` repo (build script, OG card and the
résumé downloads); the founder rebrand removed the résumé from the site, so the two have diverged
by design. The résumé (Markdown/HTML/PDF/DOCX) lives only in `resume` now; edit the site here.

Content rule: every claim must be grounded in fact — the résumé, or Kichu's own public copy on
kichu.dev (its landing strings live in the kichu repo's `apps/site/src/i18n/ui.ts`). Describe Kichu
the way kichu.dev does, so the two never disagree. Never upgrade a title (Cookups was *founding
engineer*, not founder).

`site/og.html` is the source for `og.png` (regeneration command in its header comment).

## Build & deploy

```bash
node site/build.mjs          # → dist/ (git-ignored; CI rebuilds it)
```

`.github/workflows/deploy.yml` builds and publishes `dist/` to Pages on every push to `main`.
Pages source must be **GitHub Actions** in repo settings — not "deploy from branch".
