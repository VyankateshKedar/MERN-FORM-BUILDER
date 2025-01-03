// src/layouts/Workspace/FormBuilder.jsx
import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2"; // Import Pie chart component
import "chart.js/auto"; // Required for Chart.js
import axios from "axios"; // For API calls
import styles from "./workspace.module.css"; // raw/vanilla CSS module

const FormBuilder = ({ folderName, folderId, onClose }) => {
  const [activeTab, setActiveTab] = useState("flow");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [formElements, setFormElements] = useState([
    { type: "start", label: "Start" },
  ]); // Initial form elements
  const [responses, setResponses] = useState([]); // Response data fetched from backend
  const [views, setViews] = useState(0); // Views count fetched from backend
  const [starts, setStarts] = useState(0); // Starts count fetched from backend
  const [completionRate, setCompletionRate] = useState(0); // Completion rate
  const [formName, setFormName] = useState(""); // Form name

  const [formId, setFormId] = useState(null); // Track saved form's ID

  // Toggle dark/light mode
  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.body.style.backgroundColor = "#f5f5f5";
      document.body.style.color = "#000";
    } else {
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.color = "#fff";
    }
  };

  // Dynamically calculate completion rate
  useEffect(() => {
    if (responses.length > 0 && starts > 0) {
      const rate = Math.round((responses.length / starts) * 100);
      setCompletionRate(rate);
    }
  }, [responses, starts]);

  const handleAddElement = (type) => {
    const newElement = {
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${formElements.length}`,
    };
    setFormElements([...formElements, newElement]);
  };

  // Save form to backend
  const handleSaveForm = async () => {
    if (!formName.trim()) {
      alert("Please enter a form name before saving.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in.");
        return;
      }

      // If form is not yet saved, create a new form
      if (!formId) {
        const response = await axios.post(
          "http://localhost:5000/api/forms",
          {
            name: formName,
            folderId: folderId,
            elements: formElements,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFormId(response.data._id);
        alert("Form saved successfully!");
      } else {
        // If form is already saved, update it
        await axios.put(
          `http://localhost:5000/api/forms/${formId}`,
          {
            name: formName,
            elements: formElements,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Form updated successfully!");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("An error occurred while saving the form.");
      }
    }
  };

  // Share form via email
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
        `http://localhost:5000/api/forms/${formId}/share`,
        { email: shareEmail, permission: sharePermission },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Form shared successfully!");
      setShareEmail("");
      setSharePermission("view");
    } catch (error) {
      console.error("Error sharing form:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to share form. Check console for details.");
      }
    }
  };

  // Share form via link
  const handleCopyShareLink = async () => {
    if (!formId) {
      alert("Please save the form before sharing.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/forms/${formId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const shareLink = `http://localhost:3000/share/${response.data.shareLink}`;
      navigator.clipboard
        .writeText(shareLink)
        .then(() => {
          alert("Share link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
          alert("Failed to copy link. Please try again.");
        });
    } catch (error) {
      console.error("Error fetching share link:", error);
      alert("An error occurred while fetching the share link.");
    }
  };

  // Fetch responses and metrics for the form
  useEffect(() => {
    const fetchResponsesAndMetrics = async () => {
      if (!formId) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, please log in.");
          return;
        }

        const [responsesResponse, formResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/forms/${formId}/responses`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`http://localhost:5000/api/forms/${formId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setResponses(responsesResponse.data);
        setViews(formResponse.data.views || 0);
        setStarts(formResponse.data.starts || 0);
      } catch (error) {
        console.error("Error fetching responses and metrics:", error);
        alert("Failed to fetch responses and metrics. Check console for details.");
      }
    };

    fetchResponsesAndMetrics();
  }, [formId]);

  // Share Popup State
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("view");
  const [shareLink, setShareLink] = useState(""); // For displaying copied link

  return (
    <div
      className={`${styles.formBuilderContainer} ${
        isDarkMode ? styles.dark : styles.light
      }`}
    >
      {/* Top Bar */}
      <div className={styles.topBar}>
        <input
          className={styles.formNameInput}
          placeholder="Enter Form Name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />

        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "flow" && styles.activeTab
            }`}
            onClick={() => setActiveTab("flow")}
          >
            Flow
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "response" && styles.activeTab
            }`}
            onClick={() => setActiveTab("response")}
          >
            Response
          </button>
        </div>

        <div className={styles.topBarActions}>
          <div className={styles.toggleWrapper}>
            <span className={styles.modeLabel}>Light</span>
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
            <span className={styles.modeLabel}>Dark</span>
          </div>

          <button className={styles.shareButton} onClick={() => setIsSharePopupOpen(true)}>
            Share
          </button>
          <button className={styles.saveButton} onClick={handleSaveForm}>
            Save
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeTab === "flow" && (
          <>
            {/* Left Sidebar */}
            <div className={styles.leftSidebar}>
              <h4 className={styles.sidebarHeading}>Bubbles</h4>
              <div className={styles.sidebarGroup}>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("image")}
                >
                  <span className={styles.itemIcon}>🖼</span>
                  <span>Image</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("video")}
                >
                  <span className={styles.itemIcon}>🎥</span>
                  <span>Video</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("gif")}
                >
                  <span className={styles.itemIcon}>GIF</span>
                  <span>GIF</span>
                </button>
              </div>

              <h4 className={styles.sidebarHeading}>Inputs</h4>
              <div className={styles.sidebarGroup}>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("text")}
                >
                  <span className={styles.itemIcon}>🔡</span>
                  <span>Text</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("number")}
                >
                  <span className={styles.itemIcon}>#</span>
                  <span>Number</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("email")}
                >
                  <span className={styles.itemIcon}>✉️</span>
                  <span>Email</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("phone")}
                >
                  <span className={styles.itemIcon}>📞</span>
                  <span>Phone</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("date")}
                >
                  <span className={styles.itemIcon}>📅</span>
                  <span>Date</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("rating")}
                >
                  <span className={styles.itemIcon}>⭐</span>
                  <span>Rating</span>
                </button>
                <button
                  className={styles.sidebarItem}
                  onClick={() => handleAddElement("button")}
                >
                  <span className={styles.itemIcon}>🔘</span>
                  <span>Button</span>
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className={styles.editorArea}>
              {formElements.map((element, index) => (
                <div
                  key={index}
                  className={styles.flowItem}
                  style={{
                    margin: element.type === "start" ? "1rem auto" : "1rem 0",
                    textAlign: element.type === "start" ? "center" : "left",
                  }}
                >
                  <h4 className={styles.flowItemLabel}>{element.label}</h4>

                  {["image", "video", "gif"].includes(element.type) && (
                    <div className={styles.inputWrapper}>
                      <div className={styles.flagIcon}>🏴</div>
                      <input
                        type="text"
                        placeholder="Click to add link"
                        className={styles.inputBox}
                      />
                    </div>
                  )}

                  {["text", "number", "email", "phone", "date", "rating", "button"].includes(
                    element.type
                  ) && (
                    <p className={styles.hint}>
                      Hint: User will input a {element.type} on this form
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "response" && (
          <div className={styles.responsesContainer}>
            <h2>Responses</h2>
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
            {responses.length > 0 ? (
              <>
                <table className={styles.responseTable}>
                  <thead>
                    <tr>
                      <th>Submitted At</th>
                      <th>Button 1</th>
                      <th>Email 1</th>
                      <th>Text 1</th>
                      <th>Button 2</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response, index) => (
                      <tr key={index}>
                        <td>{new Date(response.createdAt).toLocaleString()}</td>
                        <td>{response.data.button1}</td>
                        <td>{response.data.email1}</td>
                        <td>{response.data.text1}</td>
                        <td>{response.data.button2}</td>
                        <td>{response.data.rating1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              </>
            ) : (
              <p>No responses yet collected.</p>
            )}
          </div>
        )}
      </div>

      {/* Share Popup */}
      {isSharePopupOpen && (
        <div className={styles.popupOverlay}>
          <div className={styles.sharePopup}>
            <div className={styles.popupHeader}>
              <h3>Share Form</h3>
              <button className={styles.closeButton} onClick={() => setIsSharePopupOpen(false)}>
                ✖
              </button>
            </div>

            {/* Share via Email */}
            <div className={styles.shareSection}>
              <h4>Share via Email</h4>
              <input
                type="email"
                placeholder="Enter email"
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
              <button className={styles.shareInviteButton} onClick={handleSendInvite}>
                Send Invite
              </button>
            </div>

            {/* Share via Link */}
            <div className={styles.shareSection}>
              <h4>Share via Link</h4>
              <button className={styles.copyLinkButton} onClick={handleCopyShareLink}>
                Copy Link
              </button>
              {shareLink && (
                <p className={styles.shareLink}>{shareLink}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
