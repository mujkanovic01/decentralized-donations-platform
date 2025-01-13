<template>
    <div class="pa-8">
        <div class="d-flex flex-row align-center">
          <v-btn @click="goToCampaigns" variant="flat" class="mx-2" size="small"> <- </v-btn>
          <h1>Admin Dashboard</h1>
        </div>

      <div class="d-flex flex-row align-center w-25">
        <v-text-field class="ma-2" v-model="newAdminAddress" placeholder="Enter wallet address" hide-details/>
        <v-btn @click="addAdmin">Add New Admin</v-btn>
      </div>
      <hr class="my-4"/>
        <h2>Admin List</h2>
        <ul class="ml-4">
            <li v-for="admin in admins" :key="admin">
                {{ admin }}
                <v-btn class="ma-2" @click="removeAdminHandler(admin)">Remove Admin</v-btn>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAdmins, addNewAdmin, removeAdmin } from '@/services/web3.js';
import router from "@/router/index.js";

const admins = ref([]);
const newAdminAddress = ref('');

const loadAdmins = async () => {
    try {
        admins.value = await fetchAdmins();
    } catch (error) {
        console.error("Error loading admins:", error);
    }
};

const addAdmin = async () => {
    if (!newAdminAddress.value) {
        alert("Please enter a valid address.");
        return;
    }
    try {
        await addNewAdmin(newAdminAddress.value);
        loadAdmins();  // Refresh list
    } catch (error) {
        console.error("Error adding admin:", error);
    }
};

const removeAdminHandler = async (adminAddress) => {
    if (confirm(`Are you sure you want to remove admin ${adminAddress}?`)) {
        try {
            await removeAdmin(adminAddress);
            loadAdmins();  // Refresh list
        } catch (error) {
            console.error("Error removing admin:", error);
        }
    }
};

const goToCampaigns = () => {
    router.push('/campaigns');
};

onMounted(loadAdmins);
</script>
