pragma circom 2.0.0;

include "MerkleTreeInAlreadyHashed.circom";

template MerkleTreeInAlreadyHashedTestN3() { // compute the root of a MerkleTree of n Levels

    signal input inHash[2**3];
    signal output rootOut;
    
    component tree = CheckRoot(3);

    for(var i = 0; i < 2**3; i++){
        tree.inHash[i] <== inHash[i];
    }
    
    rootOut <== tree.root;
 
}

component main = MerkleTreeInAlreadyHashedTestN3();