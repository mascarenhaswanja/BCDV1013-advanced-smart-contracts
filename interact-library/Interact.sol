// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

/**
 * @author Wanja Mascarenhas
 * @title SimpleStorage
*/

// Contract declaration
contract Interact {
    // state variables
    uint256 public number;
    
    // constructor - executed ONLY once while contract is deployed
    constructor (uint _number) public {
        number = _number;
    }

	// one event that gets emitted 
    function fnAddValue(uint _value) public {
        number += _value;
        // emit events
        emit EventUpdate(number,msg.sender);
    }
    
    // one public read-only or pure function
    function fnRead() public view returns (address){
       return msg.sender;
    }

    // one private function
    function fnPrivate() private {
       number *= 10;
        // emit events
        emit EventUpdate(number,msg.sender);
    }

    // events
    event EventUpdate(uint256 indexed result, address indexed caller);
}