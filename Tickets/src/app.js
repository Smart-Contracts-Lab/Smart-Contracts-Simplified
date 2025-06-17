const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const app = express();
const path = require("path");
const hre = require("hardhat");
const { ethers, ContractFactory } = require("ethers");
const { createCanvas, loadImage } = require("canvas");
const pinataSDK = require("@pinata/sdk");
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const { deploy } = require('./deploy');

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
app.use("/fonts", express.static(path.join(__dirname, "src/fonts")));

// const provider = new ethers.JsonRpcProvider(
//     "https://ethereum-holesky.publicnode.com",
//     {
//         name: "holesky",
//         chainId: 17000
//     }
// );

const provider = new ethers.JsonRpcProvider("https://eth-holesky.g.alchemy.com/v2/IRAQIiMAtOBoAqvZmwv56");

const walletPersonal = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

let contractAddress = "";
let currentStep = 1;

const contractAbi = require("../artifacts/contracts/EventTicketNFT.sol/EventTicketNFT.json").abi;

function prettyDate(milliseconds) {
    return new Date(milliseconds).toLocaleString("en-GB", {
        day:    "2-digit",
        month:  "2-digit",
        year:   "2-digit",
        hour:   "2-digit",
        minute: "2-digit",
        hour12: false
    });
  }

function render(res, vars = {}) {
    res.render("index", {
        personal: walletPersonal.address,
        deployed: !!contractAddress,
        contractAddress:  contractAddress?? null,
        eventInfo: vars.eventInfo ?? null,
        ticketMinted: vars.ticketMinted ?? false,
        tokenIds: vars.tokenIds ?? null,
        metadataUris: vars.metadataUris ?? null,
        checkRemaining: vars.checkRemaining ?? null,
        organizerMinted: vars.organizerMinted ?? false,
        checkedIn: vars.checkedIn ?? false,
        withdrawn: vars.withdrawn ?? false,
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
    const org = req.body.org;
    const eventName = req.body.eventName;
    const eventDate = req.body.eventDate;
    const price = req.body.ticketPrice;
    const maxSupply = req.body.maxSupply;

    if (price < 0.01 || price > 0.1 || maxSupply < 200) {
        currentStep = 1;
        const alert = "Please follow the instructions to fill up the fields."
        render(res, { alert: alert });
    } else {
        const deployment = await deploy(eventName, eventDate, price, maxSupply, walletPersonal);
        contractAddress = deployment.contractAddress;
        currentStep = 2;
        render(res);
    }
});

app.post("/event-info", async (req, res) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, walletPersonal);
    const [ rawName, rawDateSec, rawTicketPrice, rawMaxSupply ] = await contract.getInfo();
    const ms = rawDateSec * 1000n; 

    const cleanInfo = {
        eventName: rawName,
        eventDate: prettyDate(Number(ms)),
        ticketPrice: ethers.formatEther(rawTicketPrice),
        maxSupply: rawMaxSupply.toString()
    };

    currentStep = 3;
    render(res, {
        eventInfo: cleanInfo
    })
});

async function uploadImageToIPFS(eventName, eventDate, ticketPrice, participantName) {
    const width = 800;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
  
    ctx.fillStyle = '#EF3B0C';
    ctx.fillRect(0, 0, width, height);
  
    ctx.fillStyle = '#FFA238';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    ctx.lineTo(width * 0.6, height * 0.1);
    ctx.lineTo(width, height * 0.3);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(width * 0.6, height * 0.9);
    ctx.lineTo(0, height * 0.8);
    ctx.closePath();
    ctx.fill();
  
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    const squareSize = 100;
    for (let i = 0; i < 4; i++) {
        const offset = i * 20;
        ctx.strokeRect(50 + offset, 50 + offset, squareSize, squareSize);
    }
  
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    const centerX = width * 0.6;
    const centerY = height * 0.6;
    for (let i = 0; i < 9; i++) {
        const radius = 200 - i * 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.stroke();
    }
  
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const baseX = width * 0.9;
        const baseY = height * 0.8 + i * 18;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX - 15, baseY + 15);
        ctx.lineTo(baseX + 15, baseY + 15);
        ctx.closePath();
        ctx.stroke();
    }
  
    ctx.fillStyle = 'black';
    ctx.fillRect(0, height * 0.8, width, height * 0.2);

    const ethIcon = await loadImage(path.join(__dirname, 'assets', 'eth.png'));
    const iconSize = 32;
    const iconX = 50;
    const iconY = height * 0.86 + iconSize;
    ctx.drawImage(ethIcon, iconX, iconY, iconSize, iconSize);
  
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(eventName, width / 2, height * 0.5);
  
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(eventDate, 50, height * 0.88);

    const priceX = iconX + iconSize + 10;
    const priceY = height * 0.93;
    ctx.fillText(ticketPrice, priceX, priceY);
  
    ctx.textAlign = 'right';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(participantName, width - 50, height * 0.9);
  
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  
    const fileName = `${participantName.replace(/\s+/g, '_')}.png`;
    const imagePath = path.join(imagesDir, fileName);
    fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
  
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('pinataMetadata', JSON.stringify({ name: fileName }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));
  
    const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            },
        }
    );
  
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
}

async function uploadMetadataToIPFS(imageURL, eventName, participantName) {
    const metadata = {
        name: "Smart Contracts Simplified - Ep.5",
        description: `Thank you for checking out this demo ${participantName}`,
        image: imageURL,
    };

    const result = await pinata.pinJSONToIPFS(metadata);
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}

app.post("/buy-tickets", async (req, res) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, walletPersonal);
    const [ rawName, rawDateSec, rawTicketPrice, rawMaxSupply ] = await contract.getInfo();
    const ms = Number(rawDateSec) * 1000;

    const quantity = parseInt(req.body.quantity, 10);
    const eventName   = rawName;
    const eventDate   = prettyDate(ms);
    const ticketPrice = ethers.formatEther(rawTicketPrice);
    const participants = Array.from({ length: quantity }, (_, i) => req.body[`participant${i+1}`]);
    const metadataUris = [];


    try {
        for (let i = 0; i < participants.length; i++) {
            const imgUrl = await uploadImageToIPFS(eventName, eventDate, ticketPrice, participants[i]);
            const uri    = await uploadMetadataToIPFS(imgUrl, eventName, participants[i]);
            metadataUris.push(uri);
        }
        
        const totalSpend = quantity * ticketPrice;
        const totalValue = ethers.parseEther(totalSpend.toString());
        const tx = await contract.buyTicket(quantity, metadataUris, { value: totalValue });
        const receipt = await tx.wait();

        const tokenIds = receipt.logs
            .map(l => {
                try {
                    return contract.interface.parseLog(l);
                } catch {
                    return null;
                }
            })
            .filter(parsed => parsed && parsed.name === "Transfer")
            .map(parsed => parsed.args.tokenId.toString());

        currentStep = 4;
        render(res, {
            ticketMinted: true,
            tokenIds: tokenIds,
            metadataUris: metadataUris,
            contractAddress: contractAddress
            
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/check-remaining', async (req, res) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, walletPersonal);
    const remaining = await contract.ticketsRemaining();

    currentStep = 5;
    render(res, {
        checkRemaining: remaining
    })
});

app.post('/organizer-tickets', async (req, res) => {
    const guestName = req.body.guestName;
    const guestAddress = req.body.guestAddress;
    const contract = new ethers.Contract(contractAddress, contractAbi, walletPersonal);
    const [ rawName, rawDateSec, rawTicketPrice, rawMaxSupply ] = await contract.getInfo();
    const ms = Number(rawDateSec) * 1000;

    const quantity = parseInt(1, 10);
    const eventName   = rawName;
    const eventDate   = prettyDate(ms);
    const ticketPrice = "GUEST ACCESS";
    const metadataUris = [];


    try {
        for (let i = 0; i < 1; i++) {
            const imgUrl = await uploadImageToIPFS(eventName, eventDate, ticketPrice, guestName);
            const uri    = await uploadMetadataToIPFS(imgUrl, eventName, guestName);
            metadataUris.push(uri);
        }
        
        const tx = await contract.organizerMint(guestAddress, quantity, metadataUris);
        const receipt = await tx.wait();

        const tokenIds = receipt.logs
            .map(l => {
                try {
                    return contract.interface.parseLog(l);
                } catch {
                    return null;
                }
            })
            .filter(parsed => parsed && parsed.name === "Transfer")
            .map(parsed => parsed.args.tokenId.toString());

        const remaining = await contract.ticketsRemaining();

        currentStep = 6;
        render(res, {
            checkRemaining: remaining,
            organizerMinted: true,
            tokenIds: tokenIds,
            metadataUris: metadataUris,
            contractAddress: contractAddress
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/check-in', async (req, res) => {
    const tokenId = req.body.tokenId;
    const contract = new ethers.Contract(contractAddress, contractAbi, walletPersonal);
    await contract.checkIn(tokenId);

    currentStep = 7;
    render(res, {
        checkedIn: true
    })
});

app.post('/withdraw', async (req, res) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, walletPersonal);
    await contract.withdraw();

    currentStep = 8;
    render(res, {
        withdrawn: true
    })
});