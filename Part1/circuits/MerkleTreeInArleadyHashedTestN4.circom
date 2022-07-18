pragma circom 2.0.0;

include "MerkleTreeInAlreadyHashed.circom";

template MerkleTreeInAlreadyHashedTestN4() { // compute the root of a MerkleTree of n Levels

    signal input inHash[2**4];
    signal output rootOut;
    
    component tree = CheckRoot(4);

    for(var i = 0; i < 2**4; i++){
        tree.inHash[i] <== inHash[i];
    }
    
    rootOut <== tree.root;
 
}

component main = MerkleTreeInAlreadyHashedTestN4();