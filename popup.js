document.addEventListener("DOMContentLoaded", () => {
  function getElement(id) {
    return document.getElementById(id);
  }

  const pages = {
    instancesPage: getElement("instancesPage"),
    aboutPage: getElement("aboutPage"),
    documentationPage: getElement("documentationPage"),
    utilitiesPage: getElement("utilitiesPage"),
  };

  const resultsContainer = getElement("results");
  const loadingIndicator = getElement("loading");
  const searchForm = getElement("searchForm");
  const searchTermInput = getElement("searchTerm");

  const addInstanceInput = getElement("addInstanceInput");
  const addInstanceButton = getElement("addInstanceButton");
  const instancesContainer = getElement("instancesContainer");

  const addItemModal = getElement("addItemModal");
  const overlay = getElement("overlay");
  const itemNameInput = getElement("itemNameInput");
  const itemLinkInput = getElement("itemLinkInput");
  const confirmAddItemButton = getElement("confirmAddItemButton");
  const cancelAddItemButton = getElement("cancelAddItemButton");

  const editCategoryModal = getElement("editCategoryModal");
  const categoryNameInput = getElement("categoryNameInput");
  const confirmEditCategoryButton = getElement("confirmEditCategoryButton");
  const cancelEditCategoryButton = getElement("cancelEditCategoryButton");

  function showPage(page) {
    Object.values(pages).forEach((p) => p.classList.remove("active"));
    page.classList.add("active");
  }

  showPage(pages.aboutPage);

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

  function activateMenuItem(menuId) {
    document.querySelectorAll("nav ul li a").forEach((link) => {
      link.classList.remove("active");
    });

    const activeLink = document.getElementById(menuId);
    activeLink.classList.add("active");
  }

  function saveInstances(instances) {
    chrome.storage.local.set({ instances }, () => {
      if (chrome.runtime.lastError) {
        console.error("Erro ao salvar instâncias:", chrome.runtime.lastError);
      }
    });
  }

  function loadInstances() {
    chrome.storage.local.get(["instances"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Erro ao carregar instâncias:", chrome.runtime.lastError);
        return;
      }
      const instances = result.instances || [];
      instancesContainer.innerHTML = "";
      instances.forEach(renderInstance);
    });
  }

  function renderInstance(instance) {
    const instanceDiv = document.createElement("div");
    instanceDiv.classList.add("instance");
    instanceDiv.innerHTML = `
          <h3>
              ${instance.name}
              <div style="display: flex; gap: 5px;">
              <button class="deleteButton">X</button>
              <button class="editCategoryButton">Editar</button>
              </div>
          </h3>
          <div class="itemsContainer"></div>
      `;

    const itemsContainer = instanceDiv.querySelector(".itemsContainer");
    instance.items.forEach((item) =>
      renderItem(item, instance, itemsContainer)
    );

    const addItemButton = document.createElement("button");
    addItemButton.textContent = "+";
    addItemButton.classList.add("addItemButton");
    addItemButton.addEventListener("click", () =>
      openAddItemModal(instance, itemsContainer)
    );
    instanceDiv.appendChild(addItemButton);

    instanceDiv.querySelector(".deleteButton").addEventListener("click", () => {
      if (confirm(`Deseja deletar a categoria "${instance.name}"?`)) {
        instanceDiv.remove();
        saveInstances(getAllInstances());
      }
    });

    instanceDiv
      .querySelector(".editCategoryButton")
      .addEventListener("click", () =>
        openEditCategoryModal(instance, instanceDiv)
      );

    instancesContainer.appendChild(instanceDiv);
  }

  function renderItem(item, instance, itemsContainer) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.innerHTML = `
          <a href="${item.link}" target="_blank">${item.name}</a>
          <div style="display: flex; gap: 5px;">
          <button class="deleteButton">X</button>
          <button class="editItemButton">Editar</button>
          </div>
      `;

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

    itemDiv
      .querySelector(".editItemButton")
      .addEventListener("click", () =>
        openEditItemModal(item, instance, itemDiv)
      );

    itemsContainer.appendChild(itemDiv);
  }

  function getAllInstances() {
    return Array.from(instancesContainer.querySelectorAll(".instance")).map(
      (instanceDiv) => {
        const name = instanceDiv
          .querySelector("h3")
          .childNodes[0].textContent.trim();
        const items = Array.from(instanceDiv.querySelectorAll(".item")).map(
          (itemDiv) => {
            return {
              name: itemDiv.querySelector("a").textContent.trim(),
              link: itemDiv.querySelector("a").href,
            };
          }
        );
        return { name, items };
      }
    );
  }

  addInstanceButton.addEventListener("click", () => {
    const instanceName = addInstanceInput.value.trim();
    if (instanceName) {
      const newInstance = { name: instanceName, items: [] };
      renderInstance(newInstance);
      addInstanceInput.value = "";
      saveInstances(getAllInstances());
    } else {
      alert("Por favor, insira um nome para a instância.");
    }
  });

  function openAddItemModal(instance, itemsContainer) {
    addItemModal.classList.add("active");
    overlay.classList.add("active");

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

  function openEditCategoryModal(instance, instanceDiv) {
    editCategoryModal.classList.add("active");
    overlay.classList.add("active");

    categoryNameInput.value = instance.name;

    confirmEditCategoryButton.onclick = () => {
      const updatedName = categoryNameInput.value.trim();
      if (updatedName) {
        instance.name = updatedName;
        instanceDiv.querySelector("h3").childNodes[0].textContent = updatedName;
        saveInstances(getAllInstances());
        closeModal(editCategoryModal);
      } else {
        alert("Por favor, insira um nome válido para a instância.");
      }
    };

    cancelEditCategoryButton.onclick = () => closeModal(editCategoryModal);
    overlay.onclick = () => closeModal(editCategoryModal);
  }

  function openEditItemModal(item, instance, itemDiv) {
    addItemModal.classList.add("active");
    overlay.classList.add("active");

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

  function closeModal(modal) {
    modal.classList.remove("active");
    overlay.classList.remove("active");
    resetInputs(itemNameInput, itemLinkInput, categoryNameInput);
  }

  function resetInputs(...inputs) {
    inputs.forEach((input) => (input.value = ""));
  }

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

      articles.forEach((article, index) => {
        if (index >= 5) return;

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
        resultDiv.classList.add("result");
        resultDiv.innerHTML = `
                  <h3><a href="${href}" target="_blank">${title}</a></h3>
                  <p>${date}</p>
                  <p>${description}</p>
              `;
        resultsContainer.appendChild(resultDiv);
      });
    } catch (error) {
      resultsContainer.innerHTML = "<p>Erro ao buscar resultados.</p>";
    } finally {
      loadingIndicator.style.display = "none";
    }
  });

  loadInstances();
});
