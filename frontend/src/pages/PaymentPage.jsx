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
import "./PaymentPage.css";

const PaymentPage = () => {
  const { doctorId } = useParams();
  const { user, firebaseUser } = useAuth();
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
      if (!wallet.publicKey) return alert("Please connect your wallet first.");
      if (!doctor?.walletAddress) return alert("Doctor's wallet not available.");

      setStatus("⏳ Preparing transaction...");
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

      setStatus(`✅ Payment successful! TX ID: ${txid}`);

      const token = await firebaseUser.getIdToken();
      await axios.post(
        `${BACKEND_URL}/api/transactions/send`,
        {
          from: fromPubkey.toBase58(),
          to: doctor.walletAddress,
          amount: doctor.consultationFee,
          txId: txid,
          receiverId: doctor.uid,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Payment failed:", err);
      setStatus("❌ Payment failed. Please try again.");
    }
  };

  if (!doctor) {
    return (
      <div className="payment-wrapper">
        <Navbar user={user} />
        <div className="payment-card">Loading doctor info...</div>
      </div>
    );
  }

  return (
    <div className="payment-wrapper">
      <Navbar user={user} />
      <div className="payment-card">
        <h2>💳 Pay Dr. {doctor.name}</h2>
        <p><strong>Consultation Fee:</strong> {doctor.consultationFee} SOL</p>
        <p><strong>Doctor’s Wallet:</strong> {doctor.walletAddress}</p>

        <button className="pay-now-btn" onClick={sendPayment}>
          🔐 Send Payment
        </button>

        {status && <div className="payment-status">{status}</div>}
      </div>
    </div>
  );
};

export default PaymentPage;
