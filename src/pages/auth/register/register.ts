import { validateEmail } from "../../../utils/auth/validateEmail";
import { validatePassword } from "../../../utils/auth/validatePassword";
import { saveUserInLocalStorage } from "../../../utils/handleLocalStorage";
import type { User } from "../../../types/user";
import type { registerForm } from "../../../types/registerForm";
import { getUsers } from "../../../utils/services/getUsers";

const registerForm = document.getElementById("registerForm") as HTMLFormElement;
const errorContainer = document.getElementById("errorContainer") as HTMLElement;

const clearErrorMessage = () => {
  if (errorContainer) {
    errorContainer.innerHTML = "";
  }
};

const redirectAfterRegister = () => {
  const USER_REDIRECT = "/src/pages/store/home/home.html";

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

const isEmailAvailable = async (email: string) => {
  const users = await getUsers();

  if (users?.find((user) => user.mail === email)) {
    return false;
  }

  return true;
};

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(registerForm);
  const datos = Object.fromEntries(formData.entries()) as registerForm;

  clearErrorMessage();

  if (!datos.email || !datos.password || !datos.nombre || !datos.apellido) {
    errorMessage("Todos los campos son obligatorios");
    return;
  }

  if (!validateEmail(datos.email)) {
    errorMessage("El Mail ingresado no es valido");
    return;
  }

  if (!validatePassword(datos.password)) {
    errorMessage(
      "La contraseña ingresada es muy corta, el mínimo es 6 caracteres",
    );
    return;
  }

  if (!(await isEmailAvailable(datos.email))) {
    errorMessage("El Correo electrónico ingresado ya esta en uso");
    return;
  }

  const newUser: User = {
    rol: "USUARIO",
    id: Math.floor(Math.random() * 1000000),
    password: datos.password,
    mail: datos.email,
    nombre: datos.nombre,
    apellido: datos.apellido,
  };

  saveUserInLocalStorage(newUser);
  redirectAfterRegister();
});
