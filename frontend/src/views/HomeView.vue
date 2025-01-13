<template>
    <div class="landing-container">
        <h1>Decentralized Donations Platform</h1>
        <p>Support great causes using blockchain technology.</p>
        <button @click="connectWallet">Connect with MetaMask</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getContract } from '@/services/web3.js';
import { ref } from 'vue';

const router = useRouter();
const errorMessage = ref('');

const connectWallet = async () => {
    try {
        await getContract();
        router.push('/campaigns');  // Redirect after successful connection
    } catch (error) {
        errorMessage.value = error.message;
    }
};
</script>

<style scoped>
.landing-container {
    text-align: center;
    padding: 50px;
}
button {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border-radius: 8px;
    cursor: pointer;
}
.error {
    color: red;
}
</style>
