



pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

template CheckRoot(n) { // compute the root of a MerkleTree of n Levels 
    //  Example with n = 4;
    //
    //      H(H(H(l_1),H(l_2)),H(H(l_4),H(l_5))) ---> Merkle root
    //           /                      \
    //          /                        \
    //  H(H(l_1),H(l_2))          H(H(l_4),H(l_5))
    //     /    \                     /      \
    //    /      \                   /        \
    //  H(l_1)  H(l_2)             H(l_4)    H(l_5)
    //    |       |                  |         |
    //   l_1     l_2                l_3       l_4
    //
    signal input leaves[2**n];
    signal output root;

    // components definition
    component posHash1In[2**n];
    component posHash2In[(2**n)-1];

    // components initialitzation
    for (var i = 0; i<(2**n); i++){
        posHash1In[i] = Poseidon(1);
        posHash1In[i].inputs[0] <== leaves[i]; // set leaves to one input hash inputs
    }

    for (var i = n-1; i >= 0 ; i--){
        var z = 2**(n)-1;
        for(var j = 2**(i+1)-2 ; j >= (2**i)-1 ; j--){
            posHash2In[j] = Poseidon(2);
            if(i == n-1){
                posHash2In[j].inputs[1] <== posHash1In[z].out;
                posHash2In[j].inputs[0] <== posHash1In[z-1].out;
                z=z-2;
            } else{
                posHash2In[j].inputs[1] <== posHash2In[j*2+2].out;
                posHash2In[j].inputs[0] <== posHash2In[j*2+1].out;
            }
            
        }
    }

    root <== posHash2In[0].out;
}

template MerkleTreeInclusionProof(n) {
    signal input leaf;
    signal input path_elements[n];
    signal input path_index[n]; // path index are 0's and 1's indicating whether the current element is on the left or right
    signal output root; 

    component hash[n+1];
    component muxL[n];
    component muxR[n];

    hash[0] = Poseidon(1);
    hash[0].inputs[0] <== leaf;

    for(var i = 1; i<= n; i++){
        hash[i] = Poseidon(2);
        muxL[i-1] = Mux1();
        muxR[i-1] = Mux1();
        
        muxL[i-1].s <== path_index[i-1];
        muxR[i-1].s <== path_index[i-1];

        muxL[i-1].c[0] <== hash[i-1].out;
        muxL[i-1].c[1] <== path_elements[i-1];

        muxR[i-1].c[0] <== path_elements[i-1];
        muxR[i-1].c[1] <== hash[i-1].out;

        hash[i].inputs[0] <== muxL[i-1].out;
        hash[i].inputs[1] <== muxR[i-1].out;
    }
    
    root <== hash[n].out;
}
