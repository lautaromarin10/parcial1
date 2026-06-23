import { getCategories } from "../../../utils/services/getCategories";
import {
  addProductToCart,
  getCurrentCart,
} from "../../../modules/productCart/productCart";
import type { ICategory } from "../../../types/category";
import type { modalStatus } from "../../../types/modalStatus";
import type { product } from "../../../types/product";
import { getProducts } from "../../../utils/services/getProducts";
import { checkUserRole } from "../../../utils/checkUserRole";
import "../../../utils/renderHeader";

checkUserRole("USUARIO");

//ELEMENTOS CAPTURADOS
const productContainer = document.getElementById("productContainer");
const categoriesContainer = document.getElementById("categoriesContainer");
const modalWrapper = document.getElementById("modalWrapper");
const filterInput = document.getElementById(
  "filterInput",
) as HTMLInputElement | null;
const openAsideButton = document.getElementById("openAsideButton");
const closeAsideButton = document.getElementById("closeAsideButton");
const asideContent = document.getElementById("asideContent");
const cartBadge = document.getElementById("cartBadge");
const sortSelect = document.getElementById(
  "sortSelect",
) as HTMLSelectElement | null;
//ELEMENTOS CAPTURADOS

let allProducts: product[] = [];
let selectedCategory: ICategory | null = null;

const getCartItemsCount = () => {
  return getCurrentCart().reduce(
    (accumulator, currentProduct) => accumulator + currentProduct.cantidad,
    0,
  );
};

const renderCartBadge = () => {
  if (cartBadge) {
    cartBadge.textContent = `${getCartItemsCount()}`;
  }
};

const sortProducts = (products: product[], sortValue: string) => {
  const sortedProducts = [...products];

  switch (sortValue) {
    case "name-asc":
      return sortedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
    case "name-desc":
      return sortedProducts.sort((a, b) => b.nombre.localeCompare(a.nombre));
    case "price-asc":
      return sortedProducts.sort((a, b) => a.precio - b.precio);
    case "price-desc":
      return sortedProducts.sort((a, b) => b.precio - a.precio);
    default:
      return sortedProducts;
  }
};

const applyProductsFilters = () => {
  let filteredProducts = [...allProducts];

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.categoria.id === selectedCategory?.id,
    );
  }

  if (filterInput?.value.trim()) {
    const searchValue = filterInput.value.trim().toLowerCase();
    filteredProducts = filteredProducts.filter((product) =>
      product.nombre.toLowerCase().includes(searchValue),
    );
  }

  const sortValue = sortSelect?.value || "default";
  filteredProducts = sortProducts(filteredProducts, sortValue);

  renderProducts(filteredProducts);
};

//COMPONENTS
export const asideCategory = (category: ICategory) => {
  const { nombre } = category;

  const categoryJSON = JSON.stringify(category);
  return `
        <li data-category='${categoryJSON}' class="button ring-2 ring-muted-foreground aria-selected:bg-primary aria-selected:text-white">${nombre}</li>
    `;
};

export const emptyResults = () => {
  return `
     <section class="p-8 min-h-80 ring ring-muted-foreground bg-card rounded-md w-full col-span-1 sm:col-span-2 lg:col-span-3">
      <div class="flex flex-col w-full h-full justify-center text-center items-center">
        <h3 class="text-xl mb-2">Ups… no encontramos resultados</h3>
        <p class="mb-1">
          No hay productos que coincidan con tu búsqueda.
        </p>
        <p>
          Probá con otro nombre o explorá nuestras categorías.
        </p>
      </div>
    </section>
    `;
};

export const modalContent = (message: string, status: modalStatus) => {
  return `
        <div class="modal rounded ${status === "SUCCESS" ? "modal--success" : "modal--error"}">
       ${message}
       </div>
    `;
};

export const productCard = ({ producto }: { producto: product }) => {
  const { id, imagen, nombre, descripcion, precio, categoria, stock } =
    producto;

  return ` <a
          href="/src/pages/store/productDetail/productDetail.html?productID=${id}"
          class="flex flex-col hover:ring ring-muted-foreground rounded-md duration-500 p-2"
        >
          <img
            class="aspect-square object-cover max-h-60 sm:max-h-80 rounded-md"
            src="${imagen}" alt="Imagen del producto ${nombre}"
          />
          <div class="flex flex-col mt-4">
            <div class="flex flex-row flex-wrap gap-1">
              <span class="badge primary mb-2">${categoria.nombre}</span>
              <span class="badge ${stock > 0 ? "bg-success" : "bg-error text-white!"} mb-2">${stock > 0 ? `${stock} unidades` : "Sin stock"}</span>
            </div>
            <h3 class="text-2xl">${nombre}</h3>
            <p class="text-gray-700 mb-2">
              ${descripcion}
            </p>
            <div class="flex flex-row items-center justify-between">
              <p class="text-2xl">$${precio}</p>
              <button
                type="button"
                class="button primary"
                data-product='${JSON.stringify(producto)}'
              >
                Agregar
              </button>
            </div>
          </div>
        </a>`;
};

//COMPONENTS

//MANEJO DE PRODUCTOS

export const renderProducts = (products: product[] | null) => {
  if (!productContainer) return;

  if (!products || products.length === 0) {
    productContainer.innerHTML = emptyResults();
    return;
  }

  productContainer.innerHTML = products
    .map((producto: product) => {
      return productCard({ producto });
    })
    .join("");
};

//MANEJO DE PRODUCTOS

//MANEJO DE CATEGORIAS

const handleCategorySelect = (elementClicked: HTMLElement) => {
  const currentActiveCategory = categoriesContainer?.querySelector(
    '[aria-selected="true"]',
  );
  currentActiveCategory?.removeAttribute("aria-selected");

  elementClicked.setAttribute("aria-selected", "true");
};

//MANEJO DE CATEGORIAS

//MANEJO DE MODAL

export const cleanModal = () => {
  if (modalWrapper) {
    modalWrapper.innerHTML = "";
  }
};

let modalTimer: ReturnType<typeof setTimeout>;

export const renderModalMessage = (
  message: string,

  status: modalStatus = "SUCCESS",

  exitTime: number = 3000,
) => {
  if (!modalWrapper) return;
  cleanModal();

  clearTimeout(modalTimer);

  modalWrapper.innerHTML = modalContent(message, status);
  modalTimer = setTimeout(() => {
    cleanModal();
  }, exitTime);
};

//MANEJO DE MODAL

//MANEJO DE VISTA DEL ASIDE

const handleModalClick = () => {
  const isExpanded = asideContent?.getAttribute("aria-expanded") === "true";
  asideContent?.setAttribute("aria-expanded", isExpanded ? "false" : "true");
};

//MANEJO DE VISTA DEL ASIDE

//CARGA INICIAL DE PRODUCTOS

document.addEventListener("DOMContentLoaded", async () => {
  allProducts = await getProducts();

  if (productContainer) {
    applyProductsFilters();
  }

  renderCartBadge();
});

//CARGA INICIAL DE PRODUCTOS

//CARGA INICIAL DE CATEGORIAS

document.addEventListener("DOMContentLoaded", async () => {
  let categories = await getCategories();

  if (!categories) {
    return;
  }

  if (categoriesContainer) {
    categoriesContainer.innerHTML += categories
      .map((category: ICategory) => {
        return asideCategory(category);
      })
      .join("");
  }
});

//CARGA INICIAL DE CATEGORIAS

//ADDEVENTSLISTENERS

let debounceTimer: ReturnType<typeof setTimeout>;

filterInput?.addEventListener("keyup", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    applyProductsFilters();
  }, 300);
});

categoriesContainer?.addEventListener("click", async (e) => {
  const elementClicked = e.target as HTMLElement;
  const isViewAll = elementClicked.innerText === "Ver todo";
  const isCategory = elementClicked.dataset.category || null;

  if (!isCategory && !isViewAll) {
    return;
  }

  if (isCategory) {
    selectedCategory = JSON.parse(isCategory) as ICategory;
  } else {
    selectedCategory = null;
  }

  handleCategorySelect(elementClicked);
  applyProductsFilters();
  handleModalClick();
});

openAsideButton?.addEventListener("click", () => {
  handleModalClick();
});

closeAsideButton?.addEventListener("click", () => {
  handleModalClick();
});

sortSelect?.addEventListener("change", () => {
  applyProductsFilters();
});

productContainer?.addEventListener("click", (e) => {
  const elementClicked = e.target as HTMLElement;
  const addToCartButton = elementClicked.closest(
    "button[data-product]",
  ) as HTMLButtonElement | null;

  if (addToCartButton?.dataset.product) {
    e.preventDefault();
    e.stopPropagation();

    const product = JSON.parse(addToCartButton.dataset.product) as product;
    addProductToCart(product);
    renderCartBadge();
    return;
  }
});
