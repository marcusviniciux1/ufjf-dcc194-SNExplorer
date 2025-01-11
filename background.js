chrome.runtime.onInstalled.addListener(() => {
  console.log("SN Explorer instalado com sucesso!");

  chrome.contextMenus.create({
    id: "pasteTest",
    title: "Colar texto: teste",
    contexts: ["editable"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "pasteTest") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === "TEXTAREA" ||
            activeElement.tagName === "INPUT")
        ) {
          activeElement.value += "teste";
        }
      },
    });
  }
});
