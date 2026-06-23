import type { product } from "../../types/product";
import { getProducts } from "./getProducts";

export const getProductsByID = async (id: number): Promise<product | null> => {
  try {
    const product = await getProducts();

    if (!product) {
      throw new Error("No pudimos encontrar la lista de productos");
    }

    const searchedProduct = product.find((product) => {
      return product.id === id;
    });

    if (!searchedProduct) {
      throw new Error("No pudimos encontrar el producto con ID: " + id);
    }

    return searchedProduct;
  } catch (e) {
    console.log(e);
    return null;
  }
};
