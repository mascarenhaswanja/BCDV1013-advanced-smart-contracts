// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;


/**
 * @dev Renamed version 1 to MySmartContractV1 to quickly workaround Truffle's singleton feature when deploying contracts.
 * This allows us to have both contract versions deployed at the same time.
 */
contract MySmartContractV1 {
    bool private stopped = false;  // slot 0
    uint32 public counter;         // slot 0
    address private owner;         // slot 1

    /**
    @dev Enforces the caller to be the contract's owner.
    */
    modifier isOwner {
        require(msg.sender == owner, "Sender is not owner.");
        _;
    }

    modifier isNotStopped {
        require(!stopped, "Contract is stopped");
        _;
    }
    constructor() public {
        counter = 0;
        // Sets the contract's owner as the address that deployed the contract.
        owner = msg.sender;
    }

    /**
    @notice Increments the contract's counter if contract is active.
    @dev It should revert if the contract is stopped. Create a modifier named "isNotStopped"
    */
    function incrementCounter() public isNotStopped {
        counter += 2; // This is an intentional bug.
    }

    function toggleContractStopped() public isOwner {
        stopped = !stopped; // true 
    }
}
