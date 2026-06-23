import { renderModalMessage } from "../../pages/store/home/home";
import type { cartProduct } from "../../types/cartProduct";
import type { product } from "../../types/product";

export const getCurrentCart = (): cartProduct[] => {
  const cart = localStorage.getItem("cart");

  return cart ? JSON.parse(cart) : [];
};

export const isProductInCart = (productId: string | number): boolean => {
  const currentCart = getCurrentCart();

  return currentCart.some((p) => p.id === productId);
};

export const getProductInCartById = (
  productId: string | number,
): cartProduct | null => {
  const currentCart = getCurrentCart();

  const searchedProduct = currentCart.find(
    (product) => product.id === productId,
  ) as cartProduct | undefined;

  return searchedProduct !== undefined ? searchedProduct : null;
};

export const isEmptyCart = (): boolean => {
  const currentCart = getCurrentCart();
  return currentCart.length === 0;
};

export const addProductToCart = (newProduct: product, quantity: number = 1) => {
  const currentCart = getCurrentCart();
  const quantityToAdd = Math.max(1, Math.floor(quantity));

  if (isProductInCart(newProduct.id)) {
    const updatedCart = currentCart.map((product) =>
      product.id === newProduct.id
        ? { ...product, cantidad: product.cantidad + quantityToAdd }
        : product,
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart:updated"));
    renderModalMessage(
      quantityToAdd === 1
        ? "Cantidad actualizada en el carrito"
        : `${quantityToAdd} unidades agregadas al carrito`,
      "SUCCESS",
    );
    return;
  }

  const updatedCart: cartProduct[] = [
    ...currentCart,
    { ...newProduct, cantidad: quantityToAdd },
  ];
  localStorage.setItem("cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cart:updated"));
  renderModalMessage(
    quantityToAdd === 1
      ? "Producto agregado al carrito"
      : `${quantityToAdd} unidades agregadas al carrito`,
    "SUCCESS",
  );
};

export const updateProductQuantity = (
  productId: string | number,
  quantity: number,
) => {
  const currentCart = getCurrentCart();
  const updatedCart = currentCart.map((product) =>
    product.id === productId
      ? {
          ...product,
          cantidad: Math.max(1, Math.min(product.stock, quantity)),
        }
      : product,
  );

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cart:updated"));
};

export const removeProductFromCart = (productId: string | number) => {
  const currentCart = getCurrentCart();
  const updatedCart = currentCart.filter((product) => product.id !== productId);

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cart:updated"));
};

export const getCartTotal = () => {
  const currentCart = getCurrentCart();

  const precioFinal = currentCart.reduce((acumulador, product) => {
    return acumulador + product.precio * product.cantidad;
  }, 0);

  return precioFinal;
};

export const cleanCart = () => {
  localStorage.removeItem("cart");
  window.dispatchEvent(new Event("cart:updated"));
};
