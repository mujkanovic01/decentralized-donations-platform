<template>
    <div class="w-100 pa-8">
        <div class="d-flex flex-row">
            <h1>Donation Campaigns</h1>
            <v-spacer />
            <v-btn v-if="isAdmin" @click="goToAdminPage">admin</v-btn>
        </div>

        <!-- Create Campaign Form (Only visible for Admins) -->
        <div v-if="isAdmin">
            <h2>Create a New Campaign</h2>
            <form @submit.prevent="createNewCampaign" class="d-flex flex-row align-center">
                <v-text-field class="ma-2" v-model="campaignTitle" placeholder="Title" required hide-details/>
                <v-textarea
                    class="ma-2"
                    row-height="15"
                    rows="1"
                    auto-grow
                    v-model="campaignDescription"
                    placeholder="Description"
                    required
                    hide-details
                />
                <v-text-field
                    class="ma-2"
                    v-model="campaignGoal"
                    placeholder="Goal Amount (ETH)"
                    type="number"
                    step="0.01"
                    required
                    hide-details
                />
                <v-btn class="ma-2" type="submit">Create Campaign</v-btn>
            </form>
            <hr class="my-4" />
        </div>

        <h2>Active Campaigns:</h2>
        <div class="campaign-grid" v-if="campaigns.length > 0">
            <v-card width="450" v-for="campaign in campaigns" :key="campaign.id">
                <v-img
                    class="align-end text-white"
                    height="200"
                    cover
                    :src="campaign.campaignImg"
                />
                <v-card-title>{{ campaign.title }}</v-card-title>
                <v-card-subtitle style="color: green">Active Campaign</v-card-subtitle>
                <v-card-text>
                    {{ campaign.description }}
                    <br/><br/>
                    Raised: {{ campaign.amountRaised }} ETH / {{ campaign.goalAmount }} ETH
                    <div v-if="isAdmin" style="color: gray">
                      Withdrawn: {{ campaign.amountWithdrawn }} ETH
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn variant="text" color="primary" @click="openDialog('donate', campaign.id)">Donate</v-btn>
                    <v-btn v-if="isAdmin" variant="text" @click="openDialog('withdraw', campaign.id)">Withdraw</v-btn>
                    <v-spacer />
                    <v-btn v-if="isAdmin" variant="text" color="error" @click="openEndDialog(campaign.id)">End</v-btn>
                </v-card-actions>
            </v-card>
        </div>
        <div v-else>
            <h3>No Campaigns Available</h3>
        </div>

        <hr class="my-4">

        <h2>Finished Campaigns</h2>
        <div class="campaign-grid" v-if="endedCampaigns.length > 0">
            <v-card width="450" v-for="campaign in endedCampaigns" :key="campaign.id">
                <v-img
                    class="align-end text-white"
                    height="200"
                    cover
                    :src="campaign.campaignImg"
                />
                <v-card-title>{{ campaign.title }}</v-card-title>
                <v-card-subtitle style="color: red">Ended Campaign</v-card-subtitle>
                <v-card-text>
                    {{ campaign.description }}
                    <br/><br/>
                    Raised: {{ campaign.amountRaised }} ETH / {{ campaign.goalAmount }} ETH
                    <div v-if="isAdmin" style="color: gray">
                      Withdrawn: {{ campaign.amountWithdrawn }} ETH
                    </div>
                </v-card-text>
                <v-card-actions v-if="isAdmin">
                    <v-btn variant="text" @click="openDialog('withdraw', campaign.id)">Withdraw</v-btn>
                </v-card-actions>
            </v-card>
        </div>
        <div v-else>
            <h3>No Campaigns Available</h3>
        </div>

        <!-- Vuetify Dialog for Donation and Withdrawal -->
        <v-dialog v-model="showDialog" max-width="500px">
            <v-card style="background-color: rgb(24, 24, 24); color: white">
                <v-card-title>
                    <span v-if="dialogType === 'donate'">Donate to Campaign</span>
                    <span v-else>Withdraw Funds from Campaign</span>
                </v-card-title>

                <v-card-text>
                    <v-text-field
                        v-model="dialogAmount"
                        label="Amount (ETH)"
                        type="number"
                        step="0.01"
                        required
                    />
                </v-card-text>

                <v-card-actions>
                    <v-btn text @click="showDialog = false">Cancel</v-btn>
                    <v-btn color="primary" @click="confirmTransaction">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Vuetify Dialog for Ending a campaign -->
        <v-dialog v-model="showEndDialog" max-width="500px">
            <v-card style="background-color: rgb(24, 24, 24); color: white">
                <v-card-title>
                    <span>End the campaign</span>
                </v-card-title>

                <v-card-text>
                    Are you sure you want to end this campaign?
                </v-card-text>

                <v-card-actions>
                    <v-btn text @click="showEndDialog = false">Cancel</v-btn>
                    <v-btn color="primary" @click="confirmEnd">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {
  checkIfAdmin,
  createCampaign,
  fetchCampaigns,
  donateToCampaign,
  withdrawFromCampaign,
  endCampaign
} from '@/services/web3.js';
import {ethers} from "ethers";
import router from '@/router/index.js';

const campaigns = ref([]);
const endedCampaigns = ref([]);
const campaignTitle = ref('');
const campaignDescription = ref('');
const campaignGoal = ref('');
const isAdmin = ref(false);
const showDialog = ref(false);
const showEndDialog = ref(false);
const dialogType = ref('');
const dialogAmount = ref('');
const selectedCampaignId = ref(null);

const getCampaigns = async () => {
  try {
    const allCampaigns = await fetchCampaigns();
    const activeCampaigns = allCampaigns.filter(campaign => !campaign.isEnded);
    const finishedCampaigns = allCampaigns.filter(campaign => campaign.isEnded);

    campaigns.value = activeCampaigns.map(campaign => ({
      id: campaign.campaignId,
      title: campaign.title,
      description: campaign.description,
      goalAmount: ethers.formatEther(campaign.goalAmount),
      amountRaised: ethers.formatEther(campaign.amountRaised),
      amountWithdrawn: ethers.formatEther(campaign.amountWithdrawn),
      isEnded: campaign.isEnded,
      campaignImg: getPlaceholderImage(),
    }));

    endedCampaigns.value = finishedCampaigns.map(campaign => ({
      id: campaign.campaignId,
      title: campaign.title,
      description: campaign.description,
      goalAmount: ethers.formatEther(campaign.goalAmount),
      amountRaised: ethers.formatEther(campaign.amountRaised),
      amountWithdrawn: ethers.formatEther(campaign.amountWithdrawn),
      isEnded: campaign.isEnded,
      campaignImg: getPlaceholderImage(),
    }));
  } catch (error) {
    console.error("Error fetching campaigns:", error);
  }
};

const createNewCampaign = async () => {
  if (!isAdmin.value) {
    alert("You are not authorized to create campaigns.");
    return;
  }

  try {
    await createCampaign(campaignTitle.value, campaignDescription.value, ethers.parseEther(campaignGoal.value.toString()));
    alert("Campaign Created Successfully!");
    getCampaigns();
  } catch (error) {
    console.error("Error creating campaign:", error);
  }
};

const goToAdminPage = () => router.push('/admin');

const openDialog = (type, campaignId) => {
  dialogType.value = type;
  selectedCampaignId.value = campaignId;
  showDialog.value = true;
};

const openEndDialog = (campaignId) => {
  selectedCampaignId.value = campaignId;
  showEndDialog.value = true;
};

const confirmTransaction = async () => {
  showDialog.value = false;
  try {
    if (dialogType.value === 'donate') {
      await donateToCampaign(selectedCampaignId.value, dialogAmount.value);
    } else if (dialogType.value === 'withdraw') {
      await withdrawFromCampaign(selectedCampaignId.value, dialogAmount.value);
    }
    getCampaigns();
  } catch (error) {
    console.error(`Error during ${dialogType.value}:`, error);
  }
};

const confirmEnd = async () => {
  showEndDialog.value = false;
  try {
    await endCampaign(selectedCampaignId.value);
    getCampaigns();
  } catch (error) {
    console.error("Error ending campaign:", error);
  }
};

const getPlaceholderImage = () => {
  const color = getRandomColor();
  return `https://placehold.co/600x400/${color}/${color}`;
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

onMounted(async () => {
  isAdmin.value = await checkIfAdmin();
  getCampaigns();
});
</script>

<style scoped>
.campaign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

img {
  max-width: 100%;
  border-radius: 10px;
}
</style>
