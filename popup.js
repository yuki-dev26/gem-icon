const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");
const gemList = document.getElementById("gemList");
const dropZone = document.getElementById("dropZone");

let currentGemId = null;
let currentGemDisplayName = null;

async function getCurrentGemInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || !tab.url.includes("gemini.google.com/gem/")) {
    alert("⚠️ Gemページで拡張機能を開いてください");
    window.close();
    return null;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const match = window.location.pathname.match(/\/gem\/([^\/\?#]+)/);
        if (!match) return null;

        const gemId = match[1];

        let displayName = null;
        const titleElement = document.querySelector("title");
        if (titleElement && titleElement.textContent) {
          const title = titleElement.textContent
            .replace(/^Gemini\s*[-–—]\s*/, "")
            .trim();
          if (title && title !== "Gemini") {
            displayName = title;
          }
        }

        if (!displayName) {
          const h1Element = document.querySelector("h1");
          if (h1Element && h1Element.textContent) {
            displayName = h1Element.textContent.trim();
          }
        }

        if (!displayName) {
          displayName = `Gem ${gemId.substring(0, 8)}...`;
        }

        return { gemId, displayName };
      },
    });

    const result = results[0].result;
    if (result && result.gemId) {
      currentGemId = result.gemId;
      currentGemDisplayName = result.displayName;

      chrome.storage.local.get(
        ["gemIcons", "gemDisplayNames"],
        (storageResult) => {
          const gemIcons = storageResult.gemIcons || {};
          if (gemIcons[currentGemId]) {
            previewImg.src = gemIcons[currentGemId];
            dropZone.classList.add("has-image");
            saveBtn.disabled = false;
          }
        }
      );

      return result.gemId;
    }
  } catch (error) {
    console.error("Error getting gem info:", error);
  }

  alert("Gem情報を取得できませんでした");
  return null;
}

function displayGemList() {
  chrome.storage.local.get(["gemIcons", "gemDisplayNames"], (result) => {
    const gemIcons = result.gemIcons || {};
    const gemDisplayNames = result.gemDisplayNames || {};
    const entries = Object.entries(gemIcons);

    if (entries.length === 0) {
      gemList.innerHTML = '<p class="no-gems">設定済みのGemはありません</p>';
      return;
    }

    gemList.innerHTML = entries
      .map(([gemId, iconData]) => {
        const displayName =
          gemDisplayNames[gemId] || `Gem ${gemId.substring(0, 8)}...`;
        return `
      <div class="gem-item">
        <img src="${iconData}" class="gem-item-icon" alt="${displayName}のアイコン" title="${displayName}" />
        <button class="delete-gem-btn" data-gem-id="${gemId}">×</button>
      </div>
    `;
      })
      .join("");

    document.querySelectorAll(".delete-gem-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const gemId = e.target.getAttribute("data-gem-id");
        deleteGemIcon(gemId);
      });
    });
  });
}

function deleteGemIcon(gemId) {
  chrome.storage.local.get(["gemIcons", "gemDisplayNames"], (result) => {
    const gemIcons = result.gemIcons || {};
    const gemDisplayNames = result.gemDisplayNames || {};

    if (!confirm(`アイコンの設定を削除しますか?`)) return;

    delete gemIcons[gemId];
    delete gemDisplayNames[gemId];

    chrome.storage.local.set({ gemIcons, gemDisplayNames }, async () => {
      displayGemList();
      if (gemId === currentGemId) {
        previewImg.src = "";
        dropZone.classList.remove("has-image");
        fileInput.value = "";
        saveBtn.disabled = true;
      }
      alert(`アイコンの設定を削除しました`);

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.id) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
}

function handleImageFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("画像ファイルを選択してください");
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    previewImg.src = ev.target.result;
    dropZone.classList.add("has-image");
    saveBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    handleImageFile(file);
  }
});

dropZone.addEventListener("click", (e) => {
  if (e.target !== fileInput && !e.target.closest(".file-input-label")) {
    fileInput.click();
  }
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");

  const file = e.dataTransfer.files[0];
  if (file) {
    handleImageFile(file);
  }
});

saveBtn.addEventListener("click", () => {
  if (!currentGemId) {
    alert("Gem情報を取得できませんでした。");
    return;
  }

  const file = fileInput.files[0];
  let imageDataToSave;

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imageDataToSave = e.target.result;
      saveToStorage(imageDataToSave);
    };
    reader.readAsDataURL(file);
  } else if (previewImg.src && previewImg.src.startsWith("data:")) {
    imageDataToSave = previewImg.src;
    saveToStorage(imageDataToSave);
  } else {
    alert("画像が選択されていません。");
    return;
  }
});

function saveToStorage(imageData) {
  chrome.storage.local.get(["gemIcons", "gemDisplayNames"], (result) => {
    const gemIcons = result.gemIcons || {};
    const gemDisplayNames = result.gemDisplayNames || {};

    gemIcons[currentGemId] = imageData;
    gemDisplayNames[currentGemId] = currentGemDisplayName;

    chrome.storage.local.set({ gemIcons, gemDisplayNames }, async () => {
      alert(`アイコンを保存しました！`);
      displayGemList();

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.id) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
}

getCurrentGemInfo();
displayGemList();
