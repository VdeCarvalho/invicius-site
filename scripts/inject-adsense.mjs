import fs from "node:fs";
import path from "node:path";

const siteDir = path.resolve(process.argv[2] || "_site");
const client = (process.env.ADSENSE_CLIENT || "").trim();

const clientPattern = /^ca-pub-\d{16}$/;
const hasValidClient = clientPattern.test(client);

const adsenseMarker = "data-invicius-adsense-v18";
const adsenseScript = hasValidClient
  ? `  <!-- Invicius V28: Google AdSense, injected automatically on deploy -->\n` +
    `  <script async ${adsenseMarker}="true" ` +
    `src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" ` +
    `crossorigin="anonymous"></script>\n`
  : "";

let scanned = 0;
let injected = 0;
let alreadyReady = 0;
let withoutHead = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".html")) continue;

    scanned += 1;

    let html = fs.readFileSync(full, "utf8");

    // Advertising is enabled only on the current Loan Calculator page.
    // Remove any previous AdSense loader before applying the allowlist.
    html = html.replace(/\s*<!-- Invicius V\d+: Google AdSense[^]*?-->/gi, "");
    html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["'][^"']*pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"']*["'][^>]*>[^]*?<\/script\s*>/gi, "");
    const relative = path.relative(siteDir, full).split(path.sep).join("/");
    if (!hasValidClient || relative !== "tools/loan-calculator/index.html") {
      fs.writeFileSync(full, html, "utf8");
      continue;
    }

    const headClose = /<\/head\s*>/i;
    if (!headClose.test(html)) {
      withoutHead += 1;
      console.warn(`[V28] Skipped (no </head>): ${path.relative(siteDir, full)}`);
      continue;
    }

    html = html.replace(headClose, `${adsenseScript}</head>`);
    fs.writeFileSync(full, html, "utf8");
    injected += 1;
  }
}

function writeAdsTxt() {
  const adsTxtPath = path.join(siteDir, "ads.txt");

  if (!hasValidClient) {
    // A comment-only ads.txt is harmless and makes the future configuration obvious.
    fs.writeFileSync(
      adsTxtPath,
      "# Invicius V28\n# Configure the GitHub repository variable ADSENSE_CLIENT with your ca-pub-XXXXXXXXXXXXXXXX value.\n",
      "utf8"
    );
    return;
  }

  const publisherId = client.replace(/^ca-/, "");
  fs.writeFileSync(
    adsTxtPath,
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    "utf8"
  );
}

if (!fs.existsSync(siteDir)) {
  console.error(`[V28] Site directory not found: ${siteDir}`);
  process.exit(1);
}

walk(siteDir);
writeAdsTxt();

if (!hasValidClient) {
  console.log(
    "[V28] ADSENSE_CLIENT is not configured yet. Site deployed normally without AdSense injection."
  );
  console.log(
    "[V28] When you add a valid ca-pub-XXXXXXXXXXXXXXXX repository variable, the next deployment will activate it only on the Loan Calculator page."
  );
} else {
  console.log(`[V28] AdSense client: ${client}`);
  console.log(`[V28] HTML pages scanned: ${scanned}`);
  console.log(`[V28] Pages injected: ${injected}`);
  console.log(`[V28] Pages already ready: ${alreadyReady}`);
  console.log(`[V28] Pages skipped without </head>: ${withoutHead}`);
  console.log("[V28] ads.txt generated at the root of the deployed site.");
}
