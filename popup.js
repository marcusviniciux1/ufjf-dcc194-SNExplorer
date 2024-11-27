document.addEventListener("DOMContentLoaded", () => {
  const aboutLink = document.getElementById("aboutPageLink");
  const documentationLink = document.getElementById("documentationPageLink");
  const instancesLink = document.getElementById("instancesPageLink");

  const aboutPage = document.getElementById("aboutPage");
  const documentationPage = document.getElementById("documentationPage");
  const instancesPage = document.getElementById("instancesPage");

  // Funções de armazenamento usando chrome.storage
  function saveInstances(instances) {
    chrome.storage.local.set({ instances }, () => {
      if (chrome.runtime.lastError) {
        console.error("Erro ao salvar instâncias:", chrome.runtime.lastError);
      } else {
        console.log("Instâncias salvas com sucesso.");
      }
    });
  }

  function loadInstances(callback) {
    chrome.storage.local.get(["instances"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Erro ao carregar instâncias:", chrome.runtime.lastError);
        callback([]);
      } else {
        console.log("Instâncias carregadas:", result.instances);
        callback(result.instances || []);
      }
    });
  }

  function showPage(page) {
    aboutPage.style.display = "none";
    documentationPage.style.display = "none";
    instancesPage.style.display = "none";
    page.style.display = "block";
  }

  aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(aboutPage);
  });

  documentationLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(documentationPage);
  });

  instancesLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(instancesPage);
  });

  // Exibe a página "Sobre" por padrão
  showPage(aboutPage);

  loadInstances((instances) => {
    console.log("Instâncias disponíveis:", instances);
  });
});
