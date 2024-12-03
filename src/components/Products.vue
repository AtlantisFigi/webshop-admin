<template>
  <div class="min-h-screen bg-gray-100 text-black p-8">
    <!-- Zoekbalk -->
    <div class="flex justify-between items-center mb-12">
      <h1 class="text-2xl font-semibold">Productbeheer</h1>
      <div class="relative w-full md:w-1/2">
        <input
            type="text"
            v-model="searchTerm"
            placeholder="Zoek naar producten..."
            class="w-full p-3 pl-4 pr-24 bg-transparent text-black border-b-2 border-black focus:outline-none focus:border-black"
        />
        <button
            @click="updateUrlAndSearch"
            class="absolute right-0 top-0 bottom-0 text-black px-6 py-2 m-1"
            :disabled="isLoading"
        >
          Zoek
        </button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row">
      <!-- Categorieën Tabel -->
      <aside class="md:w-full pr-0 md:pr-3 mb-4 md:mb-0">
        <table class="w-full table-auto border-collapse border border-gray-300">
          <thead>
          <tr class="bg-gray-200 text-gray-700">
            <th class="border border-gray-300 p-3 text-left">Naam</th>
            <th class="border border-gray-300 p-3 text-left">Beschrijving</th>
            <th class="border border-gray-300 p-3 text-left">Prijs</th>
            <th class="border border-gray-300 p-3 text-left">Voorraad</th>
            <th class="border border-gray-300 p-3 text-center">Acties</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="product in sortedProducts"
              :key="product.id"
              class="hover:bg-gray-100"
          >
            <td class="border border-gray-300 p-3">
              <span v-if="!product.isEditing">{{ product.name }}</span>
              <input
                  v-if="product.isEditing"
                  v-model="product.name"
                  class="w-full p-2 border border-gray-300 rounded"
              />
            </td>
            <td class="border border-gray-300 p-3">
              <span v-if="!product.isEditing">{{ product.description }}</span>
              <input
                  v-if="product.isEditing"
                  v-model="product.description"
                  class="w-full p-2 border border-gray-300 rounded"
              />
            </td>
            <td class="border border-gray-300 p-3">
              <span v-if="!product.isEditing">€{{ product.price }}</span>
              <input
                  v-if="product.isEditing"
                  v-model="product.price"
                  type="number"
                  class="w-full p-2 border border-gray-300 rounded"
              />
            </td>
            <td class="border border-gray-300 p-3 text-center">
              <span v-if="!product.isEditing">{{ product.stock }}</span>
              <input
                  v-if="product.isEditing"
                  v-model="product.stock"
                  type="number"
                  class="w-full p-2 border border-gray-300 rounded"
              />
            </td>
            <td class="border border-gray-300 p-3 text-center">
              <button
                  @click="product.isEditing ? saveProduct(product) : editProduct(product)"
                  class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mr-2"
              >
                {{ product.isEditing ? "Opslaan" : "Bewerken" }}
              </button>
              <button
                  @click="deleteProduct(product.id)"
                  class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              >
                Verwijderen
              </button>
            </td>
          </tr>
          </tbody>
        </table>
        <button
            @click="addNewProduct"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <span class="text-xl">+</span> New product
        </button>
      </aside>

      <!-- Productenbeheer -->
      <div class="sm:w-auto md:w-full">
        <div v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</div>

        <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
              v-for="product in sortedProducts"
              :key="product.id"
              class="bg-gray-100 hover:bg-gray-200 transition-all duration-300 ease-in-out rounded-lg overflow-hidden"
          >
            <div class="relative w-full mb-1" style="aspect-ratio: 4 / 5">
              <img :src="product.image" alt="" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute top-2 left-2 bg-black text-white p-2 text-sm">
                €{{ product.price }}
              </div>
            </div>
            <h2 class="text-lg px-2">{{ product.name }}</h2>
            <p class="text-sm text-gray-600 mb-4 px-2">{{ product.description }}</p>
          </div>
        </div>

        <div v-if="isLoading" class="text-center">
          <p>Producten laden...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "../apiService.ts";
import { useRouter, useRoute } from "vue-router";
import { Product } from "../Product.ts";
import { Category } from "../category.ts";

const router = useRouter();
const route = useRoute();

// Reactieve variabelen
const searchTerm = ref<string>(""); // Zoekterm
const selectedCategories = ref<string[]>([]); // Geselecteerde categorieën (meerdere mogelijk)
const products = ref<Product[]>([]); // Productenlijst
const categories = ref<Category[]>([]); // Lijst van alle categorieën
const errorMessage = ref<string>(""); // Error berichten
const isLoading = ref<boolean>(false); // Laadstatus
const sortOption = ref<string>("none"); // Sorteeroptie
const priceRange = ref<number[]>([0, 1000]); // Prijsbereik

// Functie: Haal categorieën op van de API
const fetchCategories = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get("api/category/all");
    categories.value = response.data; // Vul de categorieënlijst
  } catch (error) {
    console.error("Error fetching categories:", error);
    errorMessage.value = "Er is een fout opgetreden bij het ophalen van de categorieën.";
  } finally {
    isLoading.value = false;
  }
};

// Functie: Haal producten op op basis van zoekterm en geselecteerde categorieën
const searchProducts = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.post("api/product/search", {
      name: searchTerm.value.trim(),
      categories: selectedCategories.value,
    });
    products.value = response.data; // Vul de productenlijst
    if (products.value.length === 0) {
      errorMessage.value = "Geen producten gevonden voor deze zoekterm.";
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    errorMessage.value = "Er is een fout opgetreden bij het ophalen van de producten.";
  } finally {
    isLoading.value = false;
  }
};

const deleteProduct = async (productId: number) => {
  const confirmDelete = confirm("Weet je zeker dat je dit product wilt verwijderen?");
  if (!confirmDelete) return;

  isLoading.value = true;

  try {
    await api.delete(`api/product/${productId}`);
    products.value = products.value.filter((product) => product.id !== productId);
  } catch (error) {
    console.error("Error deleting product:", error);
    errorMessage.value = "Er is een fout opgetreden bij het verwijderen van het product.";
  } finally {
    isLoading.value = false;
  }
};

// Functie: Bijwerken van de URL en uitvoeren van een nieuwe zoekopdracht
const updateUrlAndSearch = () => {
  const query = {
    search: searchTerm.value || undefined,
    categories: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
  };

  router.push({ query });
  searchProducts();
};

// Functie: Schakel de bewerkingsmodus in
const editProduct = (product: Product) => {
  product.isEditing = true;
};

// Functie: Sla de gewijzigde productgegevens op
const saveProduct = async (product: Product) => {
  isLoading.value = true;

  try {
    const response = await api.put(`api/product/${product.id}`, {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categories: product.categories,
      quantity: product.quantity,
    });

    const updatedProduct = response.data;
    const index = products.value.findIndex((p) => p.id === updatedProduct.id);
    if (index !== -1) {
      products.value[index] = updatedProduct;
    }
    product.isEditing = false; // Stop de bewerkingsmodus
  } catch (error) {
    console.error("Error updating product:", error);
    errorMessage.value = "Er is een fout opgetreden bij het bijwerken van het product.";
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle Hook: Voer bij het laden van de component de eerste zoekopdracht uit
onMounted(async () => {
  await fetchCategories(); // Haal categorieën op

  // Zoekterm en categorieën uit de URL-query ophalen
  const querySearch = route.query.search as string;
  const queryCategories = route.query.categories as string | string[];

  if (querySearch) {
    searchTerm.value = querySearch; // Stel zoekterm in vanuit de URL
  }

  if (queryCategories) {
    selectedCategories.value = Array.isArray(queryCategories)
        ? queryCategories
        : [queryCategories];
  }

  // Voer een eerste zoekopdracht uit
  searchProducts();
});

// Reactieve sortering van producten
const sortedProducts = computed(() => {
  let sortedList = [...products.value];

  if (sortOption.value === "priceAsc") {
    return sortedList.sort((a, b) => a.price - b.price);
  } else if (sortOption.value === "priceDesc") {
    return sortedList.sort((a, b) => b.price - a.price);
  }

  return sortedList;
});
</script>

<style scoped>
</style>
