// src/pages/IncentiveHistory.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const IncentiveHistory = () => {
  const { user } = useAuth();
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncentives = async () => {
      try {
        const res = await axios.get(`/api/incentives/${user._id}`);
        console.log("Incentive response:", res.data);

        // Ensure we get an array
        const data = Array.isArray(res.data) ? res.data : [];
        setIncentives(data);
      } catch (err) {
        console.error("Error fetching incentives:", err);
        setError("Failed to load incentive history.");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchIncentives();
    }
  }, [user]);

  return (
    <div className="container">
      <h2>💰 Incentive Transaction History</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : incentives.length === 0 ? (
        <p>No incentive transactions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor Tx</th>
              <th>Patient Tx</th>
            </tr>
          </thead>
          <tbody>
            {incentives.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.doctorId?.name || "N/A"}</td>
                <td>{tx.patientId?.name || "N/A"}</td>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.time || "—"}</td>
                <td>
                  {tx.incentiveTx?.doctorTx ? (
                    <a
                      href={`https://explorer.solana.com/tx/${tx.incentiveTx.doctorTx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {tx.incentiveTx?.patientTx ? (
                    <a
                      href={`https://explorer.solana.com/tx/${tx.incentiveTx.patientTx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default IncentiveHistory;
