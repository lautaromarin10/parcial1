import type { Order } from "../../../types/order";
import type { orderDetail } from "../../../types/orderDetail";
import { getOrders } from "../../../utils/services/getOrders";
import { getUsers } from "../../../utils/services/getUsers";
import { checkUserRole } from "../../../utils/checkUserRole";
import { ENVIO } from "../../../utils/config";
import "../../../utils/renderHeader";

checkUserRole("ADMIN");

const ordersContainer = document.getElementById("ordersContainer");
const statusFilter = document.getElementById(
  "statusFilter",
) as HTMLSelectElement | null;
const modalWrapper = document.getElementById("modalWrapper");
const orderDetailContainer = document.getElementById("orderDetailContainer");

const badgeClass: Record<string, string> = {
  ENTREGADO: "bg-success text-white",
  EN_PREPARACION: "bg-muted-foreground bg-success/50 animate-pulse",
  PENDIENTE: "bg-yellow-500 text-white",
  CANCELADO: "bg-error/50 text-white",
};

type OrderWithClientName = Order & {
  clientName: string;
};

let ordersState: OrderWithClientName[] = [];
let activeFilter = "TODOS";

const normalizeStatus = (status: string) =>
  status.replace("_", " ").toLowerCase();

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-AR");

const getClientName = (
  order: Order,
  users: Array<{ id: number; nombre: string; apellido: string }> | null,
) => {
  const user = users?.find((item) => item.id === order.usuarioDto.id);

  if (user) {
    return `${user.nombre} ${user.apellido}`;
  }

  return `${order.usuarioDto.nombre} ${order.usuarioDto.apellido}`;
};

const closeModal = () => {
  if (modalWrapper) {
    modalWrapper.style.display = "none";
  }
};

const openModal = (order: OrderWithClientName) => {
  if (!modalWrapper || !orderDetailContainer) {
    return;
  }

  const subtotal = order.detalles.reduce(
    (sum, detail) => sum + detail.subtotal,
    0,
  );

  orderDetailContainer.innerHTML = `
    <div class="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 ring ring-muted-foreground shadow-xl">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm">Detalle del pedido</p>
          <h2 class="text-2xl">Pedido #${order.id}</h2>
        </div>
        <button id="closeModalButton" class="button button--small secondary">✕</button>
      </div>

      <div class="mb-4 rounded-md bg-card p-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm">Cliente</p>
            <p class="font-semibold">${order.clientName}</p>
          </div>
          <div>
            <p class="text-sm">Estado</p>
            <span class="badge ${badgeClass[order.estado]} capitalize mt-1 inline-block">${normalizeStatus(order.estado)}</span>
          </div>
          <div>
            <p class="text-sm">Fecha</p>
            <p>🗓️ ${formatDate(order.fecha)}</p>
          </div>
          <div>
            <p class="text-sm">Forma de pago</p>
            <p class="capitalize">${order.formaPago.toLowerCase()}</p>
          </div>
        </div>
      </div>

      <div class="mb-4 rounded-md bg-card p-4">
        <label class="flex flex-col gap-2 text-sm">
          <span>Cambiar estado</span>
          <select id="orderStatusSelect" data-order-id="${order.id}" class="rounded-md border border-muted-foreground px-3 py-2">
            <option value="PENDIENTE" ${order.estado === "PENDIENTE" ? "selected" : ""}>Pendiente</option>
            <option value="EN_PREPARACION" ${order.estado === "EN_PREPARACION" ? "selected" : ""}>En preparación</option>
            <option value="ENTREGADO" ${order.estado === "ENTREGADO" ? "selected" : ""}>Entregado</option>
            <option value="CANCELADO" ${order.estado === "CANCELADO" ? "selected" : ""}>Cancelado</option>
          </select>
        </label>
      </div>

      <div class="mb-4">
        <h3 class="mb-3 text-lg font-semibold">Productos (${order.detalles.length})</h3>
        <div class="space-y-2">
          ${order.detalles
            .map(
              (detail: orderDetail) => `
                <div class="flex items-center gap-3 rounded-md bg-card p-3">
                  <img src="${detail.producto.imagen}" alt="${detail.producto.nombre}" class="h-12 w-12 rounded object-cover" />
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

      <div class="rounded-md bg-card p-4">
        <h3 class="mb-3 text-lg font-semibold">Resumen de pago</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>$${subtotal}</span>
          </div>
          <div class="flex justify-between">
            <span>Envío</span>
            <span>$${ENVIO}</span>
          </div>
          <div class="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>$${order.total + ENVIO}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const closeButton = orderDetailContainer.querySelector("#closeModalButton");
  closeButton?.addEventListener("click", closeModal);

  const statusSelect = orderDetailContainer.querySelector(
    "#orderStatusSelect",
  ) as HTMLSelectElement | null;

  statusSelect?.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    const orderId = Number(target.dataset.orderId);
    const orderToUpdate = ordersState.find((item) => item.id === orderId);

    if (!orderToUpdate) {
      return;
    }

    orderToUpdate.estado = target.value as Order["estado"];
    renderOrders(getFilteredOrders());

    const updatedOrder = ordersState.find((item) => item.id === orderId);
    if (updatedOrder) {
      openModal(updatedOrder);
    }
  });

  modalWrapper.style.display = "flex";
};

export const orderCard = (order: OrderWithClientName) => {
  const { id, detalles, estado, fecha, total, clientName } = order;
  const fechaFormateada = formatDate(fecha);

  return `
    <div
      class="flex cursor-pointer flex-col gap-3 rounded-md bg-card p-6 ring ring-muted-foreground transition-all hover:ring-primary"
      data-order-id="${id}"
    >
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 class="text-xl">Pedido #${id}</h2>
          <p class="text-sm">Cliente: ${clientName}</p>
        </div>
        <span class="badge ${badgeClass[estado]} capitalize">${normalizeStatus(estado)}</span>
      </div>

      <p>🗓️ ${fechaFormateada}</p>

      <div class="flex flex-wrap gap-2">
        <span class="badge bg-muted-foreground">${detalles.length} productos</span>
        <span class="badge bg-card text-foreground">Envío: $${ENVIO}</span>
        <span class="badge bg-card text-foreground">Total: $${total + ENVIO}</span>
      </div>
    </div>
  `;
};

const getFilteredOrders = () => {
  if (activeFilter === "TODOS") {
    return ordersState;
  }

  return ordersState.filter((order) => order.estado === activeFilter);
};

const renderOrders = (orders: OrderWithClientName[]) => {
  if (!ordersContainer) {
    return;
  }

  if (!orders.length) {
    ordersContainer.innerHTML = `
      <div class="flex min-h-60 flex-col items-center justify-center rounded-md p-8 ring-2 ring-muted-foreground">
        <h2 class="mb-2 text-xl">No hay pedidos para este filtro</h2>
        <p class="text-sm text-muted-foreground">Probá con otro estado para ver más resultados.</p>
      </div>
    `;
    return;
  }

  ordersContainer.innerHTML = orders.map((order) => orderCard(order)).join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  if (!ordersContainer) {
    return;
  }

  const orders = await getOrders();
  const users = await getUsers();

  if (!orders) {
    return;
  }

  ordersState = orders
    .map((order) => ({
      ...order,
      clientName: getClientName(order, users),
    }))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  renderOrders(getFilteredOrders());

  statusFilter?.addEventListener("change", (event) => {
    const selectedStatus = (event.target as HTMLSelectElement).value;
    activeFilter = selectedStatus;
    renderOrders(getFilteredOrders());
  });

  ordersContainer.addEventListener("click", (event) => {
    const card = (event.target as HTMLElement).closest(
      "[data-order-id]",
    ) as HTMLElement | null;

    if (!card) {
      return;
    }

    const orderId = Number(card.dataset.orderId);
    const order = ordersState.find((item) => item.id === orderId);

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
