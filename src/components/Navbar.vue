<script setup lang="ts">
import { ref } from 'vue';
import { XMarkIcon, Bars3Icon } from '@heroicons/vue/24/solid'
//import UserPopper from "./UserPopper.vue";

const showSidebar = ref(false);

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
}
</script>

<template>
  <nav class="bg-gray-100 text-black shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
      <button @click="toggleSidebar" class="block md:hidden text-black ml-4">
        <Bars3Icon class="w-6 h-6 text-black" />
      </button>

      <div class="flex space-x-6 items-center">

      </div>

      <!-- Logo in het midden -->
      <div class="flex-grow text-center">
        <router-link to="/" class="text-xl font-bold tracking-wide hover:text-gray-300 transition">OBSIDIAN</router-link>
      </div>

      <!-- Account en Cart rechts -->
      <div class="flex space-x-6 items-center">
        <router-link to="/cart" class="hover:text-black transition">...</router-link>
      </div>
    </div>

    <!-- Mobile Sidebar Menu -->
    <div v-if="showSidebar" class="fixed inset-0 bg-gray-900 bg-opacity-75 z-50">
      <div class="w-64 bg-white h-full p-4 flex flex-col shadow-lg rounded-t-lg">
        <button @click="toggleSidebar" class="self-end mb-4">
          <XMarkIcon class="w-6 h-6 text-black" />
        </button>
        <router-link to="/account" class="py-2 border-b border-gray-300 hover:bg-gray-200 transition" @click="toggleSidebar">Account</router-link>
        <router-link to="/cart" class="py-2 border-b border-gray-300 hover:bg-gray-200 transition" @click="toggleSidebar">Cart</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Optionele stijl voor smooth transitions */
.fixed {
  transition: transform 0.3s ease-in-out;
}
</style>
