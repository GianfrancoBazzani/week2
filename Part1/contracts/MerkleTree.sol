//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";//// <-----TBR

import { PoseidonT3 } from "./Poseidon.sol"; //an existing library to perform Poseidon hash on solidity
import { PoseidonT31In } from "./Poseidon1In.sol"; //an existing library to perform Poseidon hash on solidity
import "./MerkleTreeRootRecoveryInAlreadyHashedTest.sol"; //inherits with the MerkleTreeInclusionProof verifier contract

contract MerkleTree is Verifier {
    uint256[14] public hashes; // the Merkle tree in flattened array form
    uint256 public index = 0; // the current index of the first unfilled leaf
    uint256 public root; // the current Merkle root
    Verifier verifier;

    constructor() {
        // [assignment] initialize a Merkle tree of 8 with blank leaves
        uint256 HashOfZero = PoseidonT31In.poseidon([uint256(0)]);
        //setting initial leaves hashes
        for(uint8 i = 0; i < 8; i++){hashes[i] = HashOfZero;}
        //level 2
        hashes[8] = PoseidonT3.poseidon([hashes[0],hashes[1]]);
        hashes[9] = PoseidonT3.poseidon([hashes[2],hashes[3]]);
        hashes[10] = PoseidonT3.poseidon([hashes[4],hashes[5]]);
        hashes[11] = PoseidonT3.poseidon([hashes[6],hashes[7]]);
        //level 1
        hashes[12] = PoseidonT3.poseidon([hashes[8],hashes[9]]);
        hashes[13] = PoseidonT3.poseidon([hashes[10],hashes[11]]);
        //level 0
        root = PoseidonT3.poseidon([hashes[12],hashes[13]]);

        //initialitze verifier
        verifier = new Verifier();
    }

    function insertLeaf(uint256 hashedLeaf) public returns (uint256) {
        // [assignment] insert a hashed leaf into the Merkle tree
        require(index < 8 ,"Merkle Tree Full");
        //layer2
        uint256 l2Index = index/2 + 8;
        if(index%2 == 0){
            hashes[l2Index] = PoseidonT3.poseidon([hashedLeaf,hashes[index + 1]]);
        }
        else{
            hashes[l2Index] = PoseidonT3.poseidon([hashes[index-1],hashedLeaf]);
        }
        //layer1
        uint256 l1Index = l2Index/2 + 8;
        if(l2Index%2 == 0){
            hashes[l1Index] = PoseidonT3.poseidon([hashes[l2Index],hashes[l2Index+1]]);
        }
        else{
            hashes[l1Index] = PoseidonT3.poseidon([hashes[l2Index-1],hashes[l2Index]]);
        }
        //layer0
        root = PoseidonT3.poseidon([hashes[12],hashes[13]]);
   
        hashes[index] = hashedLeaf;
        index = index + 1;
        return root;
    }

    function verify(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[1] memory input
        ) public view returns (bool) {

        // [assignment] verify an inclusion proof and check that the proof root matches current root
        return verifier.verifyProof(a,b,c,input);
    }
}
