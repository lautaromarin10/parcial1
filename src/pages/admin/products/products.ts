import { getProducts } from "../../../utils/services/getProducts";
import { getCategories } from "../../../utils/services/getCategories";
import { checkUserRole } from "../../../utils/checkUserRole";
import type { product } from "../../../types/product";
import type { ICategory } from "../../../types/category";
import "../../../utils/renderHeader";

checkUserRole("ADMIN");

const productsTableBody = document.getElementById(
  "productsTableBody",
) as HTMLTableSectionElement | null;
const productModal = document.getElementById("productModal");
const productModalTitle = document.getElementById("productModalTitle");
const productForm = document.getElementById(
  "productForm",
) as HTMLFormElement | null;
const productIdInput = document.getElementById(
  "productId",
) as HTMLInputElement | null;
const productNameInput = document.getElementById(
  "productNombre",
) as HTMLInputElement | null;
const productDescriptionInput = document.getElementById(
  "productDescripcion",
) as HTMLTextAreaElement | null;
const productPriceInput = document.getElementById(
  "productPrecio",
) as HTMLInputElement | null;
const productStockInput = document.getElementById(
  "productStock",
) as HTMLInputElement | null;
const productImageInput = document.getElementById(
  "productImagen",
) as HTMLInputElement | null;
const productCategorySelect = document.getElementById(
  "productCategoryId",
) as HTMLSelectElement | null;
const productAvailableInput = document.getElementById(
  "productDisponible",
) as HTMLInputElement | null;

let productsState: product[] = [];
let categoriesState: ICategory[] = [];
let editingProductId: number | null = null;

const closeProductModal = () => {
  productModal?.classList.add("hidden");
  productForm?.reset();
  editingProductId = null;

  if (productModalTitle) {
    productModalTitle.textContent = "Nuevo producto";
  }
};

const populateCategoryOptions = () => {
  if (!productCategorySelect) {
    return;
  }

  productCategorySelect.innerHTML = categoriesState
    .map(
      (category) =>
        `<option value="${category.id}">${category.nombre}</option>`,
    )
    .join("");
};

const openProductModal = (product?: product) => {
  productModal?.classList.remove("hidden");
  populateCategoryOptions();

  if (!product) {
    editingProductId = null;
    if (productModalTitle) productModalTitle.textContent = "Nuevo producto";
    if (productIdInput) productIdInput.value = "";
    if (productNameInput) productNameInput.value = "";
    if (productDescriptionInput) productDescriptionInput.value = "";
    if (productPriceInput) productPriceInput.value = "";
    if (productStockInput) productStockInput.value = "";
    if (productImageInput) productImageInput.value = "";
    if (productAvailableInput) productAvailableInput.checked = true;
    if (productCategorySelect && categoriesState.length) {
      productCategorySelect.value = String(categoriesState[0].id);
    }
    return;
  }

  editingProductId = product.id;
  if (productModalTitle) productModalTitle.textContent = "Editar producto";
  if (productIdInput) productIdInput.value = String(product.id);
  if (productNameInput) productNameInput.value = product.nombre;
  if (productDescriptionInput)
    productDescriptionInput.value = product.descripcion;
  if (productPriceInput) productPriceInput.value = String(product.precio);
  if (productStockInput) productStockInput.value = String(product.stock);
  if (productImageInput) productImageInput.value = product.imagen;
  if (productAvailableInput) productAvailableInput.checked = product.disponible;
  if (productCategorySelect && categoriesState.length) {
    productCategorySelect.value = String(product.categoria.id);
  }
};

const renderProducts = () => {
  if (!productsTableBody) {
    return;
  }

  if (!productsState.length) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="p-4 text-center text-muted-foreground">
          No hay productos cargados.
        </td>
      </tr>
    `;
    return;
  }

  productsTableBody.innerHTML = productsState
    .map((productItem) => {
      return `
        <tr class="*:p-2">
          <td>${productItem.id}</td>
          <td><img src="${productItem.imagen}" class="size-16 object-cover" /></td>
          <td>${productItem.nombre}</td>
          <td>${productItem.descripcion}</td>
          <td>$${productItem.precio}</td>
          <td>${productItem.categoria.nombre}</td>
          <td>${productItem.stock} unidades</td>
          <td>${productItem.disponible ? "Disponible" : "No disponible"}</td>
          <td>
            <div class="flex gap-2">
              <button type="button" class="button button--small secondary" data-action="edit-product" data-product-id="${productItem.id}">Editar</button>
              <button type="button" class="button button--small bg-error/80 text-white" data-action="delete-product" data-product-id="${productItem.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  const [products, categories] = await Promise.all([
    getProducts({ onlyAvailable: false }),
    getCategories(),
  ]);

  productsState = products ?? [];
  categoriesState = categories ?? [];
  renderProducts();
});

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const createButton = target.closest("[data-action='create-product']");

  if (createButton) {
    openProductModal();
    return;
  }

  const editButton = target.closest(
    "[data-action='edit-product']",
  ) as HTMLElement | null;
  if (editButton) {
    const productId = Number(editButton.dataset.productId);
    const productItem = productsState.find((item) => item.id === productId);

    if (productItem) {
      openProductModal(productItem);
    }
    return;
  }

  const deleteButton = target.closest(
    "[data-action='delete-product']",
  ) as HTMLElement | null;

  if (deleteButton) {
    const productId = Number(deleteButton.dataset.productId);
    const productItem = productsState.find((item) => item.id === productId);

    if (!productItem) {
      return;
    }

    const shouldDelete = window.confirm(
      `¿Eliminar el producto "${productItem.nombre}"?`,
    );

    if (shouldDelete) {
      productsState = productsState.filter((item) => item.id !== productId);
      renderProducts();
    }
  }
});

productForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (
    !productNameInput ||
    !productDescriptionInput ||
    !productPriceInput ||
    !productStockInput ||
    !productImageInput ||
    !productCategorySelect
  ) {
    return;
  }

  const nombre = productNameInput.value.trim();
  const descripcion = productDescriptionInput.value.trim();
  const precio = Number(productPriceInput.value);
  const stock = Number(productStockInput.value);
  const imagen = productImageInput.value.trim();
  const categoryId = Number(productCategorySelect.value);
  const disponible = Boolean(productAvailableInput?.checked);

  if (
    !nombre ||
    !descripcion ||
    !imagen ||
    Number.isNaN(precio) ||
    Number.isNaN(stock) ||
    precio <= 0 ||
    stock < 0
  ) {
    window.alert("Revisá los datos del producto.");
    return;
  }

  const category =
    categoriesState.find((item) => item.id === categoryId) ??
    categoriesState[0];

  if (editingProductId) {
    productsState = productsState.map((productItem) =>
      productItem.id === editingProductId
        ? {
            ...productItem,
            nombre,
            descripcion,
            precio,
            stock,
            imagen,
            disponible,
            categoria: category,
          }
        : productItem,
    );
  } else {
    const newProduct: product = {
      id: Date.now(),
      nombre,
      precio,
      descripcion,
      stock,
      imagen,
      disponible,
      categoria: category,
    };

    productsState = [newProduct, ...productsState];
  }

  renderProducts();
  closeProductModal();
});

document
  .getElementById("closeProductModal")
  ?.addEventListener("click", closeProductModal);
document
  .getElementById("cancelProductModal")
  ?.addEventListener("click", closeProductModal);

productModal?.addEventListener("click", (event) => {
  if (event.target === productModal) {
    closeProductModal();
  }
});
