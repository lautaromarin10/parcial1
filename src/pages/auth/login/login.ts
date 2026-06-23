import type { loginForm } from "../../../types/loginForm";
import { getUsers } from "../../../utils/services/getUsers";
import { validateEmail } from "../../../utils/auth/validateEmail";
import { validatePassword } from "../../../utils/auth/validatePassword";
import { saveUserInLocalStorage } from "../../../utils/handleLocalStorage";
import type { User } from "../../../types/user";

const loginForm = document.getElementById("loginForm") as HTMLFormElement;
const errorContainer = document.getElementById("errorContainer") as HTMLElement;

const clearErrorMessage = () => {
  if (errorContainer) {
    errorContainer.innerHTML = "";
  }
};

const redirectAfterLogin = (user: User) => {
  const ADMIN_REDIRECT = "/src/pages/admin/adminHome/adminHome.html";
  const USER_REDIRECT = "/src/pages/store/home/home.html";

  if (!user.rol) {
    return;
  }

  if (user.rol.toUpperCase() === "ADMIN") {
    window.location.href = ADMIN_REDIRECT;
    return;
  }

  window.location.href = USER_REDIRECT;
};

const errorMessage = (message: string) => {
  clearErrorMessage();

  if (errorContainer) {
    errorContainer.innerHTML = `
    <div class="w-full rounded-md bg-error/60 p-2 flex items-center justify-center">
  <p class="text-white">${message}</p>
    </div>
  `;
  }
};

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(loginForm);
  const datos = Object.fromEntries(formData.entries()) as loginForm;

  clearErrorMessage();

  if (!datos.email || !datos.password) {
    errorMessage("Tanto el Correo como la Contraseña son obligatorios");
    return;
  }

  if (!validateEmail(datos.email)) {
    errorMessage("El Mail ingresado no es valido");
    return;
  }

  if (!validatePassword(datos.password)) {
    errorMessage("La contraseña ingresada es muy corta, el mínimo es 6");
    return;
  }

  const users = await getUsers();

  if (!users) {
    errorMessage("No pudimos encontrar usuarios");
    return;
  }

  const findUser = users?.find(
    (user) => user.mail === datos.email && user.password === datos.password,
  ) as User;

  if (!findUser) {
    errorMessage(
      "El usuario ingresado no existe o las credenciales son incorrectas",
    );
  }

  saveUserInLocalStorage(findUser);
  redirectAfterLogin(findUser);
});
