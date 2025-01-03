import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Auth.module.css";
import orangeTriangle from "../../assets/Vector (1).png"; // Replace with your triangle image path

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Save token to local storage
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login successful!");
      setLoading(false);

      // Redirect to the dashboard
      navigate("/dashboard");
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
        <h1 className={styles.title}>Login Screen</h1>
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
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            className={styles.googleButton}
            onClick={() => alert("Google login is not implemented yet.")}
          >
            <span>Sign in with Google</span>
          </button>
          <p className={styles.text}>
            Don't have an account?{" "}
            <a href="/signup" className={styles.link}>
              Register now
            </a>
          </p>
        </form>
      </div>
      <div className={styles.decorativeCircle}></div>
    </div>
  );
};

export default SignIn;
