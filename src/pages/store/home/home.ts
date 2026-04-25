import { getCategories, PRODUCTS } from "../../../data/data";
import { addProductToCart } from "../../../modules/productCart/productCart";
import type { ICategory } from "../../../types/category";
import type { modalStatus } from "../../../types/modalStatus";
import type { product } from "../../../types/product";

//ELEMENTOS CAPTURADOS
const productContainer = document.getElementById("productContainer");
const categoriesContainer = document.getElementById("categoriesContainer");
const modalWrapper = document.getElementById("modalWrapper");
const filterInput = document.getElementById("filterInput");
const openAsideButton = document.getElementById("openAsideButton");
const closeAsideButton = document.getElementById("closeAsideButton");
const asideContent = document.getElementById("asideContent");
//ELEMENTOS CAPTURADOS

let categories = getCategories();

//COMPONENTS
export const asideCategory = (category: ICategory) => {
  const { nombre } = category;

  const categoryJSON = JSON.stringify(category);
  return `
        <li data-category='${categoryJSON}' class="button category__item rounded">${nombre}</li>
    `;
};

export const emptyResults = () => {
  return `
     <section class="empty__result rounded">
      <div class="empty__result__content">
        <h3 class="empty__title">Ups… no encontramos resultados</h3>
        <p class="empty__subtitle">
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
  const { imagen, nombre, descripcion, precio, categorias } = producto;

  return ` <article
          class="product__card"
        >
          <img
            class="product__image rounded"
            src="${imagen}" alt="Imagen del producto ${nombre}"
          />
          <div class="product__info">
            <span class="badge badge--gray"
            >${categorias[0].nombre}</span
            >
            <h3 class="product__title">${nombre}</h3>
            <p class="product__description">
              ${descripcion}
            </p>
            <div class="product__actions">
              <p class="product__price">$${precio}</p>
              <button class="button button--primary rounded"
              data-product='${JSON.stringify(producto)}'
              >
                Agregar
              </button>
            </div>
          </div>
        </article>`;
};

//COMPONENTS

//MANEJO DE PRODUCTOS

export const renderProducts = (products: product[] | null) => {
  if (!productContainer || !products) return;

  productContainer.innerHTML = products
    .map((producto: product) => {
      return productCard({ producto });
    })
    .join("");
};

const getProductsByCategory = (category: ICategory): product[] | null => {
  if (!category) return null;

  console.log(category);

  return PRODUCTS.filter((product: product) => {
    return product.categorias.some(
      (productCategory: ICategory) => productCategory.id === category.id,
    );
  });
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

export const renderModalMessage = (
  message: string,
  status: modalStatus = "SUCCESS",
  exitTime: number = 3000,
) => {
  if (!modalWrapper) return;

  cleanModal();

  modalWrapper.innerHTML = modalContent(message, status);

  setTimeout(() => {
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

document.addEventListener("DOMContentLoaded", () => {
  if (productContainer) {
    renderProducts(PRODUCTS);
  }
});

//CARGA INICIAL DE PRODUCTOS

//CARGA INICIAL DE CATEGORIAS

document.addEventListener("DOMContentLoaded", () => {
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

filterInput?.addEventListener("keyup", (e) => {
  const input = e.target as HTMLInputElement;

  const filterProductsByName = PRODUCTS.filter((product: product) => {
    return product.nombre.toLowerCase().includes(input.value.toLowerCase());
  });

  if (filterProductsByName.length === 0 && productContainer) {
    productContainer.innerHTML = emptyResults();
    return;
  }

  renderProducts(filterProductsByName);
});

categoriesContainer?.addEventListener("click", (e) => {
  const elementClicked = e.target as HTMLElement;
  const isViewAll = elementClicked.innerText === "Ver todo";
  const isCategory = elementClicked.dataset.category || null;

  if (!isCategory && !isViewAll) {
    return;
  }

  const productsToRender = isCategory
    ? getProductsByCategory(JSON.parse(isCategory))
    : PRODUCTS;

  renderProducts(productsToRender);
  handleCategorySelect(elementClicked);
  handleModalClick();
});

openAsideButton?.addEventListener("click", () => {
  handleModalClick();
});

closeAsideButton?.addEventListener("click", () => {
  handleModalClick();
});

productContainer?.addEventListener("click", (e) => {
  const elementClicked = e.target as HTMLElement;

  const data = elementClicked.dataset.product;

  if (data) {
    const product = JSON.parse(data) as product;
    addProductToCart(product);
  }
});
