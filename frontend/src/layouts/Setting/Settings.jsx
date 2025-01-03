import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Settings.module.css";

const Settings = () => {
  const navigate = useNavigate();

  // State to store user info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // State for password update
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 1) On mount, fetch user’s current data (if desired)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // If no token, redirect to login or handle accordingly
          console.log("No token found.");
          return;
        }

        // Example route: GET /api/users/profile
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Response might look like: { id, name, email } or { user: {...} }
        const userData = response.data.user;
        setName(userData.name || "");
        setEmail(userData.email || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data. Please check the console.");
      }
    };

    fetchUserData();
  }, []);

  // Toggle visibility of old password
  const toggleOldPassword = () => setShowOldPassword(!showOldPassword);

  // Toggle visibility of new password
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);

  // 2) Handle update button click
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first.");
        return;
      }

      // Collect fields to send in request
      const payload = {
        name,
        email,
        oldPassword,
        newPassword,
      };

      // Example route: PUT /api/users/profile
      const response = await axios.put("http://localhost:5000/api/users/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If successful, the server should respond with an updated user object or a success message
      console.log("Updated user:", response.data);
      alert("Settings updated successfully!");

      // Optionally clear out password fields (for security reasons)
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating settings:", error);

      // If old password is incorrect, or some validation fails, server might send 400 or 401
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to update settings. Please check the console or try again later.");
      }
    }
  };

  // 3) Handle log-out
  const handleLogout = () => {
    // Remove token from local storage
    localStorage.removeItem("token");
    alert("You have been logged out!");
    // Optionally redirect to login page
    navigate("/signin");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <span className={styles.icon}>👤</span>
      </div>

      <div className={styles.inputGroup}>
        <input
          type="email"
          placeholder="Update Email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <span className={styles.icon}>📧</span>
      </div>

      <div className={styles.inputGroup}>
        <input
          type={showOldPassword ? "text" : "password"}
          placeholder="Old Password"
          className={styles.input}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <span className={styles.icon}>🔒</span>
        <button className={styles.toggleButton} onClick={toggleOldPassword}>
          👁️
        </button>
      </div>

      <div className={styles.inputGroup}>
        <input
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          className={styles.input}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <span className={styles.icon}>🔒</span>
        <button className={styles.toggleButton} onClick={toggleNewPassword}>
          👁️
        </button>
      </div>

      <button className={styles.updateButton} onClick={handleUpdate}>
        Update
      </button>

      <button className={styles.logoutButton} onClick={handleLogout}>
        <span className={styles.logoutIcon}>↩️</span> Log out
      </button>
    </div>
  );
};

export default Settings;
