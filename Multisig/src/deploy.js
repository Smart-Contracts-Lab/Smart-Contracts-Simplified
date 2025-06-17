const hre = require("hardhat");
const { ethers } = require("ethers");

async function deploy(merchant, participants, totalFunds, creator) {
    const GroupBookingArtifact = require("../artifacts/contracts/GroupBooking.sol/GroupBooking.json");

    const factory = new ethers.ContractFactory(
        GroupBookingArtifact.abi,
        GroupBookingArtifact.bytecode,
        creator
    );

    const booking = await factory.deploy(
        merchant,
        participants,
        ethers.parseEther(totalFunds.toString()),
    );

    await booking.waitForDeployment();

    const contractAddress = await booking.getAddress();
    console.log("Group Booking Contract deployed to:", contractAddress);

    return { contractAddress };
}


module.exports = { deploy };