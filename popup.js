const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    previewImg.style.display = "none";
    previewImg.style.opacity = "0";
    saveBtn.disabled = true;
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    previewImg.src = ev.target.result;
    previewImg.style.display = "inline-block";
    setTimeout(() => (previewImg.style.opacity = "1"), 10);
    saveBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

saveBtn.addEventListener("click", () => {
  const file = fileInput.files[0];

  if (!file) {
    alert("画像が選択されていません。");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageData = e.target.result;
    chrome.storage.local.set({ geminiIcon: imageData }, () => {
      alert("保存しました！Geminiのページをリロードしてください。");
    });
  };
  reader.readAsDataURL(file);
});
