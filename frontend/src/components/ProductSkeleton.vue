<template>
  <div
    class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100"
  >
    <!-- Image Skeleton -->
    <div class="w-full aspect-square bg-gray-200"></div>

    <!-- Content Skeleton -->
    <div class="p-4 space-y-3">
      <!-- Title -->
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      <!-- Price -->
      <div class="h-4 bg-gray-200 rounded w-1/4"></div>

      <!-- Footer/User info -->
      <div class="flex items-center gap-2 pt-2">
        <div class="h-6 w-6 rounded-full bg-gray-200"></div>
        <div class="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
</template>
