import React, { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./FolderView.module.css";

const FolderView = () => {
  const { folderName } = useParams(); // Get folder name from the URL
  const [cards, setCards] = useState([]); // Cards inside the folder
  const [newCardName, setNewCardName] = useState(""); // New card name input

  // Add a new card to the folder
  const addCard = () => {
    if (newCardName.trim() !== "") {
      setCards([...cards, newCardName]);
      setNewCardName(""); // Clear input
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>{folderName}</h2>
      </header>

      <main className={styles.main}>
        {/* Input to add a new card */}
        <div className={styles.addCardSection}>
          <input
            type="text"
            placeholder="Enter card name"
            className={styles.input}
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
          />
          <button onClick={addCard} className={styles.addCardButton}>
            Add Card
          </button>
        </div>

        {/* Cards for the folder */}
        <div className={styles.cards}>
          {cards.map((card, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardIcon}>📄</div>
              <p>{card}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FolderView;
