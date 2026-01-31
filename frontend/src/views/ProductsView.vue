<script setup>
import { useProductStore } from "../stores/products";
import ProductCard from "../components/ProductCard.vue";
import ProductSkeleton from "../components/ProductSkeleton.vue";
import { Search, Filter, SlidersHorizontal } from "lucide-vue-next";

// import { useIntlayer } from 'vue-intlayer' // Removed
// import dictionary from '../manual-dictionary.json' // Removed
import { useContent } from "../composables/useContent";

const productStore = useProductStore();
const { products } = useContent();
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-24 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header & Controls -->
      <div
        class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">
            {{ products.title }}
          </h2>
          <p class="mt-2 text-gray-500">{{ products.subtitle }}</p>
        </div>

        <div class="flex gap-3">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              type="text"
              :placeholder="products.search"
              class="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            <SlidersHorizontal class="w-5 h-5" />
            <span class="hidden sm:inline">{{ products.filters }}</span>
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <!-- Skeleton Loading -->
        <template v-if="productStore.isLoading">
          <ProductSkeleton v-for="n in 8" :key="n" />
        </template>

        <!-- Actual Products -->
        <template v-else>
          <ProductCard
            v-for="product in productStore.products"
            :key="product.id"
            :product="product"
          />
        </template>
      </div>
    </div>
  </div>
</template>
