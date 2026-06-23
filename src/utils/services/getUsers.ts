import type { User } from "../../types/user";

export const getUsers = async (): Promise<User[] | null> => {
  try {
    const response = await fetch("/data/usuarios.json");

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    return data as User[];
  } catch (e) {
    console.error(e);

    return null;
  }
};
