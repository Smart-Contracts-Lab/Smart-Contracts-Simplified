const express = require("express");
const app = express();
const path = require("path");
const hre = require("hardhat");
const { ethers } = require("ethers");
const dotenv = require('dotenv');
dotenv.config();

const { deploy } = require('./deploy');
const { setPriority } = require("os");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname)));
app.use("/images", express.static(path.join(__dirname, "src/images")));


const PRIVATE_KEY_MERCHANT = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEYS_PARTICIPANTS = [
    "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
    "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0",
    "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd",
    "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0"
];

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const walletMerchant = new ethers.Wallet(PRIVATE_KEY_MERCHANT, provider);
const walletCreator = new ethers.Wallet(PRIVATE_KEYS_PARTICIPANTS[0], provider);
const walletParticipantOne = new ethers.Wallet(PRIVATE_KEYS_PARTICIPANTS[1], provider);
const walletParticipantTwo = new ethers.Wallet(PRIVATE_KEYS_PARTICIPANTS[2], provider);
const walletParticipantThree = new ethers.Wallet(PRIVATE_KEYS_PARTICIPANTS[3], provider);

let contractAddress = "";
let currentStep = 1;

const contractAbi = require("../artifacts/contracts/GroupBooking.sol/GroupBooking.json").abi;

function render(res, vars = {}) {
    res.render("index", {
        merchant: walletMerchant.address,
        participants: {
            participantOne: walletCreator.address,
            participantTwo: walletParticipantOne.address,
            participantThree: walletParticipantTwo.address,
            participantFour: walletParticipantThree.address,
        },
        deployed: !!contractAddress,
        paidCount: vars.paidCount ?? null,
        ownSharePaid: vars.ownSharePaid ?? false,
        verifiedOne: vars.verifiedOne ?? null,
        othersSharePaid: vars.othersSharePaid ?? false,
        verifiedTwo: vars.verifiedTwo ?? null,
        billPaid: vars.billPaid ?? false,
        verifiedThree: vars.verifiedThree ?? null,
        fundsWithdrawn: vars.fundsWithdrawn ?? false,
        verifiedFour: vars.verifiedFour ?? null,
        alert: vars.alert ?? null,
        currentStep
    });
}

app.get("/", async (req, res) => {
    currentStep = 1;
    contractAddress = "";
    render(res);
});

app.post("/deploy-contract", async (req, res) => {
    const merchant = req.body.merchant;
    const participants = [
        req.body.participant1,
        req.body.participant2,
        req.body.participant3,
        req.body.participant4
    ];
    const totalFunds = req.body.totalFunds;

    if (totalFunds > 1000 || totalFunds < 600) {
        currentStep = 1;
        const alert = "Please follow the instructions to fill up the fields."
        render(res, { alert: alert });
    } else {
        const deployment = await deploy(merchant, participants, totalFunds, walletCreator);
        contractAddress = deployment.contractAddress;
        currentStep = 2;
        render(res);
    }
});

app.post('/check-paid-count', async (req, res) => {
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    const count = await multisig.paidCount();
    currentStep = 3;
    render(res, {
        paidCount: count
    });
});

app.post('/pay-share-one', async (req, res) => {
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    await (await multisig.payShare({ value: await multisig.share() })).wait();
    currentStep = 4;
    render(res, {
        ownSharePaid: true
    })
});

app.post('/verify-transfer', async (req, res) => {
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    const count = await multisig.paidCount();
    const balance = await multisig.getBalance();
    const formattedBalance = await ethers.formatEther(balance.toString());
    currentStep = 5;
    render(res, {
        verifiedOne: {
            count: count,
            balance: formattedBalance
        }
    });
});

app.post('/pay-share-two', async (req, res) => {
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletParticipantOne);
    await (await multisig.payShare({ value: await multisig.share() })).wait();

    const multisigA = new ethers.Contract(contractAddress, contractAbi, walletParticipantTwo);
    await (await multisigA.payShare({ value: await multisigA.share() })).wait();
    currentStep = 6;
    render(res, {
        othersSharePaid: true
    })
});


app.post('/check-paid-mapping', async (req, res) => {
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    const paidBool = await multisig.paid(walletParticipantThree.address);
    currentStep = 7;
    render(res, {
        verifiedTwo: paidBool
    })
});

app.post('/pay-bill', async (req, res) => {
    const fill = new ethers.Contract(contractAddress, contractAbi, walletParticipantThree);
    await (await fill.payShare({ value: await fill.share() })).wait();

    const costWei = ethers.parseEther("500");
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    const tx = await multisig.payBill(costWei);
    await tx.wait();
    currentStep = 8;
    render(res, {
        billPaid: true
    })
})

app.post('/check-contract-balance', async (req, res) => {
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    const balance = await multisig.getBalance();
    const formattedBalance = ethers.formatEther(balance.toString());
    currentStep = 9;
    render(res, {
        verifiedThree: formattedBalance
    })
})

app.post('/withdraw-share', async (req, res) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    const txFinalize = await contract.finalizeContract();
    await txFinalize.wait();

    for (let pk of PRIVATE_KEYS_PARTICIPANTS) {
        const wallet   = new ethers.Wallet(pk, provider);
        const multisig = contract.connect(wallet);
      
        const tx = await multisig.withdrawFunds();
        await tx.wait();
    }
    currentStep = 10;
    render(res, {
        fundsWithdrawn: true
    })
})

app.post('/check-balance-after', async (req, res) => {
    const multisig = new ethers.Contract(contractAddress, contractAbi, walletCreator);
    const balance = await multisig.getBalance();
    const formattedBalance = ethers.formatEther(balance.toString());
    currentStep = 11;
    render(res, {
        verifiedFour: formattedBalance
    })
})