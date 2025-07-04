import { useEffect, useState } from "react";
import { getIncentiveHistory } from "../api";
import { useAuth } from "../context/AuthContext";

function IncentiveHistory() {
  const { user, token } = useAuth();
  const [incentives, setIncentives] = useState([]);

  useEffect(() => {
    const fetchIncentives = async () => {
      try {
        const data = await getIncentiveHistory(user._id, token);
        setIncentives(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIncentives();
  }, [user, token]);

  return (
    <div className="dark-theme">
      <h2>💸 Incentive Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Doctor</th>
            <th>Patient</th>
            <th>Doctor Tx</th>
            <th>Patient Tx</th>
            <th>Sent At</th>
          </tr>
        </thead>
        <tbody>
          {incentives.map((tx, i) => (
            <tr key={i}>
              <td>{tx.date} @ {tx.time}</td>
              <td>{tx.doctor}</td>
              <td>{tx.patient}</td>
              <td><a href={`https://solscan.io/tx/${tx.doctorTx}?cluster=devnet`} target="_blank" rel="noreferrer">🔗</a></td>
              <td><a href={`https://solscan.io/tx/${tx.patientTx}?cluster=devnet`} target="_blank" rel="noreferrer">🔗</a></td>
              <td>{new Date(tx.sentAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IncentiveHistory;
