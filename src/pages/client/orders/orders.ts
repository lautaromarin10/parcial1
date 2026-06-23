import type { Order } from "../../../types/order";
import type { orderDetail } from "../../../types/orderDetail";
import { getUserFromLocalStorage } from "../../../utils/handleLocalStorage";
import { getOrdersByUser } from "../../../utils/services/getOrders";
import { checkUserRole } from "../../../utils/checkUserRole";
import { ENVIO } from "../../../utils/config";
import "../../../utils/renderHeader";

checkUserRole("USUARIO");

const ordersContainer = document.getElementById("ordersContainer");
const modalWrapper = document.getElementById("modalWrapper");
const orderDetailContainer = document.getElementById("orderDetailContainer");

const badgeClass = {
  ENTREGADO: "bg-success text-white",
  EN_PREPARACION: "bg-muted-foreground bg-success/50 animate-pulse",
  PENDIENTE: "bg-yellow-500 text-white",
  CANCELADO: "bg-error/50 text-white",
};

const closeModal = () => {
  if (modalWrapper) {
    modalWrapper.style.display = "none";
  }
};

const openModal = (order: Order) => {
  if (!modalWrapper || !orderDetailContainer) return;

  const fechaFormateada = new Date(order.fecha).toLocaleDateString("es-AR");
  const subtotal = order.detalles.reduce(
    (sum, detail) => sum + detail.subtotal,
    0,
  );
  const total = subtotal + ENVIO;

  orderDetailContainer.innerHTML = `
    <div class="max-w-2xl mx-auto p-6 bg-white ring ring-muted-foreground rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl">Detalle del Pedido #${order.id}</h2>
        <button
          id="closeModalButton"
          class="button button--small secondary"
        >
          ✕
        </button>
      </div>
      <div class="mb-6 p-4 bg-card rounded-md">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm">Estado</p>
            <p class="badge ${badgeClass[order.estado]} capitalize inline-block mt-1">${order.estado.replace("_", " ").toLowerCase()}</p>
          </div>
          <div>
            <p class="text-sm">Fecha</p>
            <p class="">🗓️ ${fechaFormateada}</p>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg mb-3">Información de Entrega</h3>
        <div class="p-4 bg-card rounded-md text-sm">
          <p><strong>Nombre:</strong> ${order.usuarioDto.nombre} ${order.usuarioDto.apellido}</p>
          <p><strong>Email:</strong> ${order.usuarioDto.mail}</p>
          <p><strong>Teléfono:</strong> ${order.usuarioDto.celular}</p>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Productos (${order.detalles.length})</h3>
        <div class="space-y-2">
          ${order.detalles
            .map(
              (detail: orderDetail) => `
            <div class="flex items-center gap-3 p-3 bg-card rounded-md">
              <img
                src="${detail.producto.imagen}"
                alt="${detail.producto.nombre}"
                class="w-12 h-12 object-cover rounded"
              />
              <div class="flex-1">
                <p class="font-semibold">${detail.producto.nombre}</p>
                <p class="text-sm">Cantidad: ${detail.cantidad}</p>
              </div>
              <p class="font-semibold">$${detail.subtotal}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <div class="p-4 bg-card rounded-md ">
        <h3 class="text-lg font-semibold mb-3">Desglose de Costos</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>$${subtotal}</span>
          </div>
          <div class="flex justify-between">
            <span>Envío</span>
            <span>$${ENVIO}</span>
          </div>
          <div class="flex justify-between font-semibold text-base border-t pt-2 mt-2">
            <span>Total</span>
            <span>$${total}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const closeButton = orderDetailContainer.querySelector("#closeModalButton");
  closeButton?.addEventListener("click", closeModal);

  modalWrapper.style.display = "flex";
};

export const orderCard = (order: Order) => {
  const { id, detalles, estado, fecha, total } = order;

  const resumeDetail = detalles.slice(0, 3);
  const fechaFormateada = new Date(fecha).toLocaleDateString();

  return `
    <div
          class="flex flex-col p-8 bg-card rounded-md ring ring-muted-foreground cursor-pointer hover:ring-primary transition-all"
          data-order-id="${id}"
        >
          <div class="flex flex-row mb-2 flex-wrap gap-2 justify-between">
            <h2 class="text-xl">Pedido #${id}</h2>
            <div class="flex flex-row gap-2 flex-wrap items-center">
              <span class="badge ${badgeClass[estado]} capitalize">${estado.replace("_", " ").toLowerCase()}</span>
              <span class="badge bg-muted-foreground">${detalles.length} Productos</span>
            </div>
          </div>
          <p>🗓️ Fecha: ${fechaFormateada}</p>
          <div class="flex flex-col my-4 border-y border-muted-foreground py-4">
            <p class="mb-2">Resumen ${resumeDetail.length < detalles.length ? `(Mostrando ${resumeDetail.length} de  ${detalles.length})` : ""}</p>
            <ul class="text-sm bg-white w-fit p-4 rounded-md ring ring-muted-foreground">
            ${resumeDetail
              .map((orderDetail: orderDetail) => {
                return `
                    <li>${orderDetail.producto.nombre} (x${orderDetail.cantidad})</li>
                `;
              })
              .join("")}
            </ul>
          </div>
          <p class="text-lg">Total: $${total}</p>
        </div>
    `;
};

document.addEventListener("DOMContentLoaded", async () => {
  if (!ordersContainer) {
    return null;
  }

  const currentUser = getUserFromLocalStorage();

  if (!currentUser) {
    return;
  }

  const userOrders = await getOrdersByUser(currentUser);

  if (!userOrders) {
    console.log("No tiene ordenes");
    return;
  }

  ordersContainer.innerHTML = userOrders
    .map((order: Order) => {
      return orderCard(order);
    })
    .join("");

  ordersContainer.addEventListener("click", (event) => {
    const card = (event.target as HTMLElement).closest(
      "[data-order-id]",
    ) as HTMLElement | null;

    if (!card) return;

    const orderId = Number(card.dataset.orderId);
    const order = userOrders.find((o) => o.id === orderId);

    if (order) {
      openModal(order);
    }
  });
});

modalWrapper?.addEventListener("click", (event) => {
  if (event.target === modalWrapper) {
    closeModal();
  }
});
