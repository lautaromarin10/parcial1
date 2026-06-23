import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
} from "./handleLocalStorage";

const getCartItemsCount = () => {
  const cart = localStorage.getItem("cart");

  if (!cart) {
    return 0;
  }

  try {
    const parsedCart = JSON.parse(cart);

    if (!Array.isArray(parsedCart)) {
      return 0;
    }

    return parsedCart.reduce(
      (total: number, item: { cantidad?: number }) =>
        total + (Number(item?.cantidad) || 0),
      0,
    );
  } catch {
    return 0;
  }
};

const renderHeaderActions = () => {
  const headerActions = document.getElementById("headerActions");

  if (!headerActions) {
    return;
  }

  const user = getUserFromLocalStorage();

  const actions: string[] = [];

  if (user?.rol === "ADMIN") {
    actions.push(`
      <a
        href="/src/pages/admin/adminHome/adminHome.html"
        class="button button--small"
      >
        Panel admin
      </a>
    `);
    actions.push(`
      <a
        href="/src/pages/store/home/home.html"
        class="button button--small"
      >
        Ir a la tienda
      </a>
    `);
  } else if (user?.rol === "USUARIO") {
    actions.push(`
      <a
        href="/src/pages/client/orders/orders.html"
        class="button button--small"
      >
        Mis pedidos
      </a>
    `);
    actions.push(`
      <a
        class="button button--small primary flex items-center gap-2"
        href="/src/pages/store/cart/cart.html"
      >
        <img
          src="/icons/cart.svg"
          alt="Carrito de compras"
          class="icon invert"
        />
        <span>Carrito</span>
        <span
          id="cartBadge"
          class="flex size-5 text-center  items-center justify-center rounded-full bg-white text-primary px-2 text-xs"
        >
          ${getCartItemsCount()}
        </span>
      </a>
    `);
  } else {
    actions.push(`
      <a
        href="/src/pages/auth/login/login.html"
        class="button button--small primary"
      >
        Iniciar sesión
      </a>
    `);
  }

  if (user) {
    actions.push(`
      <button
        type="button"
        id="logoutButton"
        class="button button--small secondary"
      >
        Cerrar sesión
      </button>
    `);
  }

  headerActions.innerHTML = `
    <ul class="flex flex-row items-center gap-2">
      ${actions.map((action) => `<li>${action}</li>`).join("")}
    </ul>
  `;

  const logoutButton = document.getElementById("logoutButton");
  logoutButton?.addEventListener("click", () => {
    removeUserFromLocalStorage();
    window.location.href = "/src/pages/auth/login/login.html";
  });
};

document.addEventListener("DOMContentLoaded", renderHeaderActions);
window.addEventListener("cart:updated", renderHeaderActions);
window.addEventListener("storage", (event) => {
  if (event.key === "cart") {
    renderHeaderActions();
  }
});
