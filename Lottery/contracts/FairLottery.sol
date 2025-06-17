// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

contract FairLottery is VRFConsumerBaseV2 {
    address public organizer;
    uint256 public maxParticipants;
    uint256 public contributionAmount;
    uint256 public organizerFee;
    address[] public participants;

    enum LotteryState { OPEN, DRAWING, CLOSED }
    LotteryState public state;

    // Chainlink VRF mock coordinator
    VRFCoordinatorV2Mock public COORDINATOR;
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 100_000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    uint256 public requestId;
    address public winner;

    event Entered(address indexed participant);
    event WinnerRequested(uint256 indexed requestId);
    event WinnerPicked(address indexed winner, uint256 prize);

    constructor(
        uint256 _maxParticipants,
        uint256 _contributionAmount,
        uint256 _organizerFee,
        uint64 _subscriptionId,
        VRFCoordinatorV2Mock _vrfCoordinator,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(address(_vrfCoordinator)) {
        require(_organizerFee < _maxParticipants * _contributionAmount, "Fee too high");

        organizer = msg.sender;
        maxParticipants = _maxParticipants;
        contributionAmount = _contributionAmount;
        organizerFee = _organizerFee;
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        COORDINATOR = _vrfCoordinator;
        state = LotteryState.OPEN;
    }

    function enterLottery() external payable {
        require(state == LotteryState.OPEN, "Lottery not open");
        require(msg.value == contributionAmount, "Wrong amount");
        require(participants.length < maxParticipants, "Lottery full");

        participants.push(msg.sender);
        emit Entered(msg.sender);
    }

    function drawWinner() external {
        require(msg.sender == organizer, "Only organizer");
        require(participants.length == maxParticipants, "Not enough participants");
        require(state == LotteryState.OPEN, "Already drawing or closed");

        state = LotteryState.DRAWING;
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        emit WinnerRequested(requestId);
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        uint256 idx = randomWords[0] % participants.length;
        address selected = participants[idx];

        uint256 totalBalance = address(this).balance;
        uint256 prize = totalBalance - organizerFee;

        winner = selected;
        state = LotteryState.CLOSED;

        payable(winner).transfer(prize);
        payable(organizer).transfer(organizerFee);

        emit WinnerPicked(winner, prize);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getLotteryInfo() external view returns (
        uint256 participantsCount,
        uint256 maxSlots,
        uint256 requiredContribution,
        uint256 lotteryFee,
        address[] memory participantList
    ) {
        return (
            participants.length,
            maxParticipants,
            contributionAmount,
            organizerFee,
            participants
        );
    }
}
