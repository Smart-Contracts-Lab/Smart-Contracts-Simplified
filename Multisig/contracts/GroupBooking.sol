// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GroupBooking {
    address payable public merchant;
    uint256 public totalFunds;
    uint256 public totalCost;
    uint256 public share;
    address[] public participants;
    mapping(address => bool) public paid;
    uint256 public paidCount;
    bool public paymentFunded;
    uint256 public withdrawShare;
    bool public distributionReady;
    mapping(address => bool) public hasWithdrawn;

    event SharePaid(address indexed payer);
    event BookingConfirmed(uint256 timestamp);
    event PaymentFunded(uint256 funds);

    constructor(
        address payable _merchant,
        address[] memory _participants,
        uint256 _totalFunds
    ) {
        require(_participants.length > 0, "No participants");
        require(_totalFunds % _participants.length == 0, "Uneven split");

        merchant = _merchant;
        participants = _participants;
        totalFunds = _totalFunds;
        share = _totalFunds / _participants.length;
    }

    function payShare() external payable {
        require(msg.value == share, "Must send exact share");
        require(isParticipant(msg.sender), "Not in group");
        require(!paid[msg.sender], "Already paid");

        paid[msg.sender] = true;
        paidCount += 1;
        emit SharePaid(msg.sender);

        if (paidCount == participants.length) {
            emit PaymentFunded(totalFunds);
            paymentFunded = true;
        }
    }

    function payBill(uint256 cost) external {
        require(isParticipant(msg.sender), "Not in group");
        require(paymentFunded, "Payment is not fully funded");
        totalCost = cost;
        emit BookingConfirmed(block.timestamp);
        merchant.transfer(totalCost);
    }

    function isParticipant(address who) public view returns (bool) {
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == who) return true;
        }
        return false;
    }

    function finalizeContract() external {
        require(!distributionReady, "Already finalized");
        require(isParticipant(msg.sender), "Not in group");
        uint256 total = address(this).balance;
        require(total > 0, "No funds to distribute");

        withdrawShare = total / participants.length;
        distributionReady   = true;
    }

    function withdrawFunds() external payable {
        require(distributionReady, "Distribution not ready");
        require(isParticipant(msg.sender), "Not in group");
        require(!hasWithdrawn[msg.sender], "Share already withdrawn");

        address payable sender = payable(msg.sender);
        sender.transfer(withdrawShare);
        hasWithdrawn[msg.sender] = true;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
