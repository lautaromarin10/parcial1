import type { Rol } from "../types/rol";
import { getUserFromLocalStorage } from "./handleLocalStorage";

export const checkUserRole = (expectedRole: Rol) => {
  const LOGIN_REDIRECT = "/src/pages/auth/login/login.html";
  const HOME_REDIRECT = "/src/pages/store/home/home.html";
  const user = getUserFromLocalStorage();

  if (!user) {
    window.location.href = LOGIN_REDIRECT;
    return;
  }

  //DEJO QUE LOS ADMINS VEAN TODOS LOS SITIOS
  if (user.rol === "ADMIN") {
    return;
  }

  if (expectedRole !== user.rol) {
    window.location.href = HOME_REDIRECT;
    return;
  }

  return;
};
