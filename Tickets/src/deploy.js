// const hre = require("hardhat");
const { ethers } = require("ethers");

function prettyDate(value) {
    return new Date(value).toLocaleString("en-GB", {
        day:    "2-digit",
        month:  "2-digit",
        year:   "2-digit",
        hour:   "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

async function deploy(eventName, eventDateInput, price, maxSupply, org) {
    const artifact = require("../artifacts/contracts/EventTicketNFT.sol/EventTicketNFT.json");
    const { abi, bytecode } = artifact;

    const jsDate = new Date(eventDateInput);
    const EVENT_TIMESTAMP = Math.floor(jsDate.getTime() / 1000);
    const EVENT_DATE_PRETTY = prettyDate(jsDate);

    const TICKET_PRICE = ethers.parseEther(price.toString());
    const MAX_SUPPLY   = maxSupply;

    const factory = new ethers.ContractFactory(abi, bytecode, org);
    const ticket  = await factory.deploy(
        eventName,
        EVENT_TIMESTAMP,
        TICKET_PRICE,
        MAX_SUPPLY
    );
    await ticket.waitForDeployment();

    console.log("-----------------------------------------------------------");
    console.log("✅  EventTicketNFT deployed →", await ticket.getAddress());
    console.log("Event:       ", eventName);
    console.log("Event date:  ", EVENT_DATE_PRETTY, "(unix)");
    console.log("Ticket price:", ethers.formatEther(TICKET_PRICE), "ETH");
    console.log("Max supply:  ", MAX_SUPPLY);
    console.log("-----------------------------------------------------------");

    return { contractAddress: await ticket.getAddress() };
}

module.exports = { deploy };
