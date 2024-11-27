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

  // Funções para manipulação de modais
  const addItemModal = document.getElementById("addItemModal");
  const editCategoryModal = document.getElementById("editCategoryModal");

  const saveItemButton = document.getElementById("saveItemButton");
  const cancelItemButton = document.getElementById("cancelItemButton");
  const saveCategoryButton = document.getElementById("saveCategoryButton");
  const cancelCategoryButton = document.getElementById("cancelCategoryButton");

  const itemNameInput = document.getElementById("itemNameInput");
  const itemLinkInput = document.getElementById("itemLinkInput");
  const categoryNameInput = document.getElementById("categoryNameInput");

  // Abrir modal para adicionar item
  function openAddItemModal() {
    addItemModal.style.display = "block";
  }

  // Fechar modal para adicionar item
  function closeAddItemModal() {
    addItemModal.style.display = "none";
    itemNameInput.value = "";
    itemLinkInput.value = "";
  }

  // Abrir modal para editar categoria
  function openEditCategoryModal(currentName) {
    editCategoryModal.style.display = "block";
    categoryNameInput.value = currentName;
  }

  // Fechar modal para editar categoria
  function closeEditCategoryModal() {
    editCategoryModal.style.display = "none";
    categoryNameInput.value = "";
  }

  // Eventos dos botões de adicionar item
  saveItemButton.addEventListener("click", () => {
    const itemName = itemNameInput.value.trim();
    const itemLink = itemLinkInput.value.trim();
    if (itemName && itemLink) {
      console.log("Salvar Item:", itemName, itemLink);
      closeAddItemModal();
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  });

  cancelItemButton.addEventListener("click", closeAddItemModal);

  // Eventos dos botões de editar categoria
  saveCategoryButton.addEventListener("click", () => {
    const categoryName = categoryNameInput.value.trim();
    if (categoryName) {
      console.log("Salvar Categoria:", categoryName);
      closeEditCategoryModal();
    } else {
      alert("Por favor, preencha o nome da categoria.");
    }
  });

  cancelCategoryButton.addEventListener("click", closeEditCategoryModal);

  loadInstances((instances) => {
    console.log("Instâncias disponíveis:", instances);
  });
});
