import {ethers} from "ethers";
import DonationPlatform from '../../../artifacts/contracts/DonationPlatform.sol/DonationPlatform.json';

const CONTRACT_ADDRESS = "0xfb5A36E7C7bf6179bEfb46B24cE6d2A7953C4695";

export const getCurrentUser = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner()
}

// Check if a wallet is already connected
export const checkWalletConnection = async () => {
     try {
        if (!window.ethereum) {
            console.error("MetaMask is not detected.");
            return false;  // Return false if MetaMask is not installed
        }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts.length > 0) {
            console.log('✅ Wallet connected:', accounts[0]);
            return true;  // Wallet connected successfully
        } else {
            console.warn('⚠️ MetaMask detected but no accounts connected.');
            return false;  // No accounts connected
        }
    } catch (error) {
        console.error('❌ Error checking wallet connection:', error);
        return false;  // Return false on any error
    }
};

export const getContract = async () => {
    if (!window.ethereum) {
        throw new Error("MetaMask is not detected.");
    }
    const signer = await getCurrentUser();
    return new ethers.Contract(CONTRACT_ADDRESS, DonationPlatform.abi, signer);
};

/** Admins **/
export const fetchAdmins = async () => {
    const contract = await getContract();
    return await contract.getAdmins();
};

export const addNewAdmin = async (newAdminAddress) => {
    const contract = await getContract();
    const tx = await contract.addAdmin(newAdminAddress);
    await tx.wait();
    alert(`New admin added: ${newAdminAddress}`);
};

export const checkIfAdmin = async () => {
    const contract = await getContract();
    const signer = await getCurrentUser();
    const address = await signer.getAddress();
    try {
        return await contract.isAdmin(address)
    } catch (error) {
        return false;
    }
};

export const removeAdmin = async (adminAddress) => {
    const contract = await getContract();
    const tx = await contract.removeAdmin(adminAddress);
    await tx.wait();
    alert(`Admin removed: ${adminAddress}`);
};

/** Campaigns **/
export const fetchCampaigns = async () => {
    const contract = await getContract();
    return await contract.getAllCampaigns();
}

export const donateToCampaign = async (campaignId, donationAmount) => {
    try {
        const contract = await getContract();

        const tx = await contract.donateToCampaign(campaignId, {
            value: ethers.parseEther(donationAmount.toString())
        });

        await tx.wait();
        alert(`✅ Successfully donated ${donationAmount} ETH!`);
    } catch (error) {
        console.error("❌ Error donating:", error);
        alert("❌ Failed to donate. Please try again.");
    }
};

export const createCampaign = async (title, description, goalAmount) => {
    const contract = await getContract();
    const tx = await contract.createCampaign(title, description, goalAmount);
    await tx.wait();
};

export const endCampaign = async (campaignId) => {
    const contract = await getContract();
    const tx = await contract.endCampaign(campaignId);
    await tx.wait();
    alert(`Campaign ${campaignId} has ended.`);
};

export const withdrawFromCampaign = async (campaignId, amount) => {
    try {
        const contract = await getContract();
        const tx = await contract.withdrawFunds(campaignId, ethers.parseEther(amount.toString()));
        await tx.wait();
        alert(`✅ Successfully withdrawn ${amount} ETH from campaign ${campaignId}`);
    } catch (error) {
        console.error("❌ Error withdrawing funds:", error);
        alert("❌ Withdrawal failed. Check if you are an admin and have enough funds.");
    }
};
