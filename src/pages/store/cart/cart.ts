import {
  cleanCart,
  getCartTotal,
  getCurrentCart,
  isEmptyCart,
} from "../../../modules/productCart/productCart";
import type { cartProduct } from "../../../types/cartProduct";

//ELEMENTOS CAPTURADOS

const cartContainer = document.getElementById("cartContainer");
const cartProductContainer = document.getElementById("cartProductContainer");
const cartResumeContainer = document.getElementById("cartResumeContainer");
//ELEMENTOS CAPTURADOS

//COMPONENTS

export const productCard = ({ producto }: { producto: cartProduct }) => {
  const { imagen, nombre, descripcion, precio, categorias, cantidad } =
    producto;

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
              <p class="badge badge--primary">${cantidad} ${cantidad > 1 ? "unidades" : "unidad"}</p>
            </div>
          </div>
        </article>`;
};

export const emptyCart = () => {
  return `
     <section class="empty__result rounded">
  <div class="empty__result__content">
    <h3 class="empty__title">Tu carrito está vacío</h3>
    <p class="empty__subtitle">
     Todavia no agregaste productos, explorá nuestros productos y encontrá algo que te guste 
    </p>
   
    <a class="button empty__button button--primary rounded" href="/src/pages/store/home/home.html">
    Volver al inicio
    </a>
  </div>

</section>
    `;
};

export const cartResume = (products: cartProduct[]) => {
  const precioFinal = getCartTotal();
  return `
    <div class="cart__resume__content">
            <h2>Resumen del pedido</h2>
            <ul class="cart__products__list scroll-mask">
            ${products
              .map(
                (product) =>
                  `
              <li class="cart__products__item rounded">
              <img src="${product.imagen}" class="rounded" alt="${product.nombre}" />
              <div class="cart__products__item__info">
              <h4 class="cart__product__title">
                ${product.nombre}
              </h4>
              <div class="cart__product__item__resume">
              <span class="badge badge--gray">${product.cantidad} ${product.cantidad > 1 ? "unidades" : "unidad"}</span>
               <span class="cart__product__item__price">$${product.precio * product.cantidad} total</span>
              </div>
              </li>
              `,
              )
              .join("")}
            </ul>
            <div class="cart__resume__total__container">
              <span>Total Final:</span>
              <p>$${precioFinal}</p>
            </div>
        <button id="cleanCartButton" class="button rounded">Eliminar pedido</button>

      </div>
  `;
};

//COMPONENTS

//MANEJO DE PRODUCTOS
export const renderProducts = (products: cartProduct[] | null) => {
  if (!cartProductContainer || !products) return;

  cartProductContainer.innerHTML = products
    .map((producto: cartProduct) => {
      return productCard({ producto });
    })
    .join("");
};
//MANEJO DE PRODUCTOS

//CARGA INICIAL DE PRODUCTOS DEL CARRITO

document.addEventListener("DOMContentLoaded", () => {
  if (!cartProductContainer || !cartContainer) {
    return;
  }
  const currentCart = getCurrentCart();

  if (isEmptyCart()) {
    cartContainer.innerHTML = emptyCart();
    return;
  }

  cartProductContainer.innerHTML += currentCart
    .map((product: cartProduct) => productCard({ producto: product }))
    .join("");

  return;
});

//CARGA INICIAL DE RESUMEN DEL CARRITO

document.addEventListener("DOMContentLoaded", () => {
  if (!cartResumeContainer || isEmptyCart()) {
    return;
  }

  const currentCart = getCurrentCart();

  cartResumeContainer.innerHTML = cartResume(currentCart);

  const cleanCartButton = document.getElementById("cleanCartButton");

  cleanCartButton?.addEventListener("click", () => {
    cleanCart();
    location.reload();
  });
});
