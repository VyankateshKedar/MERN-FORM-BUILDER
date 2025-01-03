import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Dashboard.module.css"; // Reusing the same CSS as Dashboard

const FolderPage = () => {
  const { folderId } = useParams(); // Extract folderId from the URL
  const [folder, setFolder] = useState(null);

  // Fetch folder details
  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, please log in.");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/folders/${folderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFolder(response.data);
      } catch (error) {
        console.error("Error fetching folder:", error);
        alert("Failed to fetch folder details.");
      }
    };

    fetchFolder();
  }, [folderId]);

  if (!folder) {
    return <p>Loading folder...</p>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Folder: {folder.name}</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h3>{folder.name}</h3>
          <p>This is a card inside the folder page.</p>
        </div>
      </main>
    </div>
  );
};

export default FolderPage;
