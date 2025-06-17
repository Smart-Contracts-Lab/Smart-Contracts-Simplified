const hre = require("hardhat");
const { ethers } = require("ethers");

async function deploy(thereshold, payout, premium, durationInDays, insurer) {
    const WeatherInsuranceArtifact = require("../artifacts/contracts/WeatherInsurance.sol/WeatherInsurance.json");

    const durationInSeconds = durationInDays * 86400;

    const factory = new ethers.ContractFactory(
        WeatherInsuranceArtifact.abi,
        WeatherInsuranceArtifact.bytecode,
        insurer
    );

    const insurance = await factory.deploy(
        thereshold,
        ethers.parseEther(premium.toString()),
        durationInSeconds,
        {
            value: ethers.parseEther(payout.toString())
        }
    );

    await insurance.waitForDeployment();

    const contractAddress = await insurance.getAddress();
    console.log("Insurance Contract deployed to:", contractAddress);

    return { contractAddress };
}


module.exports = { deploy };
