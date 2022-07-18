pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template MerkleTreeDepth4OnlyTest() {
    signal input inHash[2**4];
    signal output root;

    component Hash2In[(2**4)-1];
    
    for(var i=0; i<((2**4)-1);i++){
        Hash2In[i] = Poseidon(2);
    }

    //Depth level 3
    Hash2In[0].inputs[0] <== inHash[0];
    Hash2In[0].inputs[1] <== inHash[1];
    Hash2In[1].inputs[0] <== inHash[2];
    Hash2In[1].inputs[1] <== inHash[3];
    Hash2In[2].inputs[0] <== inHash[4];
    Hash2In[2].inputs[1] <== inHash[5];
    Hash2In[3].inputs[0] <== inHash[6];
    Hash2In[3].inputs[1] <== inHash[7];
    Hash2In[4].inputs[0] <== inHash[8];
    Hash2In[4].inputs[1] <== inHash[9];
    Hash2In[5].inputs[0] <== inHash[10];
    Hash2In[5].inputs[1] <== inHash[11];
    Hash2In[6].inputs[0] <== inHash[12];
    Hash2In[6].inputs[1] <== inHash[13];
    Hash2In[7].inputs[0] <== inHash[14];
    Hash2In[7].inputs[1] <== inHash[15];

    //Depth level 2
    Hash2In[8].inputs[0] <== Hash2In[0].out;
    Hash2In[8].inputs[1] <== Hash2In[1].out;
    Hash2In[9].inputs[0] <== Hash2In[2].out;
    Hash2In[9].inputs[1] <== Hash2In[3].out;
    Hash2In[10].inputs[0] <== Hash2In[4].out;
    Hash2In[10].inputs[1] <== Hash2In[5].out;
    Hash2In[11].inputs[0] <== Hash2In[6].out;
    Hash2In[11].inputs[1] <== Hash2In[7].out;

    //Depth level 1
    Hash2In[12].inputs[0] <== Hash2In[8].out;
    Hash2In[12].inputs[1] <== Hash2In[9].out;
    Hash2In[13].inputs[0] <== Hash2In[10].out;
    Hash2In[13].inputs[1] <== Hash2In[11].out;

    //Depth level 0
    Hash2In[14].inputs[0] <== Hash2In[12].out;
    Hash2In[14].inputs[1] <== Hash2In[13].out;

    root <== Hash2In[14].out;
 
}

component main = MerkleTreeDepth4OnlyTest();