import type { Order } from "../../types/order";
import type { UserDTO } from "../../types/userDTO";

export const getOrders = async (): Promise<Order[] | null> => {
  try {
    const response = await fetch("/data/pedidos.json");

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    return data as Order[];
  } catch (e) {
    console.error(e);

    return null;
  }
};

export const getOrdersByUser = async (
  user: UserDTO,
): Promise<Order[] | null> => {
  if (!user) {
    return null;
  }

  const orders = await getOrders();

  if (!orders) {
    return null;
  }

  const userOrders = orders.filter(
    (order: Order) => order.usuarioDto.id === user.id,
  );

  if (!userOrders) {
    return null;
  }

  return userOrders;
};
