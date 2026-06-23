import {
  addProductToCart,
  getProductInCartById,
} from "../../../modules/productCart/productCart";
import { renderModalMessage } from "../home/home";
import type { product } from "../../../types/product";
import { getProductsByID } from "../../../utils/services/getProductsByID";
import { checkUserRole } from "../../../utils/checkUserRole";
import "../../../utils/renderHeader";

checkUserRole("USUARIO");

//elementos capturados
const productWrapper = document.getElementById("productWrapper");
//elementos capturados

const renderProductNotFoundMessage = () => {
  if (productWrapper) {
    productWrapper.innerHTML += `
            <div class="container *:max-w-120 mx-auto *:text-center mt-20 ring ring-muted-foreground min-h-60 rounded-md p-8 flex flex-col items-center justify-center">
                <h1 class="text-xl mb-1">No pudimos encontrar el producto que buscabas</h1>
                <p class="mb-4">No encontramos el producto que buscabas. Probá con otro término de búsqueda o explorá nuestras categorías.<p>
                <a href="/src/pages/store/home/home.html" class="button primary">Volver al inicio</a>
            </div>
        `;
  }
};

const renderProductInformation = (
  producto: product,
  productoQuantity: number,
) => {
  const { categoria, precio, descripcion, disponible, nombre, stock, imagen } =
    producto;

  if (productWrapper) {
    productWrapper.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 container mx-auto gap-8 mt-20">
                <img
                src=${imagen}
                class="h-full max-h-200 rounded-md object-cover w-full"
                />
                <div class="flex flex-col justify-between">
                    <div class="flex flex-col">
                         <div class="flex flex-row gap-2 flex-wrap">
                            <span class="badge secondary mb-2">${categoria.nombre}</span>
                            <span class="badge ${disponible ? "bg-success" : "bg-error"} mb-2">${disponible ? "Disponibles" : "No disponible"}</span>
                         </div>
                        <small class="flex items-center text-base!"><span class="${stock > 0 ? "text-success" : "text-error"} text-xl animate-pulse mr-2">&#8226;</span>${stock > 0 ? `Stock de ${stock} unidades` : "Sin stock"}</small>
                        <h1 class="text-3xl mb-1">${nombre}</h1>
                        <p class="mb-2 text-lg">${descripcion}</p>
                        <span class="text-xl">$${precio}</span>
                        <div class="mt-4 flex flex-col">
                        ${
                          disponible && stock > 0
                            ? `
                        <p class="mb-2">Seleccione las cantidades</p>
                         <form id="handleProductQuantity" class="flex flex-row gap-2 w-fit h-fit ">
                         <div class="flex flex-row ring ring-muted-foreground rounded-full">
                         <button id="handleDecreaseQuantity" type="button" class="button text-xs! bg-muted-foreground rounded-full! rounded-r-none!"><</button>
                          <input min="0" value=${Math.min(productoQuantity || 1, stock)} max=${stock} id="quantityValue" type="number" class="w-15! px-2 text-xs!" />
                          <button id="handleIncrementQuantity" type="button" class="button text-xs! bg-muted-foreground rounded-full! rounded-l-none!">></button>
                         </div> 
                        <button type="submit" class="button primary">Agregar al carrito</button>
                        </form>
                        `
                            : `<button class="button w-fit bg-muted-foreground opacity-50" disabled>No es posible comprar este producto</button>`
                        }
                        </div>
                    </div>
                    <a href="/src/pages/store/home/home.html" class="button mt-4 button--small bg-muted-foreground w-fit">Volver al inicio</a>
                </div>
            </div>
        `;
  }
};

const getValidatedQuantity = (
  input: HTMLInputElement,
  stock: number,
): number => {
  const parsedValue = Number(input.value) || 0;
  const validatedValue = Math.min(stock, Math.max(0, parsedValue));

  input.value = `${validatedValue}`;
  return validatedValue;
};

//CARGA INICIAL DEL PRODUCTO Y STOCK
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productID = params.get("productID");

  if (productID) {
    const searchedProduct =
      ((await getProductsByID(parseInt(productID))) as product) || null;

    if (!searchedProduct) {
      renderProductNotFoundMessage();
      return;
    }

    const productInCart = getProductInCartById(searchedProduct.id);
    const quantityOfProductInCart =
      productInCart !== null ? productInCart.cantidad : 0;

    renderProductInformation(searchedProduct, quantityOfProductInCart);

    const quantityInput = document.getElementById(
      "quantityValue",
    ) as HTMLInputElement | null;
    const decrementButton = document.getElementById(
      "handleDecreaseQuantity",
    ) as HTMLButtonElement | null;
    const incrementButton = document.getElementById(
      "handleIncrementQuantity",
    ) as HTMLButtonElement | null;
    const quantityForm = document.getElementById(
      "handleProductQuantity",
    ) as HTMLFormElement | null;

    if (quantityInput && decrementButton && incrementButton && quantityForm) {
      quantityInput.value = `${Math.min(
        Math.max(quantityOfProductInCart || 1, 1),
        searchedProduct.stock,
      )}`;

      quantityInput.addEventListener("input", () => {
        getValidatedQuantity(quantityInput, searchedProduct.stock);
      });

      decrementButton.addEventListener("click", (e) => {
        e.preventDefault();
        const currentValue = Number(quantityInput.value) || 1;
        const nextValue = Math.max(1, currentValue - 1);
        quantityInput.value = `${Math.min(nextValue, searchedProduct.stock)}`;
      });

      incrementButton.addEventListener("click", (e) => {
        e.preventDefault();
        const currentValue = Number(quantityInput.value) || 1;
        const nextValue = Math.min(searchedProduct.stock, currentValue + 1);
        quantityInput.value = `${nextValue}`;
      });

      quantityForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const quantityToAdd = getValidatedQuantity(
          quantityInput,
          searchedProduct.stock,
        );

        if (quantityToAdd <= 0) {
          renderModalMessage("Seleccioná al menos una unidad", "ERROR");
          return;
        }

        const totalQuantityInCart =
          productInCart !== null ? productInCart.cantidad : 0;

        if (totalQuantityInCart + quantityToAdd > searchedProduct.stock) {
          renderModalMessage("No hay suficiente stock disponible", "ERROR");
          return;
        }

        addProductToCart(searchedProduct, quantityToAdd);
      });
    }
  }
});
