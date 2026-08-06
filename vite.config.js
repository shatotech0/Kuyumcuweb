import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        collections: resolve(__dirname, 'collections.html'),
        productDetail: resolve(__dirname, 'product-detail.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogDetail: resolve(__dirname, 'blog-detail.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        account: resolve(__dirname, 'account.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
      },
    },
  },
  server: {
    open: true,
  },
});
