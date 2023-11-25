import { SmartContract, state, State, method, Reducer, PublicKey } from "o1js";
import { Field, Struct, Circuit, Poseidon } from "o1js";
import { MerkleMapWitness, MerkleMap, MerkleWitness } from "o1js";
import { MerkleMapUpdate } from "./merkle-updates.js";

export {
  VotesBatch, 
  ElectorsInPlanNullifierProxy, 
  VotingBatchesContract,
  VotingBatchesWitness,
  MERKLE_HEIGHT
}

/** States of the Voting process */
const 
  ACTIVE = 1,
  ENDED = 2,
  CANCELED = 3;

/**
 * This is an actual batch of votes sent by a given elector, on a given
 * voting process (the planUid represents this voting process).
 */
class VotesBatch extends Struct({
  uid: Field, // an unique Uid for this batch
  communityUid: Field, // the community where the voting process is happening
  planUid: Field, // the Master Plan Uid of the credential being voted
  electorPubkey: PublicKey, // the elector Uid who submitted this batch
  commited: Field, // the Root of the batch MerkleTree
  size: Field, // Total number of votes received in this batch
  submitedUTC: Field 
}){}

/**
 * This action will be dispatched by the receiveVotesBatch @method
 * when a new batch of votes is received. We use "actions" here because
 * we want this to be settled in MINA archive nodes.
 */
class VotesBatchReceivedAction extends VotesBatch {}

/**
 * This event will be dispatched by the receiveVotesBatch @method
 * when a new batch of votes is received. It is assumed it will
 * be consumed by some off chain process.
 */
class VotesBatchReceivedEvent extends VotesBatch {}


/** Voting states for an Elector on this voting Plan */
const 
  UNASSIGNED = Field(0), // not assigned to this elector
  ASSIGNED = Field(1),   // assigned to elector but has not voted yet
  VOTED = Field(2);      // assigned to elector and has already voted


class ElectorsInPlanNullifierProxy extends Struct({
  root: Field,
  witness: MerkleMapWitness
}) {
  static key(
    electorId: PublicKey,
    planUid: Field
  ): Field {
    // Circuit.log(electorId, planUid)
    const keyd = Poseidon.hash(
      electorId.toFields()
      .concat(planUid.toFields())
    );
    Circuit.log("Key (",electorId, planUid, ") =>", keyd)
    return keyd;
  } 
}

/**
 * Merkle helpers
 */
const MERKLE_HEIGHT = 8;

class VotingBatchesWitness extends MerkleWitness(MERKLE_HEIGHT) {}

/**
 * This is the voting contract binded to a given credential voting process, which
 * is represented by its master plan.
 * 
 * It manages all votes batches received from electors, emit actions on each 
 * batch, and finally commit all received batches. 
 * 
 * This contract mainly asserts that the electors voted and dispatched their 
 * batches. We can not know if some electors did not dispatch them, this may 
 * be validated in other parts (such as the UI or the API)
 */
class VotingBatchesContract extends SmartContract {
  // events to update VotingBatchesMerkleTree
  events = {
    'votes_batch_received': VotesBatchReceivedEvent 
  };

  // the "reducer" field describes a type of action that we can dispatch, and reduce later
  reducer = Reducer({ actionType: VotesBatchReceivedAction });

  // associated MasterPlan. This is the voting process Uid 
  // and is binded to a given Credentials voting process.
  @state(Field) planUid = State<Field>(); 

  // associated Community where voting took place
  @state(Field) communityUid = State<Field>(); 

  // current Voting Batches MerkleTree commitment
  @state(Field) commitment = State<Field>(); 

  // final state of the voting process // 2: FINISHED, 1: ACTIVE
  @state(Field) votingState = State<Field>(); 

  // helper field to store the actual point in the actions history
  @state(Field) actionsState = State<Field>(); 

  init() {
    super.init();
    this.planUid.set(Field(0));
    this.communityUid.set(Field(0));
    this.commitment.set(this.zeroRoot());
    this.votingState.set(Field(ACTIVE)); // it starts as an active voting
    this.actionsState.set(Reducer.initialActionState); // TODO: is this the right way to initialize this ???
  }

  zeroRoot(): Field {
    const mt = new MerkleMap();
    mt.set(Field(0), Field(0)); // we set a first NULL key, with a NULL value
    return mt.getRoot(); 
  }

  /**
   * Setup initial values for some state vars. Should be done when 
   * the account is really available, or it will fail.
   */
  @method setup(
    planUid: Field,
    communityUid: Field,
  ) {
    const _planUid = this.planUid.getAndAssertEquals();
    const _communityUid = this.communityUid.getAndAssertEquals();
    this.planUid.set(planUid);
    this.communityUid.set(communityUid);
  }

  /**
   * Checks if the given elector has been assigned to this voting process
   */
  @method assertIsValidElector(
    electorPuk: PublicKey,
    planUid: Field,
    nullifier: ElectorsInPlanNullifierProxy
  ) {
    // compute a root and key from the given Witness using the only valid 
    // value ASSIGNED, other values indicate that the elector was 
    // never assigned to this claim or that he has already voted on it
    const [witnessRoot, witnessKey] = nullifier.witness.computeRootAndKey(
      ASSIGNED /* WAS ASSIGNED */
    );
    Circuit.log("assertIsValidElector witnessRoot", witnessRoot);
    Circuit.log("assertIsValidElector witnessKey", witnessKey);

    // check the witness obtained root matchs the Nullifier root
    nullifier.root.assertEquals(witnessRoot, "Invalid elector root") ;

    // check the witness obtained key matchs the elector+claim key 
    const key: Field = ElectorsInPlanNullifierProxy.key(electorPuk, planUid);
    Circuit.log("assertIsValidElector recalculated Key", key);

    witnessKey.assertEquals(key, "Invalid elector key");
  }
  

  /**
   * Receives a VotesBatch, asserts it, and emits an Action and en Event
   */
  @method receiveVotesBatch(
    votesBatch: VotesBatch,
    nullifier: ElectorsInPlanNullifierProxy
  ) {
    const planUid = this.planUid.getAndAssertEquals();
    const communityUid = this.communityUid.getAndAssertEquals();
    const votingState = this.votingState.getAndAssertEquals();

    // assert the batch corresponds to this community and plan
    communityUid.assertEquals(votesBatch.communityUid);
    planUid.assertEquals(votesBatch.planUid);

    // the elector Pub key is the one sending the Tx
    let electorPuk = this.sender;
    electorPuk.assertEquals(this.sender);
    
    // check this elector is part of the Electors set 
    Circuit.log("elector key=", ElectorsInPlanNullifierProxy.key(electorPuk, planUid));
    this.assertIsValidElector(electorPuk, planUid, nullifier);

    // check that we have not already finished 
    // and that we can receive additional batches
    votingState.assertEquals(ACTIVE);

    // dispatch action
    const action: VotesBatchReceivedAction = votesBatch;
    this.reducer.dispatch(action);  
    Circuit.log("dispatched action", action);

    // send event to change this elector state in Nullifier
    this.emitEvent("votes_batch_received", votesBatch);
  }


  @method commitAllBatches(
    index: Field,
    value: Field,
    root: Field,
    witness: VotingBatchesWitness
  ) {
    const planUid = this.planUid.getAndAssertEquals();
    const communityUid = this.communityUid.getAndAssertEquals();
    const votingState = this.votingState.getAndAssertEquals();
    const commitment = this.commitment.getAndAssertEquals();

    // check that this claim is still open (in the voting process)
    votingState.assertEquals(ACTIVE, "Voting has already finished !");

    // compute the new root for the last value using the given Witness 
    let recalculatedRoot = witness.calculateRoot(value);
    recalculatedRoot.assertEquals(root);  

    // close voting batches and set final states
    this.votingState.set(Field(ENDED));
    this.commitment.set(root);
    Circuit.log("new commitment=", this.commitment);
  }
}
