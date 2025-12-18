chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_logs") {
    try {
      const logs = extractChatLogs();
      const jsonl = logs.map((log) => JSON.stringify(log)).join("\n");
      sendResponse({ jsonl: jsonl });
    } catch (e) {
      console.error("Extraction error:", e);
      sendResponse({ error: e.message });
    }
  }
  return true;
});

function extractChatLogs() {
  const logs = [];
  const allMessages = document.querySelectorAll(
    ".user-query-bubble-with-background, structured-content-container.model-response-text"
  );

  let currentEntry = null;

  allMessages.forEach((msg) => {
    let content = "";
    let type = "";

    if (msg.classList.contains("user-query-bubble-with-background")) {
      type = "input";
      const lines = msg.querySelectorAll(".query-text-line");
      if (lines.length > 0) {
        content = Array.from(lines)
          .map((line) => line.textContent)
          .join("\n");
      } else {
        const queryText = msg.querySelector(".query-text");
        content = queryText ? queryText.innerText : msg.innerText;
      }
    } else if (
      msg.tagName.toLowerCase() === "structured-content-container" ||
      msg.classList.contains("model-response-text")
    ) {
      type = "response";
      const markdown = msg.querySelector(".markdown");
      if (markdown) {
        content = markdown.innerText;
      } else {
        content = msg.innerText;
      }
    }

    if (content) {
      content = content.trim();

      if (type === "input") {
        if (currentEntry) {
          logs.push(currentEntry);
        }
        currentEntry = {
          time: null,
          input: content,
          response: null,
        };
      } else if (type === "response") {
        if (currentEntry) {
          currentEntry.response = content;
          logs.push(currentEntry);
          currentEntry = null;
        } else {
          logs.push({
            time: null,
            input: null,
            response: content,
          });
        }
      }
    }
  });

  if (currentEntry) {
    logs.push(currentEntry);
  }

  return logs;
}
