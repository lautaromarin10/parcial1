import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // BASE
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        register: resolve(__dirname, "src/pages/auth/register/register.html"),
        // ADMIN
        adminHome: resolve(
          __dirname,
          "src/pages/admin/adminHome/adminHome.html",
        ),
        categories: resolve(
          __dirname,
          "src/pages/admin/categories/categories.html",
        ),
        orders: resolve(__dirname, "src/pages/admin/orders/orders.html"),
        products: resolve(__dirname, "src/pages/admin/products/products.html"),
        // CLIENT
        storeHome: resolve(__dirname, "src/pages/store/home/home.html"),
        storeCart: resolve(__dirname, "src/pages/store/cart/cart.html"),
        productDetail: resolve(
          __dirname,
          "src/pages/store/productDetail/productDetail.html",
        ),
        clientOrders: resolve(__dirname, "src/pages/client/orders/orders.html"),
      },
    },
  },
  plugins: [tailwindcss()],
  base: "./",
});
