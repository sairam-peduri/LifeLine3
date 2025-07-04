// utils/transferSol.js
const {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} = require("@solana/web3.js");

const secret = JSON.parse(process.env.SOLANA_PRIVATE_KEY); // MUST be a JSON array
const payer = Keypair.fromSecretKey(Uint8Array.from(secret));
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function sendIncentive(receiverAddress, solAmount) {
  console.log("💸 Sending incentive to:", receiverAddress);
  const receiver = new PublicKey(receiverAddress);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: receiver,
      lamports: solAmount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log("✅ Transaction signature:", signature);
  return signature;
}

module.exports = { sendIncentive };
