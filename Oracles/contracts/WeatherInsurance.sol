// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WeatherInsurance {
    address public farmer;
    address public insurer;

    uint256 public premium;
    uint256 public payoutAmount;
    uint256 public totalPremiumsPaid;

    uint256 public rainfallThreshold;
    uint256 public rainfallReceived;

    uint256 public policyDuration; // Duration in seconds (e.g., 30 days = 30 * 86400)
    uint256 public policyStart;

    bool public claimProcessed;

    constructor(
        uint256 _threshold,
        uint256 _premium,
        uint256 _duration
    ) payable {
        require(msg.value > 0, "Insurer must fund payout amount");

        insurer = msg.sender;
        rainfallThreshold = _threshold;
        premium = _premium;
        payoutAmount = msg.value;
        policyDuration = _duration;
    }

    modifier onlyFarmer() {
        require(msg.sender == farmer, "Not the farmer");
        _;
    }

    modifier onlyInsurer() {
        require(msg.sender == insurer, "Not the insurer");
        _;
    }

    modifier policyIsActive() {
        require(block.timestamp < policyStart + policyDuration, "Policy has expired");
        _;
    }

    modifier policyExpiredOrClaimed() {
        require(block.timestamp >= policyStart + policyDuration || claimProcessed, "Policy still active");
        _;
    }

    // Farmer purchases the policy
    function purchasePolicy() external payable {
        require(farmer == address(0), "Policy already purchased");
        require(msg.value == premium, "Incorrect premium amount");

        farmer = msg.sender;
        policyStart = block.timestamp;
        totalPremiumsPaid += msg.value;
    }

    // Farmer renews the policy and pays the premium
    function renewPolicy() external payable onlyFarmer {
        require(msg.value == premium, "Incorrect premium amount");

        policyStart = block.timestamp;
        totalPremiumsPaid += msg.value;
        claimProcessed = false;
    }

    // Get data from the Oracle (fictionary in this case for demo purposes)
    function setRainfall(uint256 _rainfall) external onlyInsurer policyIsActive {
        require(!claimProcessed, "Claim already processed");

        rainfallReceived = _rainfall;
        if(_rainfall > 10) {
            claimProcessed = false;
        } else {    
            claimProcessed = true;
        }

        if (_rainfall < rainfallThreshold) {
            payable(farmer).transfer(payoutAmount);
        }
    }

    // Insurer can withdraw remaining funds (cumulated premiums) when the policy is expired
    function withdraw() external onlyInsurer policyExpiredOrClaimed {
        payable(insurer).transfer(address(this).balance);
    }

    // For farmer: Check contract balance to verify payout funds exist
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // For insurer: See total premiums collected
    function getTotalPremiumsPaid() external view returns (uint256) {
        return totalPremiumsPaid;
    }

    // For both: Check when the policy will expire
    function getPolicyExpiry() external view returns (uint256) {
        return policyStart + policyDuration;
    }

    // For both: Check if the policy is active
    function isPolicyActive() external view returns (bool) {
        return (block.timestamp < policyStart + policyDuration) && !claimProcessed;
    }
}
