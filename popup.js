document.addEventListener("DOMContentLoaded", () => {
  // Função auxiliar para obter elementos pelo ID
  const getElement = (id) => document.getElementById(id);

  // Elementos das páginas
  const pages = {
    instancesPage: getElement("instancesPage"),
    aboutPage: getElement("aboutPage"),
    documentationPage: getElement("documentationPage"),
    utilitiesPage: getElement("utilitiesPage"),
  };

  // Outros elementos do popup
  const resultsContainer = getElement("results");
  const loadingIndicator = getElement("loading");
  const searchForm = getElement("searchForm");
  const searchTermInput = getElement("searchTerm");

  const addInstanceInput = getElement("addInstanceInput");
  const addInstanceButton = getElement("addInstanceButton");
  const instancesContainer = getElement("instancesContainer");

  // Elementos dos modais para empresas e instâncias
  const overlay = getElement("overlay");

  const editCategoryModal = getElement("editCategoryModal");
  const categoryNameInput = getElement("categoryNameInput");
  const confirmEditCategoryButton = getElement("confirmEditCategoryButton");
  const cancelEditCategoryButton = getElement("cancelEditCategoryButton");

  const addItemModal = getElement("addItemModal");
  const itemNameInput = getElement("itemNameInput");
  const itemLinkInput = getElement("itemLinkInput");
  const confirmAddItemButton = getElement("confirmAddItemButton");
  const cancelAddItemButton = getElement("cancelAddItemButton");

  // Exibir uma página específica
  function showPage(page) {
    Object.values(pages).forEach((p) => p.classList.remove("active"));
    page.classList.add("active");
  }

  // Inicializa com a página "Sobre"
  showPage(pages.aboutPage);

  // Navegação entre as páginas
  getElement("aboutPageLink").addEventListener("click", () => {
    showPage(pages.aboutPage);
    activateMenuItem("aboutPageLink");
  });
  getElement("documentationPageLink").addEventListener("click", () => {
    showPage(pages.documentationPage);
    activateMenuItem("documentationPageLink");
  });
  getElement("instancesPageLink").addEventListener("click", () => {
    showPage(pages.instancesPage);
    activateMenuItem("instancesPageLink");
  });
  getElement("utilitiesPageLink").addEventListener("click", () => {
    showPage(pages.utilitiesPage);
    activateMenuItem("utilitiesPageLink");
  });

  // Ativar o item de menu selecionado
  function activateMenuItem(menuId) {
    document.querySelectorAll("nav ul li a").forEach((link) => {
      link.classList.remove("active");
    });
    getElement(menuId).classList.add("active");
  }

  // Funções de armazenamento
  function saveInstances(instances) {
    chrome.storage.local.set({ instances });
  }

  function loadInstances() {
    chrome.storage.local.get(["instances"], (result) => {
      const instances = result.instances || [];
      instancesContainer.innerHTML = "";
      instances.forEach(renderInstance);
    });
  }

  // Funções auxiliares para modais
  function showModal(modal) {
    modal.classList.add("active");
    overlay.classList.add("active");
  }

  function closeModal(modal) {
    modal.classList.remove("active");
    overlay.classList.remove("active");
    resetInputs(itemNameInput, itemLinkInput, categoryNameInput);
  }

  function resetInputs(...inputs) {
    inputs.forEach((input) => (input.value = ""));
  }

  // Renderizar uma empresa e suas instancias
  function renderInstance(instance) {
    const instanceDiv = document.createElement("div");
    instanceDiv.classList.add("instance");
    instanceDiv.innerHTML = `
      <h3>
        ${instance.name}
        <div style="display: flex; gap: 5px;">
          <button class="deleteButton">X</button>
          <button class="editCategoryButton">☰</button>
        </div>
      </h3>
      <div class="itemsContainer"></div>
    `;

    const itemsContainer = instanceDiv.querySelector(".itemsContainer");
    instance.items.forEach((item) =>
      renderItem(item, instance, itemsContainer)
    );

    // Botão para adicionar uma nova instância para a empresa
    const addItemButton = document.createElement("button");
    addItemButton.textContent = "+";
    addItemButton.classList.add("addItemButton");
    addItemButton.addEventListener("click", () =>
      openAddItemModal(instance, itemsContainer)
    );
    instanceDiv.appendChild(addItemButton);

    // Deletar a empresa
    instanceDiv.querySelector(".deleteButton").addEventListener("click", () => {
      if (confirm(`Deseja deletar a empresa "${instance.name}"?`)) {
        instanceDiv.remove();
        saveInstances(getAllInstances());
      }
    });

    // Editar o nome da empresa
    instanceDiv
      .querySelector(".editCategoryButton")
      .addEventListener("click", () =>
        openEditCategoryModal(instance, instanceDiv)
      );

    instancesContainer.appendChild(instanceDiv);
  }

  // Renderizar uma instância dentro de uma empresa
  function renderItem(item, instance, itemsContainer) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.innerHTML = `
      <a href="${item.link}" target="_blank">${item.name}</a>
      <div style="display: flex; gap: 5px;">
        <button class="deleteButton">X</button>
        <button class="editItemButton">☰</button>
      </div>
    `;

    // Deletar a instância
    itemDiv.querySelector(".deleteButton").addEventListener("click", () => {
      const itemIndex = instance.items.findIndex(
        (i) => i.name === item.name && i.link === item.link
      );
      if (itemIndex > -1) {
        instance.items.splice(itemIndex, 1);
        itemDiv.remove();
        saveInstances(getAllInstances());
      }
    });

    // Editar a instância
    itemDiv
      .querySelector(".editItemButton")
      .addEventListener("click", () =>
        openEditItemModal(item, instance, itemDiv)
      );

    itemsContainer.appendChild(itemDiv);
  }

  // Extrair todas as empresas e suas instâncias do DOM
  function getAllInstances() {
    return Array.from(instancesContainer.querySelectorAll(".instance")).map(
      (instanceDiv) => {
        const name = instanceDiv
          .querySelector("h3")
          .childNodes[0].textContent.trim();
        const items = Array.from(instanceDiv.querySelectorAll(".item")).map(
          (itemDiv) => ({
            name: itemDiv.querySelector("a").textContent.trim(),
            link: itemDiv.querySelector("a").href,
          })
        );
        return { name, items };
      }
    );
  }

  // Adicionar uma nova empresa
  addInstanceButton.addEventListener("click", () => {
    const instanceName = addInstanceInput.value.trim();
    if (instanceName) {
      const newInstance = { name: instanceName, items: [] };
      renderInstance(newInstance);
      addInstanceInput.value = "";
      saveInstances(getAllInstances());
    } else {
      alert("Por favor, insira um nome para a empresa.");
    }
  });

  // Abrir o modal de adicionar instância
  function openAddItemModal(instance, itemsContainer) {
    showModal(addItemModal);
    itemNameInput.value = "";
    itemLinkInput.value = "";

    confirmAddItemButton.onclick = () => {
      const itemName = itemNameInput.value.trim();
      const itemLink = itemLinkInput.value.trim();
      if (itemName && itemLink) {
        const newItem = { name: itemName, link: itemLink };
        instance.items.push(newItem);
        renderItem(newItem, instance, itemsContainer);
        saveInstances(getAllInstances());
        closeModal(addItemModal);
      } else {
        alert("Por favor, preencha todos os campos.");
      }
    };

    cancelAddItemButton.onclick = () => closeModal(addItemModal);
    overlay.onclick = () => closeModal(addItemModal);
  }

  // Abrir o modal de editar o nome da empresa
  function openEditCategoryModal(instance, instanceDiv) {
    showModal(editCategoryModal);
    categoryNameInput.value = instance.name;

    confirmEditCategoryButton.onclick = () => {
      const updatedName = categoryNameInput.value.trim();
      if (updatedName) {
        instance.name = updatedName;
        instanceDiv.querySelector("h3").childNodes[0].textContent = updatedName;
        saveInstances(getAllInstances());
        closeModal(editCategoryModal);
      } else {
        alert("Por favor, insira um nome válido para a empresa.");
      }
    };

    cancelEditCategoryButton.onclick = () => closeModal(editCategoryModal);
    overlay.onclick = () => closeModal(editCategoryModal);
  }

  // Abrir o modal de editar uma instância
  function openEditItemModal(item, instance, itemDiv) {
    showModal(addItemModal);
    itemNameInput.value = item.name;
    itemLinkInput.value = item.link;

    confirmAddItemButton.onclick = () => {
      const updatedName = itemNameInput.value.trim();
      const updatedLink = itemLinkInput.value.trim();
      if (updatedName && updatedLink) {
        item.name = updatedName;
        item.link = updatedLink;
        itemDiv.querySelector("a").textContent = updatedName;
        itemDiv.querySelector("a").href = updatedLink;
        saveInstances(getAllInstances());
        closeModal(addItemModal);
      } else {
        alert("Por favor, preencha todos os campos.");
      }
    };

    cancelAddItemButton.onclick = () => closeModal(addItemModal);
    overlay.onclick = () => closeModal(addItemModal);
  }

  // Escapar caracteres especiais em uma string
  function escaparRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Submissão do formulário de busca
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const searchTerm = searchTermInput.value.trim();
    if (!searchTerm) return;

    resultsContainer.innerHTML = "";
    loadingIndicator.style.display = "block";

    try {
      const response = await fetch(
        `https://servicenowguru.com/?s=${encodeURIComponent(searchTerm)}`
      );
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const articles = doc.querySelectorAll(
        "article.fusion-post-medium-alternate"
      );

      // Cria uma regex com word boundaries para o termo de busca
      const regex = new RegExp(`\\b${escaparRegex(searchTerm)}\\b`, "i");

      // Filtra os artigos que tenham a palavra inteira
      const filteredArticles = Array.from(articles).filter((article) => {
        const titleElement = article.querySelector("h2.entry-title a");
        const title = titleElement ? titleElement.textContent.trim() : "";
        return regex.test(title);
      });

      // Cria e exibe o cabeçalho dos resultados
      const resultsHeader = document.createElement("h2");
      resultsHeader.classList.add("results-header");
      resultsHeader.textContent =
        filteredArticles.length > 0
          ? `${filteredArticles.length} resultado(s) encontrado(s)`
          : "Nenhum resultado encontrado";
      resultsContainer.appendChild(resultsHeader);

      // Renderiza cada artigo filtrado
      filteredArticles.forEach((article) => {
        const titleElement = article.querySelector("h2.entry-title a");
        const dateElement = article.querySelector(
          ".fusion-single-line-meta span:nth-of-type(3)"
        );
        const descriptionElement =
          article.querySelector(
            ".fusion-post-content-container p:nth-of-type(2)"
          ) || article.querySelector(".fusion-post-content-container p");

        const title =
          titleElement?.textContent.trim() || "Título não encontrado";
        const href = titleElement?.href || "#";
        const date = dateElement?.textContent.trim() || "Data não encontrada";
        const description =
          descriptionElement?.textContent.trim() || "Descrição não encontrada";

        const resultDiv = document.createElement("div");
        resultDiv.classList.add("result", "container-kn");
        resultDiv.innerHTML = `
          <h3>${title}</h3>
          <p class="date">${date}</p>
          <p>${description} <a href="${href}" target="_blank" class="read-more">Leia mais →</a></p>
        `;
        resultsContainer.appendChild(resultDiv);
      });
    } catch (error) {
      resultsContainer.innerHTML = "<p>Erro ao buscar resultados.</p>";
    } finally {
      loadingIndicator.style.display = "none";
    }
  });

  // Carrega as instâncias salvas assim que o DOM estiver pronto
  loadInstances();
});
