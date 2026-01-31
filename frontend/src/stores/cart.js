import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref(JSON.parse(localStorage.getItem("cart")) || []);

  const totalItems = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );
  const totalPrice = computed(() =>
    items.value.reduce((total, item) => total + item.price * item.quantity, 0),
  );

  async function addItem(product) {
    // 1. Optimistic Update (Frontend feels instant)
    const existingItem = items.value.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({
        ...product,
        quantity: 1,
      });
    }
    saveCart();

    // 2. Background Sync (If logged in)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      try {
        await fetch("http://localhost:3000/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
          }),
        });
        // Note: We don't await the final result because the backend is debounced.
        // We trust the optimistic update, creating a snappy feel.
      } catch (e) {
        console.error("Failed to sync cart:", e);
        // Ideally rollback here if strict consistency is needed
      }
    }
  }

  function removeItem(productId) {
    const index = items.value.findIndex((item) => item.id === productId);
    if (index !== -1) {
      items.value.splice(index, 1);
      saveCart();
    }
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find((item) => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        removeItem(productId);
      } else {
        saveCart();
      }
    }
  }

  function clearCart() {
    items.value = [];
    saveCart();
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(items.value));
  }

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
});
