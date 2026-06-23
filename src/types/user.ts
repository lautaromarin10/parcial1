import type { Rol } from "./rol";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular?: string;
  rol: Rol;
  password: string;
}
