import type { product } from "./product";

export interface orderDetail {
  cantidad: number;
  subtotal: number;
  producto: product;
}
