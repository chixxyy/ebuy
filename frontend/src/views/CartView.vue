<script setup>
import { useCartStore } from "../stores/cart";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
} from "lucide-vue-next";

// import { useIntlayer } from 'vue-intlayer' // Removed
// import dictionary from '../manual-dictionary.json' // Removed
import { useContent } from "../composables/useContent";

const cartStore = useCartStore();
const { cart, items } = useContent();

const getDisplayName = (item) => {
  return items.value[String(item.id)]?.name || item.name;
};

const getDisplayCategory = (item) => {
  return items.value[String(item.id)]?.category || item.category;
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-24 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-8">
        {{ cart.title }}
      </h2>

      <div
        v-if="cartStore.items.length === 0"
        class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100/50"
      >
        <div class="bg-indigo-50 p-6 rounded-full mb-6">
          <ShoppingCart class="w-12 h-12 text-indigo-500" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ cart.empty }}</h3>
        <p class="text-gray-500 mb-8 text-center max-w-md">
          {{ cart.empty_desc }}
        </p>
        <router-link
          to="/products"
          class="inline-flex items-center px-8 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
        >
          {{ cart.start_shopping }}
        </router-link>
      </div>

      <div v-else class="lg:grid lg:grid-cols-12 lg:gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-8">
          <div
            class="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100"
          >
            <ul role="list" class="divide-y divide-gray-100">
              <li
                v-for="item in cartStore.items"
                :key="item.id"
                class="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-gray-50/50 transition-colors"
              >
                <div
                  class="flex-shrink-0 w-24 h-24 border border-gray-100 rounded-xl overflow-hidden bg-gray-50"
                >
                  <img
                    :src="item.image"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                </div>

                <div class="flex-1 w-full">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3
                        class="text-lg font-bold text-gray-900 leading-tight mb-1"
                      >
                        {{ getDisplayName(item) }}
                      </h3>
                      <p class="text-sm text-gray-500 font-medium">
                        {{ getDisplayCategory(item) }}
                      </p>
                    </div>
                    <div class="text-lg font-bold text-gray-900">
                      ${{ item.price * item.quantity }}
                    </div>
                  </div>

                  <div class="mt-4 flex items-center justify-between">
                    <!-- Quantity Control -->
                    <div
                      class="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200"
                    >
                      <button
                        @click="
                          cartStore.updateQuantity(item.id, item.quantity - 1)
                        "
                        class="p-1 hover:bg-white rounded-md text-gray-600 transition-colors disabled:opacity-50"
                      >
                        <Minus class="w-4 h-4" />
                      </button>
                      <span
                        class="w-10 text-center font-semibold text-gray-700 text-sm"
                        >{{ item.quantity }}</span
                      >
                      <button
                        @click="
                          cartStore.updateQuantity(item.id, item.quantity + 1)
                        "
                        class="p-1 hover:bg-white rounded-md text-gray-600 transition-colors"
                      >
                        <Plus class="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      @click="cartStore.removeItem(item.id)"
                      class="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Trash2 class="w-4 h-4" />
                      <span class="hidden sm:inline">{{ cart.remove }}</span>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-4 mt-8 lg:mt-0">
          <div
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28"
          >
            <h2 class="text-lg font-bold text-gray-900 mb-6">
              {{ cart.summary }}
            </h2>

            <div class="space-y-4 mb-6">
              <div class="flex justify-between text-sm text-gray-600">
                <span>{{ cart.subtotal }}</span>
                <span class="font-medium text-gray-900"
                  >${{ cartStore.totalPrice }}</span
                >
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>{{ cart.shipping }}</span>
                <span class="text-green-600 font-medium">{{ cart.free }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>{{ cart.tax }}</span>
                <span class="font-medium text-gray-900">$0.00</span>
              </div>
              <div
                class="border-t border-gray-100 pt-4 flex justify-between items-center"
              >
                <span class="text-base font-bold text-gray-900">{{
                  cart.total
                }}</span>
                <span class="text-2xl font-bold text-indigo-600"
                  >${{ cartStore.totalPrice }}</span
                >
              </div>
            </div>

            <button
              @click="$router.push('/checkout')"
              class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {{ cart.checkout }}
              <ArrowRight
                class="w-5 h-5 group-hover:translate-x-1 transition-transform"
              />
            </button>

            <div
              class="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500"
            >
              <ShieldCheck class="w-4 h-4 text-green-500" />
              <span>Secure checkout powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
