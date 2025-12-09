function replaceGeminiIcon() {
  if (!chrome.runtime?.id) {
    return;
  }

  chrome.storage.local.get(["geminiIcon"], (result) => {
    if (chrome.runtime.lastError) {
      return;
    }

    const myIconData = result.geminiIcon;
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

const observer = new MutationObserver(() => {
  replaceGeminiIcon();
});

observer.observe(document.body, { childList: true, subtree: true });

replaceGeminiIcon();
