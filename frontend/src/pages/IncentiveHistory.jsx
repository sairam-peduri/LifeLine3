// src/pages/IncentiveHistory.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const IncentiveHistory = () => {
  const { user } = useAuth();
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncentives = async () => {
      try {
        const res = await axios.get(`/api/incentives/${user._id}`);
        setIncentives(res.data);
      } catch (err) {
        console.error("Error fetching incentives:", err);
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
      ) : incentives.length === 0 ? (
        <p>No incentive transactions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Appointment Date</th>
              <th>Time</th>
              <th>Doctor Tx</th>
              <th>Patient Tx</th>
            </tr>
          </thead>
          <tbody>
            {incentives.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.doctorId?.name}</td>
                <td>{tx.patientId?.name}</td>
                <td>{tx.date}</td>
                <td>{tx.time}</td>
                <td>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.incentiveTx?.doctorTx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </td>
                <td>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.incentiveTx?.patientTx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
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
