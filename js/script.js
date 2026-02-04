document.addEventListener("DOMContentLoaded", () => {
  updateFooterYear();
  enhanceIndex();
  enhanceMembers(); // 検索 + 折りたたみ/展開
});

/* ========= 共通 ========= */
function updateFooterYear() {
  const footerP = document.querySelector("footer p");
  if (!footerP) return;

  const year = new Date().getFullYear();
  // "© 2026 Team" の 2026 部分だけ置換（なければそのまま）
  footerP.textContent = footerP.textContent.replace(/\b20\d{2}\b/, String(year));
}

/* ========= index.html 用 ========= */
function enhanceIndex() {
  const main = document.querySelector("main");
  if (!main) return;

  // members.html は <main class="members"> なので除外
  if (main.classList.contains("members")) return;

  // すでにリンクがあるなら何もしない
  if (document.querySelector('a[href="members.html"]')) return;

  const link = document.createElement("a");
  link.href = "members.html";
  link.textContent = "メンバー紹介 →";
  link.className = "link-members";

  // 既存のpの後ろに自然に置く
  main.appendChild(link);
}

/* ========= members.html 用 ========= */
function enhanceMembers() {
  const membersMain = document.querySelector("main.members");
  if (!membersMain) return;

  const cards = Array.from(membersMain.querySelectorAll(".member"));

  // 1) 説明文を「初期は折りたたみ」
  cards.forEach((card) => {
    const p = card.querySelector("p");
    if (!p) return;

    // 初回だけセット
    if (card.dataset.collapsibleReady === "1") return;
    card.dataset.collapsibleReady = "1";

    // 初期は閉じる
    p.hidden = true;
    card.dataset.expanded = "0";

    // アクセシビリティ + クリックしやすさ
    card.style.cursor = "pointer";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-expanded", "false");
  });

  // 2) 検索UI（既にあれば作らない）
  let search = document.querySelector('input[type="search"][data-member-search]');
  if (!search) {
    search = document.createElement("input");
    search.type = "search";
    search.placeholder = "検索（名前 / 説明）";
    search.setAttribute("aria-label", "メンバー検索");
    search.dataset.memberSearch = "1";
    search.className = "member-search";

    // CSSが未対応でも最低限見れるように（邪魔しない程度）
    search.style.display = "block";
    search.style.margin = "0 auto 24px";
    search.style.maxWidth = "520px";
    search.style.width = "90%";
    search.style.padding = "12px 14px";
    search.style.borderRadius = "12px";

    membersMain.parentNode.insertBefore(search, membersMain);
  }

  // 検索イベント
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();

    cards.forEach((card) => {
      const name = card.querySelector("h2")?.textContent?.toLowerCase() ?? "";
      const desc = card.querySelector("p")?.textContent?.toLowerCase() ?? "";
      const hit = name.includes(q) || desc.includes(q);

      card.style.display = hit ? "" : "none";

      // 絞り込み後は閉じた状態に揃える（運用上わかりやすい）
      if (hit) collapseCard(card);
    });
  });

  // 3) クリックでトグル（イベント委譲）
  membersMain.addEventListener("click", (e) => {
    const card = e.target.closest(".member");
    if (!card || !membersMain.contains(card)) return;
    toggleCard(card);
  });

  // 4) キーボードでもトグル（Enter/Space）
  membersMain.addEventListener("keydown", (e) => {
    const card = e.target.closest(".member");
    if (!card || !membersMain.contains(card)) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCard(card);
    }
  });

  function toggleCard(card) {
    const expanded = card.dataset.expanded === "1";
    if (expanded) collapseCard(card);
    else expandCard(card);
  }

  function expandCard(card) {
    const p = card.querySelector("p");
    if (!p) return;

    p.hidden = false;
    card.dataset.expanded = "1";
    card.setAttribute("aria-expanded", "true");
  }

  function collapseCard(card) {
    const p = card.querySelector("p");
    if (!p) return;

    p.hidden = true;
    card.dataset.expanded = "0";
    card.setAttribute("aria-expanded", "false");
  }
}
