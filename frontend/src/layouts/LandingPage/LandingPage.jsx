// src/components/LandingPage/LandingPage.jsx
import React from "react";
import styles from "./LandingPage.module.css";
import logoImage from "../../assets/Link.png"; // Replace with your logo image path
import cardImage from "../../assets/img1.png"; // Replace with your card image path
import archImage from "../../assets/Vector (1).png"; // Replace with the arch image path
import orangeTriangle from "../../assets/SVG (1).png"; // Replace with your triangle image path
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <img src={logoImage} alt="FormBot Logo" className={styles.logo} />
        <div className={styles.nav}>
          <button
            onClick={() => navigate("/signin")}
            className={styles.navButton}
          >
            Sign In
          </button>
          <button className={styles.ctaButton}>Create a FormBot</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Decorative Images */}
        <img src={archImage} alt="Decorative Arch" className={styles.archImage} />
        <img
          src={orangeTriangle}
          alt="Decorative Triangle"
          className={styles.triangleImage}
        />

        <div className={styles.heroContent}>
          <h1>Build advanced chatbots visually</h1>
          <p>
            Typobot gives you powerful blocks to create unique user experiences.
            Embed them anywhere on your website or app and start collecting
            results like magic.
          </p>
          <button className={styles.heroButton}>Create a FormBot for Free</button>
          <div className={styles.heroImage}>
            <img src={cardImage} alt="FormBot Example" />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className={styles.footer}>
        {/* Column 1: Logo and Attribution */}
        <div className={styles.footerLogoSection}>
          <img src={logoImage} alt="FormBot Logo" className={styles.footerLogo} />
          <p>
            Made with <span className={styles.heart}>❤️</span> by{" "}
            <a
              href="https://cuvette.tech"
              target="_blank"
              rel="noopener noreferrer"
            >
              @cuvette
            </a>
          </p>
        </div>

        {/* Column 2: Product Links */}
        <div className={styles.footerLinks}>
          <strong>Product</strong>
          <a href="#">Status</a>
          <a href="#">Documentation</a>
          <a href="#">Roadmap</a>
          <a href="#">Pricing</a>
        </div>

        {/* Column 3: Community Links */}
        <div className={styles.footerLinks}>
          <strong>Community</strong>
          <a href="#">Discord</a>
          <a href="#">GitHub repository</a>
          <a href="#">Twitter</a>
          <a href="#">LinkedIn</a>
          <a href="#">OSS Friends</a>
        </div>

        {/* Column 4: Company Links */}
        <div className={styles.footerLinks}>
          <strong>Company</strong>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
