pragma circom 2.0.0;

include "MerkleTree.circom";

template MerkleRoot3() {
    var n=3;
    signal input leaves[2**n];
    signal output root;
    
    component tree = CheckRoot(n);

    for(var i=0;i<2**n;i++){
        tree.leaves[i] <== leaves[i];
    }
    
    root <== tree.root;
 
}

component main = MerkleRoot3();