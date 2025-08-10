

// === Configure me ===
const GH_USERNAME  = "dorshaked1"; // <-- fix typo here
const LINKEDIN_URL = "https://www.linkedin.com/in/dor-shaked-2048b9379/";

// DOM
const repoGrid  = document.getElementById("repos");
const yearEl    = document.getElementById("year");
const ghLink    = document.getElementById("link-gh");
const lnLink    = document.getElementById("link-ln");
const avatar    = document.getElementById("avatar");

// Basic wiring
yearEl.textContent = new Date().getFullYear();
ghLink.href = `https://github.com/${GH_USERNAME}`;
lnLink.href = LINKEDIN_URL;
function openGmail() {
  window.open("https://mail.google.com/mail/?view=cm&fs=1&to=dorshaked7@gmail.com&su=Hello&body=Hi Dor,", "_blank");
}

function openOutlook() {
  window.open("https://outlook.live.com/owa/?path=/mail/action/compose&to=dorshaked7@gmail.com&subject=Hello&body=Hi Dor,", "_blank");
}

// Load repos (minimal, ברור)
async function loadRepos() {
  repoGrid.innerHTML = `<div class="muted">Loading…</div>`;
  try {
    const res = await fetch(`https://api.github.com/users/${GH_USERNAME}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const repos = await res.json();

    const list = (Array.isArray(repos) ? repos : [])
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 12);

    if (!list.length) {
      repoGrid.innerHTML = `<div class="muted">No public repositories found.</div>`;
      return;
    }

    repoGrid.innerHTML = "";
    for (const r of list) {
      const card = document.createElement("a");
      card.className = "repo";        // יש לך CSS לכרטיס
      card.href = r.html_url;         // לחיץ פותח את ה-repo
      card.target = "_blank";
      card.rel = "noopener";
      card.innerHTML = `
        <h3>${r.name}</h3>
        <p>${r.description || "No description provided."}</p>
      `;
      repoGrid.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    repoGrid.innerHTML = `<div class="muted">Failed to load repositories. Please try again later.</div>`;
  }
}

// Optional: משיכת אווטאר מגיטהאב אם לא שמת תמונה מקומית
async function setGithubAvatarIfNeeded() {
  if (!avatar) return;
  const isLocal = avatar.getAttribute("src")?.startsWith("images/");
  if (!isLocal) return;
  try {
    const u = await fetch(`https://api.github.com/users/${GH_USERNAME}`).then(r => r.json());
    if (u?.avatar_url) avatar.src = u.avatar_url + "&s=160";
  } catch {}
}

// Init
(async () => {
  await Promise.all([loadRepos(), setGithubAvatarIfNeeded()]);
})();
