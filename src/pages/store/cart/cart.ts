import {
  cleanCart,
  getCartTotal,
  getCurrentCart,
  isEmptyCart,
  removeProductFromCart,
  updateProductQuantity,
} from "../../../modules/productCart/productCart";
import type { cartProduct } from "../../../types/cartProduct";
import { checkUserRole } from "../../../utils/checkUserRole";
import { ENVIO } from "../../../utils/config";
import "../../../utils/renderHeader";

checkUserRole("USUARIO");

//ELEMENTOS CAPTURADOS

const cartContainer = document.getElementById("cartContainer");
const cartProductContainer = document.getElementById("cartProductContainer");
const cartResumeContainer = document.getElementById("cartResumeContainer");
const cartForm = document.getElementById("cartForm") as HTMLFormElement | null;
//ELEMENTOS CAPTURADOS

//COMPONENTS

export const productCard = ({ producto }: { producto: cartProduct }) => {
  const { id, imagen, nombre, precio, cantidad, stock } = producto;
  const total = precio * cantidad;

  return `
    <article class="flex flex-col h-fit rounded-md border border-muted-foreground p-4 gap-3">
      <div class="flex gap-4">
        <img
          class="aspect-square object-cover w-24 h-24 rounded-md"
          src="${imagen}"
          alt="Imagen del producto ${nombre}"
        />
        <div class="flex flex-col flex-1 gap-1">
          <h3 class="text-lg font-semibold">${nombre}</h3>
          <p class="text-sm">$${precio} c/u</p>
          <div class="flex items-center ring w-fit ring-muted-foreground rounded-md gap-2 mt-2">
            <button type="button" class="button rounded-r-none! button--small secondary" data-action="decrease" data-product-id="${id}">-</button>
            <input
              type="number"
              min="1"
              max="${stock}"
              value="${cantidad}"
              class="w-16 text-center"
              data-input-quantity="${id}"
            />
            <button type="button" class="button rounded-l-none! button--small secondary" data-action="increase" data-product-id="${id}">+</button>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm">Subtotal: $${total}</span>
        <button type="button" class="button button--small bg-muted-foreground" data-action="remove" data-product-id="${id}">Eliminar</button>
      </div>
    </article>
  `;
};

export const emptyCart = () => {
  return `
     <section class="ring ring-muted-foreground p-12 col-span-1 sm:col-span-2 lg:col-span-4 rounded">
      <div class="flex flex-col justify-center items-center *:text-center">
        <h3 class="text-xl mb-2">Tu carrito está vacío</h3>
        <p class="mb-4">
         Todavía no agregaste productos, explorá nuestros productos y encontrá algo que te guste 
        </p>
        <a class="button primary rounded" href="/src/pages/store/home/home.html">
        Volver al inicio
        </a>
      </div>
    </section>
    `;
};

export const cartResume = (products: cartProduct[]) => {
  const subtotal = getCartTotal();
  const total = subtotal + ENVIO;

  return `
    <div class="flex flex-col rounded-md gap-3">
      <h2 class="mb-2">Resumen del pedido</h2>
      <ul class="flex flex-col gap-2">
        ${products
          .map(
            (product) => `
              <li class="flex flex-row rounded bg-white h-full">
                <img src="${product.imagen}" class="rounded w-20 object-cover rounded-r-none" alt="${product.nombre}" />
                <div class="h-full flex flex-col p-2">
                  <h4 class="text-sm mb-1 line-clamp-1">${product.nombre}</h4>
                  <div class="flex flex-col ">
                    <span class="badge h-5! px-2.5! mb-2 ring bg-muted-foreground ring-muted-foreground">${product.cantidad} ${product.cantidad > 1 ? "unidades" : "unidad"}</span>
                    <span class="text-sm">$${product.precio * product.cantidad} total</span>
                  </div>
                </div>
              </li>
            `,
          )
          .join("")}
      </ul>
      <div class="flex flex-col gap-1 border-t pt-3">
        <div class="flex justify-between"><span>Subtotal</span><span>$${subtotal}</span></div>
        <div class="flex justify-between"><span>Envío</span><span>$${ENVIO}</span></div>
        <div class="flex justify-between font-semibold"><span>Total</span><span>$${total}</span></div>
      </div>
      <button id="cleanCartButton" class="button secondary rounded">Eliminar pedido</button>
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

const updateCartView = () => {
  if (!cartProductContainer || !cartResumeContainer || !cartContainer) return;

  const currentCart = getCurrentCart();

  if (isEmptyCart()) {
    cartContainer.innerHTML = emptyCart();
    return;
  }

  renderProducts(currentCart);
  cartResumeContainer.innerHTML = cartResume(currentCart);
};

const validateQuantity = (quantity: number, stock: number) => {
  return Math.max(1, Math.min(stock, Math.floor(quantity)));
};

const renderCheckoutError = (message: string) => {
  const errorContainer = document.getElementById("checkoutError");
  if (errorContainer) {
    errorContainer.textContent = message;
  }
};

const isCheckoutFormValid = () => {
  if (!cartForm) return false;

  const requiredFields =
    cartForm.querySelectorAll<HTMLInputElement>("[required]");

  return Array.from(requiredFields).every((field) => field.value.trim() !== "");
};

//CARGA INICIAL DE PRODUCTOS DEL CARRITO

document.addEventListener("DOMContentLoaded", () => {
  if (!cartProductContainer || !cartContainer || !cartResumeContainer) {
    return;
  }

  updateCartView();

  const cleanCartButton = document.getElementById("cleanCartButton");
  cleanCartButton?.addEventListener("click", () => {
    cleanCart();
    updateCartView();
  });

  cartProductContainer.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const actionButton = target.closest("[data-action]") as HTMLElement | null;

    if (!actionButton) return;

    const productId = Number(actionButton.dataset.productId);
    const currentCart = getCurrentCart();
    const product = currentCart.find((item) => item.id === productId);

    if (!product) return;

    if (actionButton.dataset.action === "remove") {
      removeProductFromCart(productId);
      updateCartView();
      return;
    }

    const quantityInput = cartProductContainer.querySelector(
      `[data-input-quantity="${productId}"]`,
    ) as HTMLInputElement | null;

    if (!quantityInput) return;

    const currentValue = Number(quantityInput.value) || 1;

    const nextValue =
      actionButton.dataset.action === "increase"
        ? currentValue + 1
        : currentValue - 1;

    const validatedValue = validateQuantity(nextValue, product.stock);
    quantityInput.value = `${validatedValue}`;
    updateProductQuantity(productId, validatedValue);
    updateCartView();
  });

  cartProductContainer.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;

    if (!target.dataset.inputQuantity) return;

    const productId = Number(target.dataset.inputQuantity);
    const currentCart = getCurrentCart();
    const product = currentCart.find((item) => item.id === productId);

    if (!product) return;

    const validatedValue = validateQuantity(
      Number(target.value),
      product.stock,
    );
    target.value = `${validatedValue}`;
    updateProductQuantity(productId, validatedValue);
    updateCartView();
  });

  if (cartForm) {
    cartForm.addEventListener("submit", (event) => {
      event.preventDefault();

      renderCheckoutError("");

      if (!isCheckoutFormValid()) {
        renderCheckoutError("Completá todos los campos requeridos.");
        return;
      }

      const currentCart = getCurrentCart();
      if (currentCart.length === 0) {
        renderCheckoutError("Tu carrito está vacío.");
        return;
      }

      const total = getCartTotal() + ENVIO;
      const orderSummary = `Pedido confirmado — Total: $${total}`;
      renderCheckoutError("");
      alert(orderSummary);
      cleanCart();
      updateCartView();
      cartForm.reset();
    });
  }
});
