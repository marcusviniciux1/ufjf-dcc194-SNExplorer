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

  let currentEditingInstance = null;
  let allInstances = [];

  // Abrir modal para adicionar item
  function openAddItemModal(instance) {
    currentEditingInstance = instance;
    addItemModal.style.display = "block";
  }

  // Fechar modal para adicionar item
  function closeAddItemModal() {
    addItemModal.style.display = "none";
    itemNameInput.value = "";
    itemLinkInput.value = "";
    currentEditingInstance = null;
    // Restaurar comportamento original do botão de salvar
    saveItemButton.textContent = "Salvar";
    saveItemButton.onclick = originalSaveItem;
  }

  // Abrir modal para editar categoria
  function openEditCategoryModal(instance) {
    currentEditingInstance = instance;
    editCategoryModal.style.display = "block";
    categoryNameInput.value = instance.name;
  }

  // Fechar modal para editar categoria
  function closeEditCategoryModal() {
    editCategoryModal.style.display = "none";
    categoryNameInput.value = "";
    currentEditingInstance = null;
  }

  // Eventos dos botões de adicionar item
  const originalSaveItem = saveItemButton.onclick;

  saveItemButton.addEventListener("click", () => {
    const itemName = itemNameInput.value.trim();
    const itemLink = itemLinkInput.value.trim();
    if (itemName && itemLink && currentEditingInstance) {
      const newItem = { name: itemName, link: itemLink };
      currentEditingInstance.items.push(newItem);
      saveInstances(allInstances);
      renderInstances();
      closeAddItemModal();
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  });

  cancelItemButton.addEventListener("click", closeAddItemModal);

  // Eventos dos botões de editar categoria
  saveCategoryButton.addEventListener("click", () => {
    const categoryName = categoryNameInput.value.trim();
    if (categoryName && currentEditingInstance) {
      currentEditingInstance.name = categoryName;
      saveInstances(allInstances);
      renderInstances();
      closeEditCategoryModal();
    } else {
      alert("Por favor, preencha o nome da categoria.");
    }
  });

  cancelCategoryButton.addEventListener("click", closeEditCategoryModal);

  // Função para renderizar as instâncias na UI
  function renderInstances() {
    const instancesContainer = document.getElementById("instancesContainer");
    // Limpar conteúdo atual
    instancesContainer.innerHTML = "";

    if (allInstances.length === 0) {
      instancesContainer.innerHTML = "<p>Nenhuma instância adicionada.</p>";
      return;
    }

    allInstances.forEach((instance, index) => {
      const instanceDiv = document.createElement("div");
      instanceDiv.classList.add("instance");

      const instanceHeader = document.createElement("h3");
      instanceHeader.textContent = instance.name;

      const editButton = document.createElement("button");
      editButton.textContent = "Editar Categoria";
      editButton.addEventListener("click", () =>
        openEditCategoryModal(instance)
      );

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Deletar Categoria";
      deleteButton.style.marginLeft = "10px";
      deleteButton.addEventListener("click", () => {
        if (confirm(`Deseja deletar a categoria "${instance.name}"?`)) {
          allInstances.splice(index, 1);
          saveInstances(allInstances);
          renderInstances();
        }
      });

      instanceHeader.appendChild(editButton);
      instanceHeader.appendChild(deleteButton);
      instanceDiv.appendChild(instanceHeader);

      if (instance.items.length > 0) {
        const itemsList = document.createElement("ul");
        instance.items.forEach((item, itemIndex) => {
          const itemLi = document.createElement("li");

          const itemLink = document.createElement("a");
          itemLink.href = item.link;
          itemLink.textContent = item.name;
          itemLink.target = "_blank";

          const editItemButton = document.createElement("button");
          editItemButton.textContent = "Editar";
          editItemButton.style.marginLeft = "10px";
          editItemButton.addEventListener("click", () =>
            openEditItemModal(instance, item, itemIndex)
          );

          const deleteItemButton = document.createElement("button");
          deleteItemButton.textContent = "X";
          deleteItemButton.style.marginLeft = "5px";
          deleteItemButton.addEventListener("click", () => {
            if (confirm(`Deseja deletar o item "${item.name}"?`)) {
              instance.items.splice(itemIndex, 1);
              saveInstances(allInstances);
              renderInstances();
            }
          });

          itemLi.appendChild(itemLink);
          itemLi.appendChild(editItemButton);
          itemLi.appendChild(deleteItemButton);
          itemsList.appendChild(itemLi);
        });
        instanceDiv.appendChild(itemsList);
      } else {
        const noItemsP = document.createElement("p");
        noItemsP.textContent = "Nenhum item adicionado.";
        instanceDiv.appendChild(noItemsP);
      }

      const addItemBtn = document.createElement("button");
      addItemBtn.textContent = "Adicionar Item";
      addItemBtn.style.marginTop = "10px";
      addItemBtn.addEventListener("click", () => openAddItemModal(instance));

      instanceDiv.appendChild(addItemBtn);
      instancesContainer.appendChild(instanceDiv);
    });
  }

  // Função para abrir modal de editar item
  function openEditItemModal(instance, item, itemIndex) {
    currentEditingInstance = { instance, item, itemIndex };
    addItemModal.style.display = "block";
    itemNameInput.value = item.name;
    itemLinkInput.value = item.link;

    // Alterar botão de salvar para editar
    saveItemButton.textContent = "Salvar Alterações";
    saveItemButton.onclick = () => {
      const updatedName = itemNameInput.value.trim();
      const updatedLink = itemLinkInput.value.trim();
      if (updatedName && updatedLink) {
        instance.items[itemIndex].name = updatedName;
        instance.items[itemIndex].link = updatedLink;
        saveInstances(allInstances);
        renderInstances();
        closeAddItemModal();
        // Reset botão de salvar para adicionar
        saveItemButton.textContent = "Salvar";
        saveItemButton.onclick = originalSaveItem;
      } else {
        alert("Por favor, preencha todos os campos.");
      }
    };
  }

  // Função para adicionar instâncias à UI
  function addInstanceToUI(instance) {
    allInstances.push(instance);
    saveInstances(allInstances);
    renderInstances();
  }

  // Função para realizar a busca na página KnowNow
  async function performSearch(searchTerm) {
    const loadingIndicator = document.getElementById("loading");
    const resultsContainer = document.getElementById("results");
    loadingIndicator.style.display = "block";
    resultsContainer.innerHTML = "";

    try {
      // Abre uma nova aba com a URL de busca
      const query = encodeURIComponent(searchTerm);
      const searchUrl = `https://servicenowguru.com/?s=${query}`;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractSearchResults,
      });
    } catch (error) {
      console.error("Erro ao realizar busca:", error);
      resultsContainer.innerHTML = "<p>Erro ao buscar resultados.</p>";
    } finally {
      loadingIndicator.style.display = "none";
    }
  }

  // Função para extrair resultados da página de busca
  function extractSearchResults() {
    const results = [];
    const articles = document.querySelectorAll(
      "article.fusion-post-medium-alternate"
    );

    articles.forEach((article, index) => {
      if (index >= 5) return; // Limitar aos 5 primeiros resultados

      const titleElement = article.querySelector("h2.entry-title a");
      const dateElement = article.querySelector(
        ".fusion-single-line-meta span:nth-of-type(3)"
      );
      let descriptionElement = article.querySelector(
        ".fusion-post-content-container p:nth-of-type(2)"
      );

      if (!descriptionElement || !descriptionElement.textContent.trim()) {
        descriptionElement = article.querySelector(
          ".fusion-post-content-container p"
        );
      }

      const title = titleElement
        ? titleElement.textContent.trim()
        : "Título não encontrado";
      const href = titleElement ? titleElement.href : "#";
      const date = dateElement
        ? dateElement.textContent.trim()
        : "Data não encontrada";
      const description = descriptionElement
        ? descriptionElement.textContent.trim()
        : "Descrição não encontrada";

      results.push({ title, href, date, description });
    });

    // Envia os resultados de volta para o popup
    chrome.runtime.sendMessage({ action: "searchResults", results });
  }

  // Listener para receber resultados da busca
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "searchResults") {
      const resultsContainer = document.getElementById("results");
      resultsContainer.innerHTML = "";

      if (message.results.length === 0) {
        resultsContainer.innerHTML = "<p>Nenhum resultado encontrado.</p>";
        return;
      }

      message.results.forEach((result) => {
        const resultDiv = document.createElement("div");
        resultDiv.classList.add("result");

        const title = document.createElement("h3");
        const titleLink = document.createElement("a");
        titleLink.href = result.href;
        titleLink.textContent = result.title;
        titleLink.target = "_blank";
        title.appendChild(titleLink);

        const date = document.createElement("p");
        date.textContent = result.date;

        const description = document.createElement("p");
        description.textContent = result.description;

        resultDiv.appendChild(title);
        resultDiv.appendChild(date);
        resultDiv.appendChild(description);

        resultsContainer.appendChild(resultDiv);
      });
    }
  });

  // Evento de submissão do formulário de busca
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById("searchTerm").value.trim();
    if (searchTerm) {
      performSearch(searchTerm);
    } else {
      alert("Por favor, insira um termo de busca.");
    }
  });

  // Carregar instâncias ao iniciar
  loadInstances((instances) => {
    allInstances = instances;
    renderInstances();
  });
});
