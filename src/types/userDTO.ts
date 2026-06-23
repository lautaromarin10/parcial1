import type { User } from "./user";

export type UserDTO = Pick<
  User,
  "id" | "rol" | "mail" | "nombre" | "apellido" | "celular"
>;
