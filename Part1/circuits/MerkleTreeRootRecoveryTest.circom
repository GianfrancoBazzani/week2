pragma circom 2.0.0;

include "MerkleTree.circom";

template MerkleTreeRootRecoveryTest() {
    var n=3;
    signal input leaf;
    signal input path_elements[n];
    signal input path_index[n];
    signal output root;
    
    component tree = MerkleTreeInclusionProof(n);
    tree.leaf <== leaf;

    for (var i = 0 ; i<n ; i++){
        tree.path_elements[i] <== path_elements[i];
        tree.path_index[i] <== path_index[i];
    }
    
    root <== tree.root;
 
}

component main = MerkleTreeRootRecoveryTest();
