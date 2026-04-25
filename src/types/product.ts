import type { ICategory } from "./category";

export interface product {
  id: number;
  eliminado: boolean;
  createdAt: string;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  categorias: ICategory[];
}
