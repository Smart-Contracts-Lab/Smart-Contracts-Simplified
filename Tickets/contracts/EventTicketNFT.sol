// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicketNFT is ERC721URIStorage, Ownable {
    uint256 public immutable maxSupply;
    uint256 public immutable ticketPrice;
    string  public eventName;
    uint256 public eventDate;
    uint256 private _nextTokenId = 1;
    mapping(uint256 => bool) public checkedIn;

    event TicketPurchased(address indexed buyer, uint256 indexed tokenId);
    event CheckedIn(address indexed attendee, uint256 indexed tokenId);

    constructor(
        string memory _eventName,
        uint256 _eventDate,
        uint256 _ticketPrice,
        uint256 _maxSupply
    )
        ERC721("EventTicket", "ETIX")
        Ownable(msg.sender)
    {
        require(_maxSupply > 0, "maxSupply = 0");

        eventName   = _eventName;
        eventDate   = _eventDate;
        ticketPrice = _ticketPrice;
        maxSupply   = _maxSupply;
    }

    function buyTicket(uint256 quantity, string[] calldata uris) external payable {
        require(quantity > 0, "quantity 0");
        require(_nextTokenId + quantity <= maxSupply, "Sold out");
        require(msg.value == ticketPrice * quantity, "Wrong payment");
        require(uris.length == quantity, "URIs length mismatch");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tid = _nextTokenId;
            _safeMint(msg.sender, tid);
            _setTokenURI(tid, uris[i]);
            emit TicketPurchased(msg.sender, tid);
            _nextTokenId++;
        }
    }

    function checkIn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(!checkedIn[tokenId], "Already checked-in");

        checkedIn[tokenId] = true;
        emit CheckedIn(msg.sender, tokenId);
    }

    function organizerMint(address to, uint256 quantity, string[] calldata uris) external onlyOwner {
        require(quantity > 0, "quantity 0");
        require(_nextTokenId + quantity <= maxSupply, "Exceeds supply");
        require(uris.length == quantity, "URIs length mismatch");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tid = _nextTokenId;
            _safeMint(to, tid);
            _setTokenURI(tid, uris[i]);
            emit TicketPurchased(to, tid);
            _nextTokenId++;
        }
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function ticketsRemaining() external view returns (uint256) {
        return maxSupply - _nextTokenId;
    }

    function isCheckedIn(uint256 tokenId) external view returns (bool) {
        return checkedIn[tokenId];
    }

    function getInfo() external view returns (string memory _eventName, uint256 _eventDate, uint256 _ticketPrice, uint256 _maxSupply) {
        return (eventName, eventDate, ticketPrice, maxSupply);
    }
}
