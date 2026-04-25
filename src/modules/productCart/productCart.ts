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

export const isEmptyCart = (): boolean => {
  const currentCart = getCurrentCart();
  return currentCart.length === 0;
};

export const addProductToCart = (newProduct: product) => {
  const currentCart = getCurrentCart();

  if (isProductInCart(newProduct.id)) {
    const updatedCart = currentCart.map((product) =>
      product.id === newProduct.id
        ? { ...product, cantidad: product.cantidad + 1 }
        : product,
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    renderModalMessage("Cantidad actualizada en el carrito", "SUCCESS");
    return;
  }

  const updatedCart: cartProduct[] = [
    ...currentCart,
    { ...newProduct, cantidad: 1 },
  ];
  localStorage.setItem("cart", JSON.stringify(updatedCart));
  renderModalMessage("Producto agregado al carrito", "SUCCESS");
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
};
