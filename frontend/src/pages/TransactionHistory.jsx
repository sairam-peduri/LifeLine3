import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const TransactionHistory = () => {
  const { user, firebaseUser } = useAuth(); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!firebaseUser) return;

        const token = await firebaseUser.getIdToken();
        const res = await axios.get("https://lifeline3-1.onrender.com/api/transactions/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransactions(res.data.transactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [firebaseUser]);

  if (loading) return <p>Loading transaction history...</p>;

  return (
    <div>
        <Navbar user={user} />
    <div className="container mt-5 pt-4">
      <h2 className="mb-4">Transaction History</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount (SOL)</th>
              <th>Wallet Tx</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.senderName}</td>
                <td>{tx.receiverName}</td>
                <td>{tx.amount}</td>
                <td>
                  <a
                    href={`https://solscan.io/tx/${tx.txId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </td>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};

export default TransactionHistory;
