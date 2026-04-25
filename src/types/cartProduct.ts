import type { product } from "./product";

export interface cartProduct extends product {
  cantidad: number;
}
