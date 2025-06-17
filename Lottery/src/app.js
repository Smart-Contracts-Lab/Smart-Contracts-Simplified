const express = require("express");
const app = express();
const path = require("path");
const hre = require("hardhat");
const dotenv = require('dotenv');
dotenv.config();

const { deployLottery } = require('./deploy');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname)));
app.use("/images", express.static(path.join(__dirname, "src/images")));


const PRIVATE_KEY_ORGANIZER = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY_USER = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const PRIVATE_KEYS_PARTICIPANTS = [
    "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
    "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0",
    "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd",
    "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0",
    "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61",
    "0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa",
    "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd",
    "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
    "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
    "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897"
];

const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");
const walletOrganizer = new hre.ethers.Wallet(PRIVATE_KEY_ORGANIZER, provider);
const walletUser = new hre.ethers.Wallet(PRIVATE_KEY_USER, provider);

let contractAddress = "";
let vrfCoordinatorAddress = "";
let currentStep = 1;

const contractAbi = require("../artifacts/contracts/FairLottery.sol/FairLottery.json").abi;
const vrfMockAbi = require("../artifacts/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json").abi;

function render(res, vars = {}) {
    res.render("index", {
        organizer: walletOrganizer.address,
        participant: walletUser.address,
        deployed: !!contractAddress,
        lotteryInfo: vars.lotteryInfo ?? null,
        initialBalance: vars.initialBalance ?? null,
        organizerEntered: vars.organizerEntered ?? false,
        afterBalance: vars.afterBalance ?? null,
        participantEntered: vars.participantEntered ?? false,
        afterInfo: vars.afterInfo ?? null,
        drawRequested: vars.drawRequested ?? false,
        winner: vars.winner ?? null,
        prize: vars.prize ?? null,
        alert: vars.alert ?? null,
        currentStep
    });
}

app.get("/", async (req, res) => {
    currentStep = 1;
    contractAddress = vrfCoordinatorAddress = "";
    render(res);
});

app.post("/deploy-contract", async (req, res) => {
    const maxParticipants = parseInt(req.body.maxParticipants);
    const contribution = req.body.contributionAmount;
    const fee = req.body.organizerFee;

    if (maxParticipants > 10 || maxParticipants < 5 || contribution > 100 || contribution < 1 || fee > 5 || fee < 1) {
        currentStep = 1;
        const alert = "Please follow the instructions to fill up the fields."
        render(res, { alert: alert });
    } else {
        const deployment = await deployLottery(maxParticipants, contribution, fee, walletOrganizer);
        contractAddress = deployment.contractAddress;
        vrfCoordinatorAddress = deployment.vrfCoordinatorAddress;
        currentStep = 2;
        render(res);
    }
    
});

app.post("/lottery-info", async (req, res) => {
    const lottery = new hre.ethers.Contract(contractAddress, contractAbi, walletOrganizer);
    const info = await lottery.getLotteryInfo();
    const {
        participantsCount: participantsCountBN,
        maxSlots:       maxSlotsBN,
        requiredContribution: requiredContributionBN,
        lotteryFee: lotteryFeeBN,
        participantList
    } = info;
    
    const participantsCount = participantsCountBN;
    const maxSlots = maxSlotsBN;
    const lotteryFee = hre.ethers.formatEther(lotteryFeeBN);
    const requiredContribution = hre.ethers.formatEther(requiredContributionBN);
    
    currentStep = 3;
    render(res, {
        lotteryInfo: {
            participantsCount,
            maxSlots,
            requiredContribution,
            lotteryFee,
            participantList
        }
    });
});

app.post("/user-enter", async (req, res) => {
    const lottery = new hre.ethers.Contract(contractAddress, contractAbi, walletUser);
    await (await lottery.enterLottery({ value: await lottery.contributionAmount() })).wait();
    currentStep = 4;
    render(res, { organizerEntered: true });
});

app.post("/check-balance", async (req, res) => {
    const lottery = new hre.ethers.Contract(contractAddress, contractAbi, walletUser);
    const balance = await lottery.getBalance();
    const formatted = hre.ethers.formatEther(balance);
    currentStep = 5;
    render(res, { initialBalance: formatted });
});

app.post("/participant-enter", async (req, res) => {
    const lottery = new hre.ethers.Contract(contractAddress, contractAbi, walletUser);
    const maxParticipants = await lottery.maxParticipants();
    const availableSpots = Number(maxParticipants) - 1;
    const contribution = await lottery.contributionAmount();

    for (let step = 0; step < availableSpots; step++) {
        const wallet = new hre.ethers.Wallet(PRIVATE_KEYS_PARTICIPANTS[step], provider);
        const lottery = new hre.ethers.Contract(contractAddress, contractAbi, wallet);
        await (await lottery.enterLottery({ value: contribution })).wait();
    }

    currentStep = 6;
    render(res, { participantEntered: true });
});

app.post("/check-balance-after", async (req, res) => {
    const lottery = new hre.ethers.Contract(contractAddress, contractAbi, walletUser);
    const balance = await lottery.getBalance();
    const formatted = hre.ethers.formatEther(balance);
    currentStep = 6;
    render(res, { afterBalance: formatted });
});

app.post("/lottery-info-after", async (req, res) => {
    const lottery = new hre.ethers.Contract(contractAddress, contractAbi, walletUser);
    const balance = await lottery.getBalance();
    const formatted = hre.ethers.formatEther(balance);
    const info = await lottery.getLotteryInfo();
    const {
        participantsCount: participantsCountBN,
        maxSlots:       maxSlotsBN,
        requiredContribution: requiredContributionBN,
        lotteryFee: lotteryFeeBN,
        participantList
    } = info;
    
    const participantsCount = participantsCountBN;
    const maxSlots = maxSlotsBN;
    const lotteryFee = hre.ethers.formatEther(lotteryFeeBN);
    const requiredContribution = hre.ethers.formatEther(requiredContributionBN);
    
    currentStep = 7;
    render(res, {
        afterInfo: {
            participantsCount,
            maxSlots,
            requiredContribution,
            lotteryFee,
            participantList
        },
        afterBalance: formatted
    });
});

app.post("/draw-winner", async (req, res) => {
    const lottery = new hre.ethers.Contract(contractAddress, contractAbi, walletOrganizer);
    const vrfCoordinator = new hre.ethers.Contract(vrfCoordinatorAddress, vrfMockAbi, walletOrganizer);

    await (await lottery.drawWinner()).wait();
    const requestId = await lottery.requestId();

    await (await vrfCoordinator.fulfillRandomWords(requestId, contractAddress)).wait();

    const winnerAddr = await lottery.winner();
    const contrib = await lottery.contributionAmount();
    const maxP = await lottery.maxParticipants();
    const feeAmt = await lottery.organizerFee();
    const total = contrib * maxP;
    const prize = total - feeAmt;
    const formattedPrize = hre.ethers.formatEther(prize);

    currentStep = 8;
    render(res, {
        organizerEntered: true,
        participantEntered: true,
        drawRequested: true,
        winner: winnerAddr,
        prize: formattedPrize
    });
});





