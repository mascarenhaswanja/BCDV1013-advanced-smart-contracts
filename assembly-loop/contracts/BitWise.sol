pragma solidity ^0.5.0;

 contract BitWise {
    // count the number of bit set in data.  i.e. data = 7, result = 3
    function countBitSet(uint8 data) public pure returns (uint8 result) {
        for( uint i = 0; i < 8; i += 1) {
            if( ((data >> i) & 1) == 1) {
                result += 1;
            }
        }
    }
    // inline assembly logic
    function countBitSetAsm(uint8 data ) public pure returns (uint8 result) {
        assembly {
            for {let i := 0}        // init 
            lt (i,8)                // condition for loop
            { i := add(i,1) }       // increment
            {                               // begin statements
                let bitSet := shr(i, data)      // shift right
                let bitResult := and(bitSet,1)  // AND
                if eq(bitResult, 1) {           // result 1 in data increment result
                    result := add(result,1)
                }
            }                               // end statements
       }
    }
}