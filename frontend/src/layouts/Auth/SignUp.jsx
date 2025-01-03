import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Auth.module.css";
import orangeTriangle from "../../assets/Vector (1).png"; // Replace with your triangle image path

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        email,
        password,
        confirmPassword,
      });

      // Success: Show success message or redirect
      alert("Signup successful! Redirecting to login...");
      setLoading(false);

      // Redirect to login
      navigate("/signin");
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Decorative Images */}
      <img src={orangeTriangle} alt="Triangle" className={styles.triangleLeft} />
      <div className={styles.card}>
        <h1 className={styles.title}>Signup Screen</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <button
            className={styles.googleButton}
            onClick={() => alert("Google Signup not implemented yet")}
          >
            <span>Sign up with Google</span>
          </button>
          <p className={styles.text}>
            Already have an account?{" "}
            <a href="/signin" className={styles.link}>
              Login here
            </a>
          </p>
        </form>
      </div>
      <div className={styles.decorativeCircle}></div>
    </div>
  );
};

export default SignUp;
