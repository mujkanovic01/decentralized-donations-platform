import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {checkWalletConnection} from "@/services/web3.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/campaigns',
      name: 'campaigns',
      component: () => import('../views/CampaignView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboard.vue')
    }
  ],
})

// Global navigation guard for access control
router.beforeEach(async (to, from, next) => {
    console.log('safasf')
    const isConnected = await checkWalletConnection();
    console.log('abc', isConnected)
    // Redirect if user tries to access campaigns without connecting MetaMask
    if (to.path === '/campaigns' && !isConnected) {
        alert('You need to connect your MetaMask wallet first.');
        next('/');
    } else if(to.path === '/' && isConnected) {
        next('/campaigns');
    } else {
        next();  // Allow the navigation
    }
});

export default router
