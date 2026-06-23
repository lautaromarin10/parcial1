import type { product } from "../../types/product";

interface GetProductsOptions {
  onlyAvailable?: boolean;
}

export const getProducts = async ({
  onlyAvailable = true,
}: GetProductsOptions = {}): Promise<product[]> => {
  try {
    const response = await fetch("/data/productos.json");

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = (await response.json()) as product[];

    if (!onlyAvailable) {
      return data;
    }

    return data.filter((product) => product.disponible);
  } catch (e) {
    console.error(e);
    return [];
  }
};
