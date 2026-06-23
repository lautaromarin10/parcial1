import type { StatCard } from "../../../types/statCard";
import { getCategories } from "../../../utils/services/getCategories";
import { getOrders } from "../../../utils/services/getOrders";
import { getProducts } from "../../../utils/services/getProducts";
import { checkUserRole } from "../../../utils/checkUserRole";
import "../../../utils/renderHeader";

checkUserRole("ADMIN");

const statCard = ({ number, label, href }: StatCard) => {
  return `
          <div
              class="flex justify-between bg-card rounded-md flex-col p-4 ring-2 ring-muted-foreground min-h-40"
            >
              <h3 class="text-xl">${number} ${label}</h3>
              <a href="${href}" class="button primary w-fit">Gestionar</a>
            </div>
          </div>
    
    `;
};

document.addEventListener("DOMContentLoaded", async () => {
  const statisticsContainer = document.getElementById(
    "statisticsContainer",
  ) as HTMLElement;

  if (!statisticsContainer) {
    return;
  }

  const categories = await getCategories();
  const availableProducts = await getProducts();
  const allProducts = await getProducts({ onlyAvailable: false });
  const orders = await getOrders();

  const statisticsResume: StatCard[] = [
    {
      label: "Categorías",
      number: categories?.length || 0,
      href: "/src/pages/admin/categories/categories.html",
    },
    {
      label: "Productos",
      number: allProducts?.length || 0,
      href: "/src/pages/admin/products/products.html",
    },
    {
      label: "Ordenes",
      number: orders?.length || 0,
      href: "/src/pages/admin/orders/orders.html",
    },
    {
      label: "Productos disponibles",
      number: availableProducts.length || 0,
      href: "",
    },
  ];

  statisticsContainer.innerHTML = statisticsResume
    .map((stat: StatCard) => {
      return statCard(stat);
    })
    .join("");
});
