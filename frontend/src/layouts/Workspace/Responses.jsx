import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js
import styles from "./responses.module.css";

const Responses = () => {
  // Default response data
  const [responseData, setResponseData] = useState([
    {
      submittedAt: "Jul 17, 03:23 PM",
      button1: "Hi!",
      email1: "abc@g.com",
      text1: "alpha",
      button2: "Studio App to Manage Clients, Tracking App for Clients",
      rating1: 5,
    },
    {
      submittedAt: "Jul 17, 02:48 PM",
      button1: "Hi!",
      email1: "abc@g.com",
      text1: "fsdfasd",
      button2: "",
      rating1: 3,
    },
    {
      submittedAt: "Jul 14, 04:25 PM",
      button1: "Hi!",
      email1: "abc@g.com",
      text1: "",
      button2: "",
      rating1: 4,
    },
  ]);

  // Default metrics
  const [views, setViews] = useState(6);
  const [starts, setStarts] = useState(100);
  const [completionRate, setCompletionRate] = useState(33); // in percentage

  useEffect(() => {
    // Dynamically calculate completion rate
    if (responseData.length > 0 && starts > 0) {
      const rate = Math.round((responseData.length / starts) * 100);
      setCompletionRate(rate);
    }
  }, [responseData, starts]);

  return (
    <div className={styles.responsesContainer}>
      {/* Top Metrics */}
      <div className={styles.metricsContainer}>
        <div className={styles.metricCard}>
          <h2>{views}</h2>
          <p>Views</p>
        </div>
        <div className={styles.metricCard}>
          <h2>{starts}</h2>
          <p>Starts</p>
        </div>
      </div>

      {/* Response Table */}
      {responseData.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.responseTable}>
            <thead>
              <tr>
                <th>Submitted at</th>
                <th>Button 1</th>
                <th>Email 1</th>
                <th>Text 1</th>
                <th>Button 2</th>
                <th>Rating 1</th>
              </tr>
            </thead>
            <tbody>
              {responseData.map((response, index) => (
                <tr key={index}>
                  <td>{response.submittedAt}</td>
                  <td>{response.button1}</td>
                  <td>{response.email1}</td>
                  <td>{response.text1}</td>
                  <td>{response.button2}</td>
                  <td>{response.rating1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.noResponses}>No responses yet collected</p>
      )}

      {/* Completion Rate Chart */}
      <div className={styles.chartContainer}>
        <Pie
          data={{
            labels: ["Completed", "Remaining"],
            datasets: [
              {
                data: [completionRate, 100 - completionRate],
                backgroundColor: ["#4caf50", "#c1c1c1"],
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                display: false,
              },
            },
            maintainAspectRatio: false,
          }}
        />
        <div className={styles.chartLabel}>
          <h2>Completed</h2>
          <p>{completionRate}%</p>
        </div>
      </div>
    </div>
  );
};

export default Responses;
