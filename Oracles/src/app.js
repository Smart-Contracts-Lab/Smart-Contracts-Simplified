const express = require("express");
const app = express();
const path = require("path");
const { ethers } = require("ethers");
const dotenv = require('dotenv');
dotenv.config();

const { deploy } = require('./deploy');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
});

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname)));
app.use("/images", express.static(path.join(__dirname, "src/images")));

const PRIVATE_KEY_INSURER = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY_FARMER = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const walletInsurer = new ethers.Wallet(PRIVATE_KEY_INSURER, provider);
const walletFarmer = new ethers.Wallet(PRIVATE_KEY_FARMER, provider);

let contractAddress = "";
let currentStep = 1;
const contractAbi = require("../artifacts/contracts/WeatherInsurance.sol/WeatherInsurance.json").abi;

app.get('/', (req, res) => {
    currentStep = 1;
    res.render('index', {
        insurer: walletInsurer.address,
        farmer: walletFarmer.address,
        deployed: false,
        farmerCheck: "none",
        policyPurchased: false,
        insurerCheck: "none",
        processRainCase1: false,
        processRainCase2: false,
        farmerCheckAfter1: "none",
        farmerCheckAfter2: "none",
        caseTwoActive: false,
        withdrawn: false,
        insurerAfter: "none",
        currentStep: currentStep,
        alertMessage: 'none'
    });
});

app.post('/deploy-contract', async (req, res) => {
    try {
        const rainfallThereshold = req.body.rainfallThereshold;
        const payoutAmount = req.body.payoutAmount;
        const premiumAmount = req.body.premiumAmount;
        const policyDuration = req.body.policyDuration;

        if (rainfallThereshold != 10 || payoutAmount >= 1000 || premiumAmount != 0.1 || policyDuration < 30) {
            currentStep = 1;
            res.render('index', {
                insurer: walletInsurer.address,
                farmer: walletFarmer.address,
                deployed: false,
                farmerCheck: "none",
                policyPurchased: false,
                insurerCheck: "none",
                processRainCase1: false,
                processRainCase2: false,
                farmerCheckAfter1: "none",
                farmerCheckAfter2: "none",
                caseTwoActive: false,
                withdrawn: false,
                insurerAfter: "none",
                currentStep: currentStep,
                alertMessage: 'Please follow the instructions above to fill the required fields!'
            });
        } else {
            const deployment = await deploy(rainfallThereshold, payoutAmount, premiumAmount, policyDuration, walletInsurer);
            contractAddress = deployment.contractAddress;
            currentStep = 2;
            res.render('index', {
                insurer: walletInsurer.address,
                farmer: walletFarmer.address,
                deployed: true,
                farmerCheck: "none",
                policyPurchased: false,
                insurerCheck: "none",
                processRainCase1: false,
                processRainCase2: false,
                farmerCheckAfter1: "none",
                farmerCheckAfter2: "none",
                caseTwoActive: false,
                withdrawn: false,
                insurerAfter: "none",
                currentStep: currentStep,
                alertMessage: 'none'
            });
        }

    } catch (error) {
        console.error("Deployment error:", error);
        res.status(500).send("Error deploying contract: " + error.message);
    }
});

app.post('/check-balance', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, walletFarmer);
        const balance = await contract.getContractBalance();
        const balanceInEth = ethers.formatEther(balance);
        
        currentStep = 3;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: balanceInEth,
            policyPurchased: false,
            insurerCheck: "none",
            processRainCase1: false,
            processRainCase2: false,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: "none",
            caseTwoActive: false,
            withdrawn: false,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Check balance error:", error);
        res.status(500).send("Error checking balance: " + error.message);
    }
});

app.post('/purchase-policy', async (req, res) => {
    try {
        const premiumAmount = req.body.premiumAmount;
        const contract = new ethers.Contract(contractAddress, contractAbi, walletFarmer);
        const tx = await contract.purchasePolicy({
            value: ethers.parseUnits(premiumAmount.toString(), "ether")
        });
        await tx.wait();
        
        currentStep = 4;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: "none",
            processRainCase1: false,
            processRainCase2: false,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: "none",
            caseTwoActive: false,
            withdrawn: false,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Policy purchase error:", error);
        res.status(500).send("Error purchasing policy: " + error.message);
    }
});

app.post('/check-premiums', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, walletInsurer);
        const balance = await contract.getTotalPremiumsPaid();
        const balanceInEth = ethers.formatEther(balance);
        
        currentStep = 5;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: balanceInEth,
            processRainCase1: false,
            processRainCase2: false,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: "none",
            caseTwoActive: false,
            withdrawn: false,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Check balance error:", error);
        res.status(500).send("Error checking balance: " + error.message);
    }
});

app.post('/process-rainfall-case1', async (req, res) => {
    try {
        const rainfallLevel = req.body.rainfallLevel;
        const contract = new ethers.Contract(contractAddress, contractAbi, walletInsurer);
        const tx = await contract.setRainfall(rainfallLevel);
        await tx.wait();
        
        currentStep = 6;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: "none",
            processRainCase1: true,
            processRainCase2: false,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: "none",
            caseTwoActive: false,
            withdrawn: false,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Process rainfall error:", error);
        res.status(500).send("Error processing rainfall: " + error.message);
    }
});

app.post('/check-balance-after1', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, walletFarmer);
        const balance = await contract.getContractBalance();
        const balanceInEth = ethers.formatEther(balance);
        
        currentStep = 7;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: "none",
            processRainCase1: false,
            processRainCase2: false,
            farmerCheckAfter1: balanceInEth,
            farmerCheckAfter2: "none",
            caseTwoActive: true,
            withdrawn: false,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Check balance error:", error);
        res.status(500).send("Error checking balance: " + error.message);
    }
});

app.post('/process-rainfall-case2', async (req, res) => {
    try {
        const rainfallLevel = req.body.rainfallLevel;
        const contract = new ethers.Contract(contractAddress, contractAbi, walletInsurer);
        const tx = await contract.setRainfall(rainfallLevel);
        await tx.wait();
        
        currentStep = 8;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: "none",
            processRainCase1: false,
            processRainCase2: true,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: "none",
            caseTwoActive: true,
            withdrawn: false,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Process rainfall error:", error);
        res.status(500).send("Error processing rainfall: " + error.message);
    }
});

app.post('/check-balance-after2', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, walletFarmer);
        const balance = await contract.getContractBalance();
        const balanceInEth = ethers.formatEther(balance);
        
        currentStep = 9;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: "none",
            processRainCase1: true,
            processRainCase2: true,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: balanceInEth,
            caseTwoActive: true,
            withdrawn: false,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Check balance error:", error);
        res.status(500).send("Error checking balance: " + error.message);
    }
});

app.post('/withdraw-funds', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, walletInsurer);
        const tx = await contract.withdraw();
        await tx.wait();
        
        currentStep = 10;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: "none",
            processRainCase1: true,
            processRainCase2: true,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: "none",
            caseTwoActive: true,
            withdrawn: true,
            insurerAfter: "none",
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Check balance error:", error);
        res.status(500).send("Error checking balance: " + error.message);
    }
});

app.post('/check-balance-after3', async (req, res) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, walletInsurer);
        const balance = await contract.getContractBalance();
        const balanceInEth = ethers.formatEther(balance);
        
        currentStep = 11;

        res.render('index', {
            insurer: walletInsurer.address,
            farmer: walletFarmer.address,
            deployed: true,
            farmerCheck: "none",
            policyPurchased: true,
            insurerCheck: "none",
            processRainCase1: true,
            processRainCase2: true,
            farmerCheckAfter1: "none",
            farmerCheckAfter2: balanceInEth,
            caseTwoActive: true,
            withdrawn: true,
            insurerAfter: balanceInEth,
            currentStep: currentStep,
            alertMessage: 'none'
        });
    } catch (error) {
        console.error("Check balance error:", error);
        res.status(500).send("Error checking balance: " + error.message);
    }
});