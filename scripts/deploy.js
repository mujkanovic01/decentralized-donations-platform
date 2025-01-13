const hre = require("hardhat");

async function main() {
    const DonationPlatform = await hre.ethers.getContractFactory("DonationPlatform");

    // Deploy the contract correctly
    const donationPlatform = await DonationPlatform.deploy();

    // Ensure the contract has finished deploying
    await donationPlatform.waitForDeployment();

    // Log the contract address
    console.log(`DonationPlatform deployed to: ${donationPlatform.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});