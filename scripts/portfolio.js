// scripts/portfolio.js

// === Configure me ===
const GH_USERNAME  = "dorhskaed1"; // <-- change
const LINKEDIN_URL = "https://www.linkedin.com/in/dor-shaked-2048b9379/"; // <-- change

// DOM
const repoGrid = document.getElementById("repos");
const yearEl   = document.getElementById("year");
const ghLink   = document.getElementById("link-gh");
const lnLink   = document.getElementById("link-ln");
const avatar   = document.getElementById("avatar");

// Basic wiring
yearEl.textContent = new Date().getFullYear();
ghLink.href = "https://github.com/dorshaked1";
lnLink.href = LINKEDIN_URL;

// Helper: fetch JSON or throw (מרכז את טיפול השגיאה)
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = `HTTP ${res.status} @ ${new URL(url).pathname}`;
    throw new Error(msg);
  }
  return res.json();
}

// (Optional) try GitHub avatar silently — לא זורק שגיאה לדף
async function trySetGithubAvatar() {
  const usingLocal = avatar?.getAttribute("src")?.startsWith("images/");
  if (!avatar || !usingLocal) return;
  const user = await fetchJSON(`https://api.github.com/users/${GH_USERNAME}`);
  if (user?.avatar_url) avatar.src = `${user.avatar_url}&s=160`;
}

async function loadRepos() {
  // UI: loading state
  repoGrid.innerHTML = `<div class="muted">Loading projects…</div>`;

  // 1) שליפת ריפוז
  const repos = await fetchJSON(
    `https://api.github.com/users/${GH_USERNAME}/repos?per_page=100&sort=updated`
  );

  const list = (Array.isArray(repos) ? repos : [])
    .filter(r => !r.fork)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 12);

  // 2) שליפת שפות לכל ריפו, בלי להפיל את הכל אם אחד נופל
  const langResults = await Promise.allSettled(
    list.map(r => fetchJSON(r.languages_url))
  );

  langResults.forEach((res, i) => {
    list[i].__langs = (res.status === "fulfilled")
      ? Object.keys(res.value).slice(0, 3)
      : []; // אין שפות אם הבקשה נכשלה
  });

  // 3) רנדר
  if (!list.length) {
    repoGrid.innerHTML = `<div class="muted">No public repositories found.</div>`;
    return;
  }

  repoGrid.innerHTML = "";
  list.forEach(r => {
    const a = document.createElement("a");
    a.className = "repo";
    a.href = r.html_url;
    a.target = "_blank";
    a.rel = "noopener";

    const desc  = r.description || "No description provided.";
    const langs = (r.__langs || []).map(l => `<span class="badge">${l}</span>`).join("");

    a.innerHTML = `
      <h3>${r.name}</h3>
      <p>${desc}</p>
      <div class="badges">${langs}</div>
    `;
    repoGrid.appendChild(a);
  });
}

// ---- Main: try once, handle errors במקום אחד ----
(async function main() {
  try {
    await Promise.all([ trySetGithubAvatar(), loadRepos() ]);
  } catch (err) {
    console.error(err);
    repoGrid.innerHTML = `<div class="muted">Failed to load repositories. Please try again later.</div>`;
  }
})();
