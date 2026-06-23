import { getCategories } from "../../../utils/services/getCategories";
import { checkUserRole } from "../../../utils/checkUserRole";
import type { ICategory } from "../../../types/category";
import "../../../utils/renderHeader";

checkUserRole("ADMIN");

const categoriesTableBody = document.getElementById(
  "categoriesTableBody",
) as HTMLTableSectionElement | null;
const categoryModal = document.getElementById("categoryModal");
const categoryModalTitle = document.getElementById("categoryModalTitle");
const categoryForm = document.getElementById(
  "categoryForm",
) as HTMLFormElement | null;
const categoryIdInput = document.getElementById(
  "categoryId",
) as HTMLInputElement | null;
const categoryNameInput = document.getElementById(
  "categoryNombre",
) as HTMLInputElement | null;
const categoryDescriptionInput = document.getElementById(
  "categoryDescripcion",
) as HTMLTextAreaElement | null;

let categoriesState: ICategory[] = [];
let editingCategoryId: number | null = null;

const closeCategoryModal = () => {
  categoryModal?.classList.add("hidden");
  categoryForm?.reset();
  editingCategoryId = null;

  if (categoryModalTitle) {
    categoryModalTitle.textContent = "Nueva categoría";
  }
};

const openCategoryModal = (category?: ICategory) => {
  categoryModal?.classList.remove("hidden");

  if (!category) {
    editingCategoryId = null;
    if (categoryModalTitle) {
      categoryModalTitle.textContent = "Nueva categoría";
    }
    if (categoryIdInput) categoryIdInput.value = "";
    if (categoryNameInput) categoryNameInput.value = "";
    if (categoryDescriptionInput) categoryDescriptionInput.value = "";
    return;
  }

  editingCategoryId = category.id;
  if (categoryModalTitle) {
    categoryModalTitle.textContent = "Editar categoría";
  }
  if (categoryIdInput) categoryIdInput.value = String(category.id);
  if (categoryNameInput) categoryNameInput.value = category.nombre;
  if (categoryDescriptionInput)
    categoryDescriptionInput.value = category.descripcion;
};

const renderCategories = () => {
  if (!categoriesTableBody) {
    return;
  }

  if (!categoriesState.length) {
    categoriesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-muted-foreground">
          No hay categorías cargadas.
        </td>
      </tr>
    `;
    return;
  }

  categoriesTableBody.innerHTML = categoriesState
    .map((category) => {
      return `
        <tr class="*:p-2">
          <td>${category.id}</td>
          <td>
            <div class="size-12 rounded-md bg-card"></div>
          </td>
          <td>${category.nombre}</td>
          <td>${category.descripcion}</td>
          <td>
            <div class="flex gap-2">
              <button type="button" class="button button--small secondary" data-action="edit-category" data-category-id="${category.id}">Editar</button>
              <button type="button" class="button button--small bg-error/80 text-white" data-action="delete-category" data-category-id="${category.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  const categories = await getCategories();
  categoriesState = categories ?? [];
  renderCategories();
});

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const createButton = target.closest("[data-action='create-category']");

  if (createButton) {
    openCategoryModal();
    return;
  }

  const editButton = target.closest(
    "[data-action='edit-category']",
  ) as HTMLElement | null;
  if (editButton) {
    const categoryId = Number(editButton.dataset.categoryId);
    const category = categoriesState.find((item) => item.id === categoryId);

    if (category) {
      openCategoryModal(category);
    }
    return;
  }

  const deleteButton = target.closest(
    "[data-action='delete-category']",
  ) as HTMLElement | null;

  if (deleteButton) {
    const categoryId = Number(deleteButton.dataset.categoryId);
    const category = categoriesState.find((item) => item.id === categoryId);

    if (!category) {
      return;
    }

    const shouldDelete = window.confirm(
      `¿Eliminar la categoría "${category.nombre}"?`,
    );

    if (shouldDelete) {
      categoriesState = categoriesState.filter(
        (item) => item.id !== categoryId,
      );
      renderCategories();
    }
  }
});

categoryForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!categoryNameInput || !categoryDescriptionInput) {
    return;
  }

  const nombre = categoryNameInput.value.trim();
  const descripcion = categoryDescriptionInput.value.trim();

  if (!nombre || !descripcion) {
    window.alert("Completá todos los campos.");
    return;
  }

  if (editingCategoryId) {
    categoriesState = categoriesState.map((category) =>
      category.id === editingCategoryId
        ? { ...category, nombre, descripcion }
        : category,
    );
  } else {
    const newCategory: ICategory = {
      id: Date.now(),
      nombre,
      descripcion,
    };
    categoriesState = [newCategory, ...categoriesState];
  }

  renderCategories();
  closeCategoryModal();
});

document
  .getElementById("closeCategoryModal")
  ?.addEventListener("click", closeCategoryModal);
document
  .getElementById("cancelCategoryModal")
  ?.addEventListener("click", closeCategoryModal);

categoryModal?.addEventListener("click", (event) => {
  if (event.target === categoryModal) {
    closeCategoryModal();
  }
});
