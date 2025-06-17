// deploy.js
require("dotenv").config();
const { ethers } = require("ethers");
const path = require("path");

/**
 * Deploys a VRFCoordinatorV2Mock and FairLottery contract,
 * creates/funds a subscription, and registers the lottery as a consumer.
 *
 * @param {number} participants      - max number of participants
 * @param {string} contribution      - ether amount per entry (e.g. "0.01")
 * @param {string} fee               - organizer fee in ether (e.g. "0.005")
 * @param {ethers.Signer} signer     - an ethers.js Signer connected to your local node
 * @returns {Object} deployment details
 */
async function deployLottery(participants, contribution, fee, signer) {
    const BASE_FEE       = ethers.parseEther("0.25");
    const GAS_PRICE_LINK = BigInt(1e9);

    // 1️⃣ Deploy the mock coordinator
    const mockArtifact = require(path.join(
        __dirname,
        "../artifacts/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json"
    ));
    const VRFCoordinatorV2MockFactory = new ethers.ContractFactory(
        mockArtifact.abi,
        mockArtifact.bytecode,
        signer
    );
    const vrfCoordinator = await VRFCoordinatorV2MockFactory.deploy(
        BASE_FEE,
        GAS_PRICE_LINK
    );
    await vrfCoordinator.waitForDeployment();
    console.log("VRFCoordinatorV2Mock deployed at:", vrfCoordinator.target);

    // 2️⃣ Create & fund the subscription
    // dry‐run to get the returned subId
    const subId = await vrfCoordinator.createSubscription.staticCall();
    // actual on‐chain call
    await (await vrfCoordinator.createSubscription()).wait();
    const FUND_AMOUNT = ethers.parseEther("10");
    await (await vrfCoordinator.fundSubscription(subId, FUND_AMOUNT)).wait();
    console.log("Subscription created and funded, subId:", subId.toString());

    // 3️⃣ Deploy the FairLottery consumer
    const keyHash = process.env.KEY_HASH;
    const lotteryArtifact = require(path.join(
        __dirname,
        "../artifacts/contracts/FairLottery.sol/FairLottery.json"
    ));
    const FairLotteryFactory = new ethers.ContractFactory(
        lotteryArtifact.abi,
        lotteryArtifact.bytecode,
        signer
    );
    const lottery = await FairLotteryFactory.deploy(
        participants,
        ethers.parseEther(contribution),
        ethers.parseEther(fee),
        subId,
        vrfCoordinator.target,
        keyHash
    );
    await lottery.waitForDeployment();
    console.log("Lottery Contract deployed at:", lottery.target);

    // 4️⃣ Register the lottery as a VRF consumer
    await (await vrfCoordinator.addConsumer(subId, lottery.target)).wait();
    console.log("Consumer registered");

    return {
        contractAddress:       lottery.target,
        subscriptionId:        subId.toString(),
        vrfCoordinatorAddress: vrfCoordinator.target,
        organizer:             await lottery.organizer(),
    };
}

module.exports = { deployLottery };
