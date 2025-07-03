// transferSol.js
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction } = require("@solana/web3.js");
const secret = JSON.parse(process.env.SOLANA_PRIVATE_KEY); // Load from env
const sender = Keypair.fromSecretKey(Uint8Array.from(secret));

const connection = new Connection("https://api.mainnet-beta.solana.com"); // or devnet for testing

async function sendIncentive(recipientAddress, amountSol) {
  const recipient = new PublicKey(recipientAddress);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports: amountSol * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
  return signature;
}

module.exports = { sendIncentive };
