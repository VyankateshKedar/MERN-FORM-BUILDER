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

  // Share Popup State
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("view");
  const [shareLink, setShareLink] = useState(""); // For displaying copied link

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
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
        formElements.length
      }`,
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

      if (!formId) {
        // Create a new form
        const response = await axios.post(
          "http://localhost:5000/api/forms",
          {
            name: formName,
            folderId: folderId, // Use folderId passed as a prop
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
        // Update an existing form
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
      alert("An error occurred while saving the form.");
    }
  };

  // Share form via email
  const handleSendInvite = async () => {
    if (!shareEmail) {
      alert("Please enter an email address.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in.");
        return;
      }

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
      alert("Failed to share form. Check console for details.");
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
      navigator.clipboard.writeText(shareLink).then(() => {
        alert("Share link copied to clipboard!");
      });
    } catch (error) {
      console.error("Error fetching share link:", error);
      alert("An error occurred while fetching the share link.");
    }
  };

  // Fetch responses and metrics
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
        alert("Failed to fetch responses and metrics.");
      }
    };

    fetchResponsesAndMetrics();
  }, [formId]);

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
        {/* Tabs and Actions */}
      </div>
      {/* Main Content */}
    </div>
  );
};

export default FormBuilder;
