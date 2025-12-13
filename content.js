function getGemId() {
  const match = window.location.pathname.match(/\/gem\/([^\/\?#]+)/);
  return match ? match[1] : null;
}

function hideCustomGemLabel() {
  const gemId = getGemId();
  if (!gemId) return;

  // Gemini UI の「カスタムGem」バッジ/ラベルを会話画面から消す
  // - DOM構造が変わっても効くよう、まずはアイコン周辺を優先的に探索
  // - 見つからない場合はフォールバックでページ全体から軽量に探索
  const TARGET_TEXTS = ["カスタムGem", "Custom Gem"];

  const markHidden = (el) => {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    if (el.dataset && el.dataset.gemIconChangerHidden === "1") return;
    // レイアウト崩れを避けるため「削除」ではなく非表示にする
    el.style.display = "none";
    if (el.dataset) el.dataset.gemIconChangerHidden = "1";
  };

  const maybeHideByText = (root) => {
    if (!root) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = (node.nodeValue || "").trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        if (TARGET_TEXTS.includes(text)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      },
    });

    let hiddenAny = false;
    let foundCount = 0;
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const el = textNode.parentElement;
      if (!el) continue;

      // 余計な巻き込みを避けるため、テキストだけを表示している要素を優先
      // (ボタン等の場合は親を消すと危険なので、その要素だけを消す)
      markHidden(el);
      hiddenAny = true;

      // 想定以上に広範囲にヒットしたときの安全弁
      foundCount += 1;
      if (foundCount >= 20) break;
    }
    return hiddenAny;
  };

  // 1) まずはGemのアイコン表示周辺(会話ヘッダ付近)を探索
  const logoTargets = document.querySelectorAll(".bot-logo-text");
  for (const logo of logoTargets) {
    const container =
      logo.closest("header") ||
      logo.closest('[role="banner"]') ||
      logo.closest("nav") ||
      logo.parentElement;
    if (container && maybeHideByText(container)) return;
  }

  // 2) フォールバック: body直下で軽量探索
  maybeHideByText(document.body);
}

function getGemDisplayName() {
  const titleElement = document.querySelector("title");
  if (titleElement && titleElement.textContent) {
    const title = titleElement.textContent
      .replace(/^Gemini\s*[-–—]\s*/, "")
      .trim();
    if (title && title !== "Gemini") {
      return title;
    }
  }

  const h1Element = document.querySelector("h1");
  if (h1Element && h1Element.textContent) {
    return h1Element.textContent.trim();
  }

  const gemId = getGemId();
  return gemId ? `Gem ${gemId.substring(0, 8)}...` : null;
}

function replaceGeminiIcon() {
  if (!chrome.runtime?.id) {
    return;
  }

  const gemId = getGemId();
  if (!gemId) return;

  chrome.storage.local.get(["gemIcons"], (result) => {
    if (chrome.runtime.lastError) {
      return;
    }

    const gemIcons = result.gemIcons || {};
    const myIconData = gemIcons[gemId];

    if (!myIconData) return;

    const targets = document.querySelectorAll(".bot-logo-text");

    targets.forEach((div) => {
      if (div.querySelector(".custom-gemini-icon")) {
        return;
      }

      div.innerText = "";

      const img = document.createElement("img");
      img.src = myIconData;
      img.classList.add("custom-gemini-icon");
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";
      img.style.display = "block";

      div.appendChild(img);
    });
  });
}

let scheduled = false;
const scheduleUpdate = () => {
  if (scheduled) return;
  scheduled = true;
  // 連続したDOM更新をまとめて処理して負荷を下げる
  requestAnimationFrame(() => {
    scheduled = false;
    replaceGeminiIcon();
    hideCustomGemLabel();
  });
};

const observer = new MutationObserver(() => {
  scheduleUpdate();
});

observer.observe(document.body, { childList: true, subtree: true });

scheduleUpdate();
