import type { ICategory } from "../../types/category";

export const getCategories = async (): Promise<ICategory[] | null> => {
  try {
    const response = await fetch("/data/categorias.json");

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    return data as ICategory[];
  } catch (e) {
    console.error(e);

    return null;
  }
};
