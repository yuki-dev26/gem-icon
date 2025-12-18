function getGemId() {
  const match = window.location.pathname.match(/\/gem\/([^\/\?#]+)/);
  return match ? match[1] : null;
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
  return gemId ? `GemId ${gemId.substring(0, 8)}...` : null;
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
      img.style.borderRadius = "8px";
      img.style.objectFit = "cover";
      img.style.display = "block";

      div.appendChild(img);
    });

    // カスタムGemラベルを非表示にする
    const labels = document.querySelectorAll(".bot-name-ugc-label");
    labels.forEach((label) => {
      label.style.display = "none";
    });
  });
}

const observer = new MutationObserver(() => {
  replaceGeminiIcon();
});

observer.observe(document.body, { childList: true, subtree: true });

replaceGeminiIcon();
