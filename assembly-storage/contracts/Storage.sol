// SPDX-License-Identified: UNLICENSED
pragma solidity >0.5.0;

contract Storage {
    bytes4  bytes4data = 0xaabbccdd;
    uint72  uintdata = 0x123456;
    bool    booldata = true;
    address addrdata = 0xdC962cEAb6C926E3a9B133c46c7258c0E371b82b;

     // return the values of bytes4data, uintdata, booldata, addrdata
 function getData() public view returns (bytes4 output1,uint64 output2,bool output3,address output4) {
    assembly {
        // load storage to stack
        let data1 := sload(bytes4data_slot)
        let data2 := sload(uintdata_slot)
        let data3 := sload(booldata_slot)
        let data4 := sload(addrdata_slot)
        data1 := shl(224,and(data1,0xffffffff))
        data2 := shr(shl(3,uintdata_offset), data2)

        output1 := data1
        output2 := data2
        output3 := data3
        output4 := data4
    }
 }
}