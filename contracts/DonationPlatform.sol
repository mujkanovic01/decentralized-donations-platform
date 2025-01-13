// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DonationPlatform {
    struct Campaign {
        uint campaignId;
        string title;
        string description;
        uint goalAmount;
        uint amountRaised;
        uint amountWithdrawn;
        bool isActive;
        bool isEnded;
    }

    mapping(uint => Campaign) public campaigns;
    mapping(address => bool) public admins;  // Tracks if an address is an admin
    address[] public adminList;  // Stores all admin addresses to display
    uint public campaignCount;

    event CampaignCreated(uint campaignId);
    event DonationReceived(uint campaignId, uint amount);
    event CampaignEnded(uint campaignId);
    event AdminAdded(address newAdmin);
    event AdminRemoved(address removedAdmin);
    event FundsWithdrawn(uint campaignId, uint amount, address recipient);

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier validCampaign(uint campaignId) {
        require(campaigns[campaignId].isActive, "Campaign does not exist");
        _;
    }

    modifier hasSufficientFunds(uint campaignId, uint amount) {
        require(campaigns[campaignId].amountRaised >= amount, "Insufficient funds");
        _;
    }

    constructor() {
        admins[msg.sender] = true;
        adminList.push(msg.sender);  // Adding the deployer as the first admin
    }

    // Return all admin addresses
    function getAdmins() public view returns (address[] memory) {
        require(adminList.length > 0, "No admins available.");  // Prevent empty result

        return adminList;
    }

    // Check if an address is an admin
    function isAdmin(address account) public view returns (bool) {
        return admins[account];
    }

    // Add a new admin
    function addAdmin(address newAdmin) public onlyAdmin {
        require(!admins[newAdmin], "Address is already an admin");
        admins[newAdmin] = true;
        adminList.push(newAdmin);
        emit AdminAdded(newAdmin);
    }

    // Remove an admin
    function removeAdmin(address adminToRemove) public onlyAdmin {
        require(admins[adminToRemove], "Address is not an admin");

        admins[adminToRemove] = false;

        // Remove the admin from the list
        for (uint i = 0; i < adminList.length; i++) {
            if (adminList[i] == adminToRemove) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        emit AdminRemoved(adminToRemove);
    }

    // Return all campaigns
    function getAllCampaigns() public view returns (Campaign[] memory) {
        require(campaignCount > 0, "No campaigns available.");  // Prevent empty result

        Campaign[] memory allCampaigns = new Campaign[](campaignCount);
        for (uint i = 0; i < campaignCount; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    // Create a new campaign (Admin only)
    function createCampaign(string memory _title, string memory _description, uint _goalAmount) public onlyAdmin {
        campaigns[campaignCount] = Campaign(campaignCount, _title, _description, _goalAmount, 0, 0, true, false);
        emit CampaignCreated(campaignCount);
        campaignCount++;
    }

    // Donate to a campaign (Open to all)
    function donateToCampaign(uint campaignId) public payable validCampaign(campaignId) {
        require(!campaigns[campaignId].isEnded, "Campaign already ended");
        require(msg.value > 0, "Donation must be greater than zero");

        campaigns[campaignId].amountRaised += msg.value;
        emit DonationReceived(campaignId, msg.value);
    }

    // End a campaign (Admin only)
    function endCampaign(uint campaignId) public onlyAdmin validCampaign(campaignId) {
        campaigns[campaignId].isEnded = true;
        emit CampaignEnded(campaignId);
    }

    // Withdraw funds for a specific campaign (Admin only)
    function withdrawFunds(uint campaignId, uint amount) public onlyAdmin validCampaign(campaignId) hasSufficientFunds(campaignId, amount) {
        require(amount <= address(this).balance, "Not enough funds in the contract");

        payable(msg.sender).transfer(amount);
        // Not sure if this should or shouldn't be done
         campaigns[campaignId].amountWithdrawn += amount;

        emit FundsWithdrawn(campaignId, amount, msg.sender);
    }
}