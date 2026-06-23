import type { orderDetail } from "./orderDetail";
import type { paymentMethod } from "./paymentMethod";
import type { State } from "./state";
import type { UserDTO } from "./userDTO";

export interface Order {
  id: number;
  fecha: string;
  estado: State;
  total: number;
  formaPago: paymentMethod;
  detalles: orderDetail[];
  usuarioDto: UserDTO;
}
