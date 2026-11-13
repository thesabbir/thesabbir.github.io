// Zero-dependency static-site build.
// Renders the founder page and measures its own output so the colophon
// never lies.
//
// Run:  node site/build.mjs   (from repo root)
// Out:  dist/index.html + og.png + the Pages root files
//
// No framework. No runtime JavaScript ships to the browser. No web fonts.

import { writeFileSync, copyFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

/* ----------------------------------------------------------------------------
   Editable content. This is the curated voice of the site.
   Keep it strictly grounded in fact (the résumé, and Kichu's own public copy
   on kichu.dev). This is the founder's own page; an invented specific would
   betray the brand it sells. Nothing from Kichu's private materials (raise,
   pricing, runway, roadmap, traction numbers, customers, architecture or
   cost structure) belongs here.
---------------------------------------------------------------------------- */

const SITE_URL = "https://ahmed.bio/";
const KICHU_URL = "https://kichu.dev/";

const content = {
  name: "Sabbir Ahmed",
  tagline: "Founder & CEO, Kichu",
  eyebrow: "Technical founder · Dhaka, Bangladesh",
  headline: "I build the part of a company nobody&nbsp;sees.",
  intro: `These days, the company is my own. <a class="u" href="${KICHU_URL}">Kichu</a> gives a small business one place to run everything it sells, ships and gets paid for, and I'm building it with two co-founders in Dhaka. Before that I spent fifteen years building mostly other people's startups, beginning with freelance jobs I took as a teenager.`,
  description:
    "Sabbir Ahmed builds the part of a company nobody sees. Founder and CEO of Kichu, after fifteen years building startups, from freelancing as a teenager to co-founder and CTO.",
  contactLine:
    "Email is the best way to reach me. Write if you'd like to build Kichu with us or work alongside it, or if you just want to compare notes on commerce and AI agents.",
  links: [
    { href: "mailto:sabbirahmed8361@gmail.com", text: "sabbirahmed8361@gmail.com" },
    { href: KICHU_URL, text: "kichu.dev" },
    { href: "https://x.com/sabbbbbir", text: "x.com/sabbbbbir" },
    { href: "https://linkedin.com/in/sabbirahm", text: "linkedin.com/in/sabbirahm" },
    { href: "https://github.com/thesabbir", text: "github.com/thesabbir" },
  ],

  // "Now": the company, in kichu.dev's public terms only.
  now: [
    "Most small businesses run on a pile of tools that don't talk to each other, held together by an owner who stays up past midnight making the numbers agree. Kichu replaces the pile. The shop, the orders, the payments, the couriers and the books live in one place, and the software does the chasing.",
    "It costs a fraction of what the pile did, and it's already live.",
  ],

  // "How I work": the founder's edge. Grounded only in known facts.
  method: [
    "I've done most of the jobs a tech company has. I freelanced as a teenager, then wrote code for other people, led teams, was the first engineer through the door more than once, consulted, and co-founded a company as its CTO. The lesson that stuck isn't a glamorous one: companies stall on their foundations. The parts nobody looks at decide how fast everyone else can move, and they decide it quietly, long before anyone notices.",
    "Getting that right means holding two things at once. One is the big picture, where the company is actually going. The other is the small detail that will break on the way there. Most people are good at one of them. I've spent fifteen years learning to do both.",
    "AI hasn't changed this. It has made it more urgent. At Kichu, AI agents write most of the code, which means a small team can build what used to take a big one. It also means a bad idea can be built in an afternoon. So our job is the old job: deciding what's worth building, and making sure it's right. We write the rules the agents work under, and the tests that catch their mistakes before a merchant does.",
    "The largest single change so far ran to about 30,000 lines across 22 branches. The tests caught what the agents got wrong, and it shipped.",
  ],

  // "Off the clock": the person, from the founder's own bio.
  offClock:
    "Give me a free afternoon and I'll go looking for a hard problem. Usually that means whatever I'm learning that month, or one of the pet projects that may never ship, and I'd rather take something apart properly than guess at how it works. I tend to end up building a community around whatever I care about. When I can, I'm outdoors. There's usually indie music playing, and I know more about pop culture than a founder strictly needs to.",

  // Track record: outcomes, not a logo wall.
  work: [
    {
      org: "Cefalo",
      role: "Staff engineer, consulting for Norwegian SaaS companies",
      when: "2023 — 2026",
      note: "A subscription platform I worked on went from one customer and about 2,000 users to more than 300,000 users across 10–15 businesses. I built growth features for it and made the scaling calls that kept it quick. I also mentored two engineers, and other consultants brought me their hard design problems.",
    },
    {
      org: "Ngaze",
      role: "Co-founder & CTO",
      when: "2023",
      note: "A platform that teaches STEM through games and physics simulations. I owned the technology, the strategy and the hiring, and took it from an idea to a live product with two partners. I also built a tool that let people with no coding background write interactive lessons with an LLM, back when that was still unusual.",
    },
    {
      org: "Fasset",
      role: "Early engineer",
      when: "2021 — 2023",
      note: "I joined this regulated crypto exchange when its infrastructure was struggling. I cut what the core services cost to run in half, shipped its peer-to-peer launch, and laid the groundwork it later scaled on. It now serves millions of users.",
    },
    {
      org: "Cookups",
      role: "Founding engineer",
      when: "2017 — 2019",
      note: "A marketplace for home cooks. I built the customer app for web, iOS and Android from one codebase, plus the back office the business ran on. I hired and led four engineers, and saw it through to its acquisition by Chaldal.",
    },
  ],
  earlier:
    "Before that: Shohoz, where I brought food delivery to the web and launched truck rental; BAIA Group, tracing supply chains over 2G connections; and East West Media Group, where I led six engineers building real-time video calls in the browser.",
};

/* ---------------------------------------------------------------------------- */

const linkRow = content.links
  .map((l) => `<a class="u" href="${l.href}">${l.text}</a>`)
  // Zero-width space after each separator gives the row a break opportunity,
  // so on narrow screens links wrap (dot trailing its link) instead of overflowing.
  .join('<span class="dot">·</span>&#8203;');

const workRows = content.work
  .map(
    (w) => `
      <li class="work">
        <div class="work-head">
          <span class="work-org">${w.org}</span>
          <span class="work-when">${w.when}</span>
        </div>
        <div class="work-role">${w.role}</div>
        <p class="work-note">${w.note}</p>
      </li>`
  )
  .join("");

const paras = (ps) => ps.map((p) => `<p>${p}</p>`).join("\n        ");

// Inline SVG favicon — a navy monogram. Zero extra request.
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%231E3A66"/><text x="32" y="44" font-family="Georgia,serif" font-size="38" fill="%23F6F3EC" text-anchor="middle">S</text></svg>`
  ).replace(/%23/g, "%23");

const title = `${content.name} — ${content.tagline}`;
const ogLine = "I build the part of a company nobody sees.";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${content.description}">
<meta name="author" content="${content.name}">
<link rel="canonical" href="${SITE_URL}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${ogLine}">
<meta property="og:type" content="profile">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:image" content="${SITE_URL}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@sabbbbbir">
<meta name="twitter:creator" content="@sabbbbbir">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${ogLine}">
<meta name="twitter:image" content="${SITE_URL}og.png">
<link rel="icon" href="${favicon}">
<style>
  :root{
    --bg:#F6F3EC; --panel:#FBF9F3; --ink:#16181D; --muted:#5B6271;
    --accent:#1E3A66; --hair:rgba(20,22,29,.12); --max:46rem;
  }
  @media (prefers-color-scheme: dark){
    :root{
      --bg:#0B0E14; --panel:#10141C; --ink:#E9E6DD; --muted:#8B93A5;
      --accent:#9DB7EA; --hair:rgba(233,230,221,.14);
    }
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{
    margin:0; background:var(--bg); color:var(--ink);
    font-family:ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,"Hoefler Text",Georgia,"Times New Roman",serif;
    font-size:18px; line-height:1.62; letter-spacing:.001em;
    -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
    font-feature-settings:"kern","liga","onum","pnum";
  }
  body{hanging-punctuation:first last}
  .wrap{max-width:var(--max); margin:0 auto; padding:0 clamp(1.25rem,5vw,2rem);
    counter-reset:section}
  a{color:inherit; text-decoration:none}
  /* links: a faint resting underline that an accent line wipes over on hover */
  .u{background-image:linear-gradient(var(--accent),var(--accent));
    background-repeat:no-repeat; background-position:0 100%; background-size:0 1px;
    padding-bottom:2px; border-bottom:1px solid var(--hair);
    transition:background-size .4s cubic-bezier(.2,.7,.2,1), color .3s, border-color .3s}
  .u:hover{color:var(--ink); background-size:100% 1px; border-color:transparent}

  /* ---- header ---- */
  header{display:flex; justify-content:space-between; align-items:baseline;
    padding:clamp(1.5rem,5vw,2.4rem) 0 0; gap:1rem}
  .brand{font-size:.78rem; letter-spacing:.16em; text-transform:uppercase; color:var(--muted)}
  nav{font-size:.74rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted)}
  .brand, nav{white-space:nowrap}
  nav a{margin-left:1.1rem}
  @media (max-width:400px){ nav a{margin-left:.6rem} .brand{letter-spacing:.1em} nav{letter-spacing:.08em} }
  nav a:hover{color:var(--ink)}

  /* ---- hero ---- */
  .hero{padding:clamp(2.75rem,11vh,6rem) 0 clamp(2.5rem,8vh,4.5rem)}
  .eyebrow{font-family:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
    font-size:.72rem; letter-spacing:.16em; text-transform:uppercase;
    color:var(--accent); margin:0 0 1.5rem}
  h1{
    font-weight:540; font-size:clamp(2.2rem,6.4vw,4.15rem); line-height:1.04;
    letter-spacing:-.023em; margin:0 0 1.5rem; max-width:19ch;
    text-wrap:balance;
  }
  .intro{font-size:clamp(1.04rem,2.4vw,1.26rem); color:var(--muted);
    max-width:44ch; margin:0 0 2rem; line-height:1.5; text-wrap:pretty}
  .intro .u{color:var(--ink)}
  .links{font-size:.86rem; color:var(--muted)}
  .dot{margin:0 .55rem; opacity:.45}

  /* ---- sections ---- */
  section{padding:clamp(2.6rem,7vw,3.8rem) 0; border-top:1px solid var(--hair)}
  /* section titles are real <h2>, styled as numbered mono labels */
  h2.label{font-family:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
    font-size:.7rem; font-weight:400; letter-spacing:.2em; text-transform:uppercase;
    color:var(--accent); margin:0 0 1.7rem; display:flex; align-items:baseline; gap:.7rem}
  section > h2.label::before{counter-increment:section;
    content:counter(section,decimal-leading-zero);
    color:var(--muted); font-size:.78rem; letter-spacing:.08em}
  .prose p{margin:0 0 1.2rem; max-width:62ch; text-wrap:pretty}
  .prose p:last-child{margin-bottom:0}

  /* ---- now: the company card ---- */
  .venture{border:1px solid var(--hair); border-radius:.9rem; background:var(--panel);
    padding:clamp(1.4rem,4vw,2.2rem)}
  .venture-head{display:flex; justify-content:space-between; align-items:baseline;
    gap:1rem; margin:0 0 .3rem}
  .venture h3{font-size:clamp(1.6rem,4vw,2rem); font-weight:560; letter-spacing:-.015em;
    line-height:1.1; margin:0}
  .venture-when{font-family:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
    font-size:.72rem; letter-spacing:.06em; color:var(--muted); white-space:nowrap}
  .venture-role{color:var(--accent); font-size:.92rem; margin:0 0 1.2rem}
  .venture .prose p{font-size:.98rem; line-height:1.55}
  .actions{display:flex; gap:.7rem; flex-wrap:wrap; margin:1.6rem 0 0}
  .btn{display:inline-flex; align-items:center; gap:.5rem;
    font-family:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
    font-size:.74rem; letter-spacing:.08em; text-transform:uppercase;
    color:var(--bg); background:var(--accent); padding:.62rem 1rem; border-radius:.5rem;
    transition:transform .18s ease, opacity .18s ease}
  .btn:hover{transform:translateY(-1px); opacity:.92}

  /* ---- track record ---- */
  ul.work-list{list-style:none; margin:0; padding:0}
  li.work{padding:1.15rem 0; border-bottom:1px solid var(--hair)}
  li.work:first-child{padding-top:0}
  .work-head{display:flex; justify-content:space-between; align-items:baseline; gap:1rem}
  .work-org{font-size:1.18rem; font-weight:560; letter-spacing:-.01em}
  .work-when{font-family:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
    font-size:.72rem; letter-spacing:.06em; color:var(--muted); white-space:nowrap}
  .work-role{color:var(--accent); font-size:.92rem; margin:.1rem 0 .35rem}
  .work-note{margin:0; color:var(--ink); max-width:60ch; font-size:.98rem; line-height:1.5}
  .earlier{color:var(--muted); font-size:.92rem; margin:1.3rem 0 0; max-width:60ch}

  /* ---- contact + colophon ---- */
  .contact-line{margin:0 0 1.1rem; max-width:52ch}
  .contact .links{font-size:1rem}
  footer{border-top:1px solid var(--hair); padding:2.4rem 0 4rem;
    color:var(--muted); font-size:.82rem; line-height:1.7}
  footer .label{color:var(--muted)}
  footer code{font-family:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
    color:var(--ink); font-size:.92em}

  /* ---- the one motion moment: a quiet load reveal ---- */
  @media (prefers-reduced-motion: no-preference){
    .reveal{opacity:0; transform:translateY(10px); animation:rise .8s cubic-bezier(.2,.7,.2,1) forwards}
    .reveal.d1{animation-delay:.04s}
    .reveal.d2{animation-delay:.14s}
    .reveal.d3{animation-delay:.26s}
    .reveal.d4{animation-delay:.38s}
    @keyframes rise{to{opacity:1; transform:none}}
  }
  ::selection{background:var(--accent); color:var(--bg)}

  @media print{
    :root{--bg:#fff; --panel:#fff; --ink:#000; --muted:#333; --accent:#1a3e6f; --hair:#ccc}
    header nav, .actions, footer{display:none}
    .reveal{opacity:1; transform:none; animation:none}
    section{border-top:1px solid #ccc; padding:1rem 0}
    a{color:#000}
  }
</style>
</head>
<body>
<div class="wrap">

  <header>
    <span class="brand">${content.name}</span>
    <nav>
      <a href="#now">Now</a>
      <a href="#record">Work</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <div class="hero">
    <div class="eyebrow reveal d1">${content.eyebrow}</div>
    <h1 class="reveal d2">${content.headline}</h1>
    <p class="intro reveal d3">${content.intro}</p>
    <div class="links reveal d4">${linkRow}</div>
  </div>

  <section id="now">
    <h2 class="label">Now</h2>
    <article class="venture">
      <div class="venture-head">
        <h3>Kichu</h3>
        <span class="venture-when">2026 — Present</span>
      </div>
      <div class="venture-role">Founder &amp; CEO</div>
      <div class="prose">
        ${paras(content.now)}
      </div>
      <div class="actions">
        <a class="btn" href="${KICHU_URL}">Visit kichu.dev →</a>
      </div>
    </article>
  </section>

  <section id="method">
    <h2 class="label">How I work</h2>
    <div class="prose">
        ${paras(content.method)}
    </div>
  </section>

  <section id="record">
    <h2 class="label">Before Kichu</h2>
    <ul class="work-list">${workRows}
    </ul>
    <p class="earlier">${content.earlier}</p>
  </section>

  <section id="off-clock">
    <h2 class="label">Off the clock</h2>
    <div class="prose">
        <p>${content.offClock}</p>
    </div>
  </section>

  <section id="contact" class="contact">
    <h2 class="label">Contact</h2>
    <p class="contact-line">${content.contactLine}</p>
    <div class="links">${linkRow}</div>
  </section>

  <footer>
    <h2 class="label">Colophon</h2>
    This page is one hand-written HTML file. There's no framework, no JavaScript and
    no web fonts, so it uses whatever typefaces your system already has. A small script
    with no dependencies builds it; the result weighs <code>__PAGE_SIZE__</code> and
    arrives in a single request. Dark mode follows your system. The source is on
    <a class="u" href="https://github.com/thesabbir/thesabbir.github.io">GitHub</a>.
  </footer>

</div>
</body>
</html>`;

/* ---- self-measure to a fixed point: the printed size IS the file size ----
   The size string lives inside the file, so substituting it changes the byte
   count. Iterate until the figure stops moving (converges in 1–2 passes). */
// Start clean so a removed source file can't linger in dist/ across local builds.
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
const outFile = join(DIST, "index.html");
const fmt = (s) => (Buffer.byteLength(html.replace("__PAGE_SIZE__", s), "utf8") / 1024).toFixed(1) + " KB";
let kb = fmt("00.0 KB");
for (let i = 0; i < 5; i++) {
  const next = fmt(kb);
  if (next === kb) break;
  kb = next;
}
const finalHtml = html.replace("__PAGE_SIZE__", kb);
writeFileSync(outFile, finalHtml);
const trueBytes = statSync(outFile).size; // sanity: matches the printed figure

copyFileSync(join(ROOT, "og.png"), join(DIST, "og.png"));
writeFileSync(join(DIST, ".nojekyll"), "");

// Apex-domain root files: the CNAME Pages needs, plus the custom 404.
const ROOT_FILES = ["CNAME", "404.html"];
for (const f of ROOT_FILES) copyFileSync(join(ROOT, f), join(DIST, f));

console.log(`built dist/index.html — colophon says ${kb}, file is ${trueBytes} bytes`);
console.log(`copied og.png, ${ROOT_FILES.join(", ")}`);
