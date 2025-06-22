import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";

const PaymentPage = () => {
  const { doctorId } = useParams();
  const { user,firebaseUser } = useAuth();
  const wallet = useWallet();
  const [doctor, setDoctor] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await axios.get(
          `${BACKEND_URL}/api/doctors/doctor/${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctor(res.data.doctor);
        console.log("Doctor fetched:", res.data.doctor);
      } catch (err) {
        console.error("Failed to load doctor:", err);
        setStatus("❌ Failed to load doctor details");
      }
    };

    if (firebaseUser && doctorId) loadDoctor();
  }, [firebaseUser, doctorId]);

  const sendPayment = async () => {
    try {
      if (!wallet.publicKey) return alert("Connect wallet first!");
      if (!doctor?.walletAddress) return alert("Doctor wallet not set.");
  
      setStatus("Preparing transaction...");
      const connection = new Connection("https://api.devnet.solana.com");
  
      const toPubkey = new PublicKey(doctor.walletAddress);
      const fromPubkey = wallet.publicKey;
      const lamports = doctor.consultationFee * 1e9;
  
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );
  
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;
  
      const signed = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signed.serialize());
  
      setStatus(`✅ Payment sent! TX ID: ${txid}`);
  
      // ✅ Send transaction record to backend
      const token = await firebaseUser.getIdToken();
      await axios.post(
        `${BACKEND_URL}/api/transactions/send`,
        {
          from: fromPubkey.toBase58(),
          to: doctor.walletAddress,
          amount: doctor.consultationFee,
          txId:txid,
          receiverId: doctor.uid, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Payment failed:", err);
      setStatus("❌ Payment failed. Try again.");
    }
  };
  
  if (!doctor) return <p>Loading doctor info...</p>;

  return (
    <div>
        <Navbar user={user} />
    <div style={{ padding: 20 }}>
      <h2>Pay Dr. {doctor.name}</h2>
      <p>
        <strong>Consultation Fee:</strong> {doctor.consultationFee} SOL
      </p>
      <p>
        <strong>Doctor's Wallet:</strong> {doctor.walletAddress}
      </p>
      <button onClick={sendPayment}>💳 Pay Now</button>
      {status && <p style={{ marginTop: 10 }}>{status}</p>}
    </div>
    </div>
  );
};

export default PaymentPage;
