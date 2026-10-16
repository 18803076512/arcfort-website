#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  allowedLocalImagePriorities,
  countLocalImageTriageBy,
  localImageTriagePath,
  readLocalImageTriageRows,
  type LocalImageTriageRow,
} from "./local-image-triage-utils.ts";

const outputPath = path.join(process.cwd(), "output", "reports", "local-product-image-triage.html");

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imageSource(row: LocalImageTriageRow) {
  return `../../public/images/products/${encodeURIComponent(row.file_name)}`;
}

function optionList(values: string[]) {
  return values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("");
}

function summaryItem(label: string, value: number, detail: string) {
  return `<div class="summary-item"><strong>${value}</strong><span>${escapeHtml(label)}</span><small>${escapeHtml(detail)}</small></div>`;
}

function card(row: LocalImageTriageRow) {
  const imagePath = imageSource(row);
  const search = [
    row.candidate_id,
    row.file_name,
    row.visual_family,
    row.candidate_scope,
    row.source_owner,
    row.evidence_reference,
  ]
    .join(" ")
    .toLowerCase();

  return `<article class="candidate" data-priority="${escapeHtml(row.priority)}" data-family="${escapeHtml(row.visual_family)}" data-rights="${escapeHtml(row.usage_rights_status)}" data-match="${escapeHtml(row.exact_match_status)}" data-review="${escapeHtml(row.review_status)}" data-search="${escapeHtml(search)}">
    <div class="image-frame">
      <img src="${imagePath}" alt="Internal review candidate ${escapeHtml(row.candidate_id)}; identity not confirmed" loading="lazy" data-candidate-image>
      <span class="priority priority-${escapeHtml(row.priority.toLowerCase())}">${escapeHtml(row.priority)}</span>
      <span class="dimensions" data-dimensions>Reading file...</span>
    </div>
    <div class="candidate-body">
      <div class="candidate-heading">
        <div>
          <p class="candidate-id">${escapeHtml(row.candidate_id)}</p>
          <h2>${escapeHtml(row.file_name)}</h2>
        </div>
        <a href="${imagePath}" target="_blank" rel="noreferrer">Open original</a>
      </div>
      <dl>
        <div><dt>Visual family</dt><dd>${escapeHtml(row.visual_family)}</dd></div>
        <div><dt>Candidate scope</dt><dd>${escapeHtml(row.candidate_scope)}</dd></div>
        <div><dt>Usage rights</dt><dd>${escapeHtml(row.usage_rights_status)}</dd></div>
        <div><dt>Exact match</dt><dd>${escapeHtml(row.exact_match_status)}</dd></div>
        <div><dt>Review status</dt><dd>${escapeHtml(row.review_status)}</dd></div>
        <div><dt>Source owner</dt><dd>${escapeHtml(row.source_owner || "Not recorded")}</dd></div>
      </dl>
      ${
        row.evidence_reference
          ? `<p class="evidence"><strong>Evidence note</strong>${escapeHtml(row.evidence_reference)}</p>`
          : ""
      }
    </div>
  </article>`;
}

if (!existsSync(localImageTriagePath)) {
  console.error(`Local image triage file is missing: ${localImageTriagePath}`);
  process.exit(1);
}

const { rows } = readLocalImageTriageRows();
const priorityCounts = countLocalImageTriageBy(rows, "priority");
const families = [...new Set(rows.map((row) => row.visual_family))].sort((left, right) =>
  left.localeCompare(right),
);
const rights = [...new Set(rows.map((row) => row.usage_rights_status))].sort();
const matches = [...new Set(rows.map((row) => row.exact_match_status))].sort();
const reviews = [...new Set(rows.map((row) => row.review_status))].sort();
const approvedRights = rows.filter((row) => row.usage_rights_status === "approved").length;
const confirmedMatches = rows.filter((row) => row.exact_match_status === "confirmed").length;
const approvedReviews = rows.filter((row) => row.review_status === "approved").length;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>ArcFort Weld Local Product Image Triage</title>
  <style>
    :root { color-scheme: light; --navy:#0b1f33; --blue:#1e5e96; --orange:#d9651b; --ink:#101820; --muted:#64748b; --line:#dde3e8; --surface:#f6f8fa; }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { margin:0; background:#fff; color:var(--ink); font-family:Arial,"Segoe UI",sans-serif; line-height:1.5; }
    a { color:var(--blue); text-underline-offset:3px; }
    button,input,select { font:inherit; }
    .shell { width:min(1500px,calc(100% - 40px)); margin:0 auto; }
    header { background:var(--navy); color:#fff; padding:52px 0 46px; }
    .eyebrow { margin:0 0 10px; color:#9bc0df; font-size:12px; font-weight:700; text-transform:uppercase; }
    h1 { max-width:900px; margin:0; font-size:clamp(34px,5vw,58px); line-height:1.05; }
    .intro { max-width:850px; margin:20px 0 0; color:#d7e2ec; font-size:18px; }
    .authority { margin-top:28px; border-left:4px solid var(--orange); padding:2px 0 2px 18px; color:#fff; }
    .summary { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); border-bottom:1px solid var(--line); }
    .summary-item { min-height:142px; padding:28px 24px; border-right:1px solid var(--line); display:flex; flex-direction:column; }
    .summary-item:last-child { border-right:0; }
    .summary-item strong { color:var(--navy); font-size:36px; line-height:1; }
    .summary-item span { margin-top:12px; font-weight:700; }
    .summary-item small { margin-top:5px; color:var(--muted); }
    .workflow { padding:46px 0 40px; display:grid; grid-template-columns:minmax(260px,.75fr) minmax(0,2fr); gap:56px; }
    .workflow h2 { margin:0; color:var(--navy); font-size:26px; }
    .workflow p { margin:10px 0 0; color:var(--muted); }
    .workflow ol { margin:0; padding-left:22px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px 48px; }
    .workflow li { padding-left:6px; }
    .controls-wrap { position:sticky; top:0; z-index:10; background:rgba(255,255,255,.97); border-block:1px solid var(--line); }
    .controls { padding:18px 0; display:grid; grid-template-columns:minmax(220px,1.4fr) repeat(5,minmax(130px,.72fr)); gap:12px; }
    .control { display:flex; flex-direction:column; gap:6px; }
    .control label { color:var(--muted); font-size:12px; font-weight:700; }
    .control input,.control select { min-height:44px; width:100%; border:1px solid #c9d2da; border-radius:4px; background:#fff; padding:9px 11px; color:var(--ink); }
    .control input:focus,.control select:focus { outline:3px solid rgba(39,116,174,.2); border-color:var(--blue); }
    .result-line { padding:20px 0 10px; color:var(--muted); }
    .result-line strong { color:var(--navy); }
    .grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:24px; padding:14px 0 68px; }
    .candidate { min-width:0; border:1px solid var(--line); border-radius:6px; background:#fff; overflow:hidden; }
    .candidate[hidden] { display:none; }
    .image-frame { position:relative; aspect-ratio:4/3; background:var(--surface); display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--line); }
    .image-frame img { width:100%; height:100%; object-fit:contain; padding:18px; }
    .priority { position:absolute; top:12px; left:12px; min-width:36px; padding:5px 8px; border-radius:3px; background:var(--navy); color:#fff; font-size:12px; font-weight:700; text-align:center; }
    .priority-p0 { background:#a83c20; }
    .priority-p1 { background:#9a6516; }
    .dimensions { position:absolute; right:10px; bottom:10px; background:rgba(11,31,51,.88); color:#fff; padding:4px 7px; border-radius:3px; font-size:11px; }
    .candidate-body { padding:18px 18px 20px; }
    .candidate-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
    .candidate-id { margin:0 0 4px; color:var(--blue); font-size:12px; font-weight:700; }
    .candidate h2 { overflow-wrap:anywhere; margin:0; color:var(--navy); font-size:17px; line-height:1.3; }
    .candidate-heading a { flex:0 0 auto; font-size:12px; }
    dl { margin:18px 0 0; }
    dl div { display:grid; grid-template-columns:112px minmax(0,1fr); gap:8px; padding:7px 0; border-top:1px solid #edf0f2; }
    dt { color:var(--muted); font-size:12px; }
    dd { overflow-wrap:anywhere; margin:0; font-size:12px; font-weight:700; }
    .evidence { margin:14px 0 0; padding-top:12px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; }
    .evidence strong { display:block; margin-bottom:4px; color:var(--ink); }
    footer { background:var(--surface); border-top:1px solid var(--line); padding:30px 0 40px; color:var(--muted); font-size:13px; }
    @media (max-width:1180px) { .summary { grid-template-columns:repeat(3,minmax(0,1fr)); } .summary-item:nth-child(3) { border-right:0; } .summary-item:nth-child(n+4) { border-top:1px solid var(--line); } .grid { grid-template-columns:repeat(3,minmax(0,1fr)); } .controls { grid-template-columns:repeat(3,minmax(0,1fr)); } }
    @media (max-width:820px) { .shell { width:min(100% - 28px,720px); } header { padding:40px 0 36px; } .summary { grid-template-columns:repeat(2,minmax(0,1fr)); } .summary-item { min-height:126px; padding:22px 18px; border-top:1px solid var(--line); } .summary-item:nth-child(odd) { border-right:1px solid var(--line); } .summary-item:nth-child(even) { border-right:0; } .workflow { grid-template-columns:1fr; gap:24px; } .workflow ol { grid-template-columns:1fr; } .controls-wrap { position:static; } .controls { grid-template-columns:repeat(2,minmax(0,1fr)); } .grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media (max-width:540px) { .shell { width:calc(100% - 24px); } h1 { font-size:38px; } .intro { font-size:16px; } .summary { grid-template-columns:1fr 1fr; } .summary-item { min-height:118px; padding:19px 14px; } .summary-item strong { font-size:30px; } .controls { grid-template-columns:1fr; } .grid { grid-template-columns:1fr; gap:16px; padding-bottom:44px; } .candidate-heading { flex-direction:column; gap:8px; } }
  </style>
</head>
<body>
  <header>
    <div class="shell">
      <p class="eyebrow">ArcFort Weld / Internal Evidence Review</p>
      <h1>Local Product Image Triage</h1>
      <p class="intro">A visual review surface for files that exist in the repository but are not assigned to a canonical product image asset.</p>
      <p class="authority"><strong>Review boundary:</strong> appearance and filename are not proof of product identity, compatibility, ownership or website-use rights. Record evidence in the canonical CSV before assigning an image.</p>
    </div>
  </header>
  <main>
    <section class="shell summary" aria-label="Triage summary">
      ${summaryItem("Unassigned candidates", rows.length, "One governed row per local file")}
      ${summaryItem("P0 candidates", priorityCounts.P0 ?? 0, "Review first; active image provenance")}
      ${summaryItem("Rights approved", approvedRights, "Owner and usage basis recorded")}
      ${summaryItem("Exact match confirmed", confirmedMatches, "Exact product evidence recorded")}
      ${summaryItem("Review approved", approvedReviews, "Ready for controlled registry transfer")}
    </section>
    <section class="shell workflow">
      <div><h2>Controlled review</h2><p>The board is read-only. Update the CSV only after examining the original file and supporting evidence.</p></div>
      <ol>
        <li>Identify the source owner and original file.</li>
        <li>Record the website-use permission or restriction.</li>
        <li>Match the exact SKU using a label, drawing, sample or confirmed dimensions.</li>
        <li>Add reviewer and date, validate, then transfer approved assets deliberately.</li>
      </ol>
    </section>
    <div class="controls-wrap">
      <div class="shell controls">
        <div class="control"><label for="search">Search candidate or file</label><input id="search" type="search" placeholder="ID, filename, family, evidence"></div>
        <div class="control"><label for="priority">Priority</label><select id="priority"><option value="">All priorities</option>${optionList([...allowedLocalImagePriorities])}</select></div>
        <div class="control"><label for="family">Visual family</label><select id="family"><option value="">All families</option>${optionList(families)}</select></div>
        <div class="control"><label for="rights">Usage rights</label><select id="rights"><option value="">All rights states</option>${optionList(rights)}</select></div>
        <div class="control"><label for="match">Exact match</label><select id="match"><option value="">All match states</option>${optionList(matches)}</select></div>
        <div class="control"><label for="review">Review status</label><select id="review"><option value="">All review states</option>${optionList(reviews)}</select></div>
      </div>
    </div>
    <div class="shell result-line" aria-live="polite"><strong id="visible-count">${rows.length}</strong> of ${rows.length} candidates shown</div>
    <section class="shell grid" id="candidate-grid">
      ${rows.map(card).join("\n")}
    </section>
  </main>
  <footer><div class="shell">Generated from <code>data/evidence/local-product-image-triage.csv</code>. Internal review artifact only. No candidate becomes a public asset through this board.</div></footer>
  <script>
    const cards = [...document.querySelectorAll('.candidate')];
    const inputs = ['search','priority','family','rights','match','review'].map((id) => document.getElementById(id));
    const visibleCount = document.getElementById('visible-count');
    function applyFilters() {
      const [search, priority, family, rights, match, review] = inputs.map((input) => input.value.trim().toLowerCase());
      let visible = 0;
      for (const card of cards) {
        const matchesSearch = !search || card.dataset.search.includes(search);
        const matchesFields = (!priority || card.dataset.priority.toLowerCase() === priority) && (!family || card.dataset.family.toLowerCase() === family) && (!rights || card.dataset.rights.toLowerCase() === rights) && (!match || card.dataset.match.toLowerCase() === match) && (!review || card.dataset.review.toLowerCase() === review);
        card.hidden = !(matchesSearch && matchesFields);
        if (!card.hidden) visible += 1;
      }
      visibleCount.textContent = String(visible);
    }
    inputs.forEach((input) => input.addEventListener('input', applyFilters));
    document.querySelectorAll('[data-candidate-image]').forEach((image) => {
      const dimensions = image.parentElement.querySelector('[data-dimensions]');
      image.addEventListener('load', () => { dimensions.textContent = image.naturalWidth + ' x ' + image.naturalHeight + ' px'; });
      image.addEventListener('error', () => { dimensions.textContent = 'Missing or unreadable'; dimensions.style.background = '#a83c20'; });
    });
  </script>
</body>
</html>`;

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html, "utf8");

console.log("ArcFort Weld local product-image triage board");
console.log(`Candidates rendered: ${rows.length}`);
console.log(
  `P0: ${priorityCounts.P0 ?? 0}; P1: ${priorityCounts.P1 ?? 0}; P2: ${priorityCounts.P2 ?? 0}`,
);
console.log(`Output: ${outputPath}`);
