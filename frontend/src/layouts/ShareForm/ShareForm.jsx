// src/layouts/ShareForm/ShareForm.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./ShareForm.module.css"; // CSS module for styling

const ShareForm = () => {
  const { shareLink } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/forms/share/${shareLink}`);
        setForm(response.data);
      } catch (error) {
        console.error("Error fetching form:", error);
        alert("Form not found or an error occurred.");
      }
    };

    fetchForm();
  }, [shareLink]);

  const handleChange = (e, elementType) => {
    setResponses({
      ...responses,
      [elementType]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`http://localhost:5000/api/forms/share/${shareLink}/response`, responses);
      setSubmitted(true);
      alert("Thank you for your response!");
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Failed to submit response. Please try again.");
    }
  };

  if (!form) {
    return <div>Loading form...</div>;
  }

  if (submitted) {
    return <div>Thank you for your response!</div>;
  }

  return (
    <div className={styles.shareFormContainer}>
      <h2>{form.name}</h2>
      <form onSubmit={handleSubmit} className={styles.shareForm}>
        {form.elements.map((element, index) => {
          if (element.type === "start") {
            return <h3 key={index}>{element.label}</h3>;
          }

          switch (element.type) {
            case "text":
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{element.label}</label>
                  <input
                    type="text"
                    required
                    onChange={(e) => handleChange(e, `text${index}`)}
                  />
                </div>
              );
            case "number":
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{element.label}</label>
                  <input
                    type="number"
                    required
                    onChange={(e) => handleChange(e, `number${index}`)}
                  />
                </div>
              );
            case "email":
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{element.label}</label>
                  <input
                    type="email"
                    required
                    onChange={(e) => handleChange(e, `email${index}`)}
                  />
                </div>
              );
            case "phone":
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{element.label}</label>
                  <input
                    type="tel"
                    required
                    onChange={(e) => handleChange(e, `phone${index}`)}
                  />
                </div>
              );
            case "date":
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{element.label}</label>
                  <input
                    type="date"
                    required
                    onChange={(e) => handleChange(e, `date${index}`)}
                  />
                </div>
              );
            case "rating":
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{element.label}</label>
                  <select
                    required
                    onChange={(e) => handleChange(e, `rating${index}`)}
                  >
                    <option value="">Select rating</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              );
            case "button":
              return (
                <div key={index} className={styles.formGroup}>
                  <button type="submit" className={styles.submitButton}>
                    {element.label}
                  </button>
                </div>
              );
            case "image":
            case "video":
            case "gif":
              return (
                <div key={index} className={styles.formGroup}>
                  <label>{element.label}</label>
                  <img
                    src={responses[`image${index}`] || ""}
                    alt={element.label}
                    className={styles.mediaPreview}
                  />
                  <input
                    type="text"
                    placeholder="Enter media URL"
                    onChange={(e) => handleChange(e, `image${index}`)}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
      </form>
    </div>
  );
};

export default FormBuilder;
