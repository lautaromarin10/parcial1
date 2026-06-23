import type { User } from "../types/user";
import type { UserDTO } from "../types/userDTO";

export const saveUserInLocalStorage = (user: User) => {
  if (!user) {
    return;
  }

  const userToSave: UserDTO = {
    id: user.id,
    mail: user.mail,
    rol: user.rol,
    nombre: user.nombre,
    apellido: user.apellido,
    celular: user.celular,
  };

  localStorage.setItem("user", JSON.stringify(userToSave));
};

export const getUserFromLocalStorage = (): UserDTO | null => {
  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user) as UserDTO;
  } catch (error) {
    console.error("Error al leer el usuario del localStorage:", error);

    return null;
  }
};

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem("user");
};
