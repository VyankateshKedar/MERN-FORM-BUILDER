// src/layouts/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();

  // State to store folder data from backend
  const [folders, setFolders] = useState([]);

  // State for popups and UI
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(""); // Track folder being shared
  const [newFolderName, setNewFolderName] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Share-related state
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("view");
  const [shareLink, setShareLink] = useState(""); // For generating share link dynamically

  // ---------------------------------
  // 1) Fetch Folders on Component Mount
  // ---------------------------------
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // Redirect to login if no token
          console.log("No token found, please log in.");
          navigate("/login"); // Redirecting to login page
          return;
        }

        const response = await axios.get("http://localhost:5000/api/folders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFolders(response.data);
      } catch (error) {
        console.error("Error fetching folders:", error);
        alert("Failed to fetch folders. Check console for details.");
      }
    };

    fetchFolders();
  }, [navigate]);

  // -----------------------------------
  // 2) Toggle between Dark and Light
  // -----------------------------------
  const toggleMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    if (isDarkMode) {
      document.body.style.backgroundColor = "#f5f5f5";
      document.body.style.color = "#000";
    } else {
      document.body.style.backgroundColor = "#000000";
      document.body.style.color = "#fff";
    }
  };

  // ----------------------------
  // 3) Folder Creation Popup
  // ----------------------------
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => {
    setIsPopupOpen(false);
    setNewFolderName("");
  };

  // Create a new folder (POST request)
  const addFolder = async () => {
    if (newFolderName.trim() !== "") {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found, please log in.");
          return;
        }
        const response = await axios.post(
          "http://localhost:5000/api/folders",
          { name: newFolderName },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // The backend returns the newly created folder object
        const createdFolder = response.data;

        // Update local state
        setFolders((prevFolders) => [...prevFolders, createdFolder]);
        closePopup();
      } catch (error) {
        console.error("Error creating folder:", error);
        // If it's a duplicate name error or similar (status 400)
        if (error.response && error.response.status === 400) {
          alert(error.response.data.message);
        } else {
          alert("An error occurred while creating the folder. Please try again.");
        }
      }
    }
  };

  // -------------------------------
  // 4) Folder Deletion Logic
  // -------------------------------
  const openDeletePopup = (folderId) => {
    setFolderToDelete(folderId);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setIsDeletePopupOpen(false);
    setFolderToDelete(null);
  };

  // Delete folder (DELETE request)
  const deleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found, please log in.");
        return;
      }

      await axios.delete(`http://localhost:5000/api/folders/${folderToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted folder from state
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder._id !== folderToDelete)
      );

      closeDeletePopup();
    } catch (error) {
      console.error("Error deleting folder:", error);
      // You can display a toast or alert
      alert("An error occurred while deleting the folder. Please try again.");
    }
  };

  // ---------------------
  // 5) Share Popup Logic
  // ---------------------
  const openSharePopup = () => {
    if (folders.length === 0) {
      alert("No folders available to share.");
      return;
    }
    setIsSharePopupOpen(true);
  };
  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
    setCurrentFolderId("");
    setShareEmail("");
    setSharePermission("view");
    setShareLink("");
  };

  // **Send Invite** to user by email + permission
  const handleSendInvite = async () => {
    if (!shareEmail) {
      alert("Please enter an email address.");
      return;
    }

    if (!currentFolderId) {
      alert("Please select a folder to share.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in.");
        return;
      }

      // Send invite to the backend
      await axios.post(
        `http://localhost:5000/api/folders/${currentFolderId}/share`,
        { email: shareEmail, permission: sharePermission },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Invite sent successfully!");
      setShareEmail("");
      setSharePermission("view");
    } catch (error) {
      console.error("Error sending invite:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to send invite. Check console for details.");
      }
    }
  };

  // **Copy Invite Link** to clipboard
  const handleCopyLink = () => {
    if (!currentFolderId) {
      alert("Please select a folder to share.");
      return;
    }

    // For demonstration, we'll create a static share link.
    // In a real application, you'd generate this link dynamically from the backend.
    const generatedShareLink = `http://localhost:3000/share/${currentFolderId}`;

    // Copy the link to clipboard
    navigator.clipboard
      .writeText(generatedShareLink)
      .then(() => {
        alert("Link copied to clipboard!");
        setShareLink(generatedShareLink);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy link. Please try again.");
      });
  };

  // -----------------------------------------
  // 6) Dropdown + Navigation to Workspaces
  // -----------------------------------------
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Navigate to the Workspace route for a given folder
  const openWorkspace = (folderId) => {
    navigate(`/Workspace/${folderId}`);
  };

  // ----------------
  // 7) Render JSX
  // ----------------
  return (
    <div
      className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}
    >
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.workspaceSelector}>
          <button className={styles.workspaceButton} onClick={toggleDropdown}>
            Dewank Rastogi's Workspace ▾
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <div
                className={styles.dropdownItem}
                onClick={() => navigate("/settings")}
              >
                Settings
              </div>
              <div
                className={styles.dropdownItem}
                onClick={async () => {
                  // Handle Logout
                  try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      alert("No token found.");
                      navigate("/login");
                      return;
                    }

                    // Optional: Call backend logout endpoint if implemented
                    // await axios.post(
                    //   "http://localhost:5000/api/users/logout",
                    //   {},
                    //   { headers: { Authorization: `Bearer ${token}` } }
                    // );

                    // Remove token from local storage
                    localStorage.removeItem("token");
                    alert("You have been logged out!");
                    navigate("/login");
                  } catch (error) {
                    console.error("Logout error:", error);
                    alert("Failed to log out. Please try again.");
                  }
                }}
              >
                Log Out
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightNav}>
          {/* Dark/Light Toggle */}
          <div className={styles.toggleWrapper}>
            <span>Light</span>
            <div
              className={`${styles.toggleButton} ${
                isDarkMode ? styles.active : ""
              }`}
              onClick={toggleMode}
            >
              <div
                className={`${styles.toggleCircle} ${
                  isDarkMode ? styles.active : ""
                }`}
              ></div>
            </div>
            <span>Dark</span>
          </div>

          {/* Share Button (in navbar) */}
          <button
            className={styles.shareButton}
            onClick={openSharePopup}
          >
            Share
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Folder Section */}
        <div className={styles.folderSection}>
          <button onClick={openPopup} className={styles.createFolderButton}>
            <span className={styles.folderIcon}>📂</span> Create a folder
          </button>

          {/* Display each folder in a list */}
          {folders.map((folder) => (
            <div
              key={folder._id}
              className={styles.folder}
              onClick={() => openWorkspace(folder._id)}
            >
              <span>{folder.name}</span>
              <div className={styles.folderActions}>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the folder click from triggering
                    openDeletePopup(folder._id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cards for Each Folder */}
        <div className={styles.cardSection}>
          {folders.map((folder) => (
            <div
              key={folder._id}
              className={styles.card}
              onClick={() => openWorkspace(folder._id)}
            >
              <div className={styles.cardHeader}>
                <h3>{folder.name}</h3>
              </div>
              <div className={styles.cardContent}>
                <p>Create a typebot inside {folder.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Create Folder Popup */}
        {isPopupOpen && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h3>Create New Folder</h3>
              <input
                type="text"
                placeholder="Enter folder name"
                className={styles.input}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className={styles.popupActions}>
                <button onClick={addFolder} className={styles.doneButton}>
                  Done
                </button>
                <button onClick={closePopup} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {isDeletePopupOpen && (
          <div className={styles.popupOverlay}>
            <div className={styles.deletePopup}>
              <h3>Are you sure you want to delete this folder?</h3>
              <div className={styles.popupActions}>
                <button onClick={deleteFolder} className={styles.doneButton}>
                  Confirm
                </button>
                <button
                  onClick={closeDeletePopup}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Popup */}
        {isSharePopupOpen && (
          <div className={styles.popupOverlay}>
            <div className={styles.sharePopup}>
              <div className={styles.popupHeader}>
                <h3>Share Folder</h3>
                <button className={styles.closeButton} onClick={closeSharePopup}>
                  ✖
                </button>
              </div>

              {/* Select Folder to Share */}
              <div className={styles.inputGroup}>
                <label htmlFor="folderSelect">Select Folder:</label>
                <select
                  id="folderSelect"
                  className={styles.select}
                  onChange={(e) => setCurrentFolderId(e.target.value)}
                  value={currentFolderId}
                >
                  <option value="" disabled>
                    -- Select a folder --
                  </option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email + Permission Input */}
              {currentFolderId && (
                <>
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      placeholder="Enter email id"
                      className={styles.input}
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <select
                      className={styles.permissionSelect}
                      value={sharePermission}
                      onChange={(e) => setSharePermission(e.target.value)}
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                    </select>
                  </div>

                  <button
                    className={styles.shareInviteButton}
                    onClick={handleSendInvite}
                  >
                    Send Invite
                  </button>

                  <h3>Invite by Link</h3>
                  <button
                    className={styles.copyLinkButton}
                    onClick={handleCopyLink}
                  >
                    Copy link
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
