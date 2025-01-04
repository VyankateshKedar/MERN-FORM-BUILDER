// backend/routes/submissionRoutes.js
const express = require('express');
const Response = require('../models/Response.js');
const Form = require('../models/Form.js');
const router = express.Router();

// Submit a form response (public route)
router.post('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const { name, email, answers } = req.body;

    // Basic validations
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Check if the form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Increment the submission count (starts)
    form.starts = (form.starts || 0) + 1;
    await form.save();

    // Create a new response
    const newResponse = new Response({
      form: formId,
      data: { name: name.trim(), email: email.trim().toLowerCase(), answers },
    });

    await newResponse.save();
    res.status(201).json({ message: 'Form response submitted successfully.' });
  } catch (error) {
    console.error('Form Response Submission Error:', error);
    res.status(500).json({ message: 'Server error submitting response.', error: error.message });
  }
});

// Get responses for a form (protected route, optional authMiddleware)
router.get('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    // Check if the form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Fetch all responses for the form
    const responses = await Response.find({ form: formId }).sort({ createdAt: -1 });

    res.status(200).json(responses);
  } catch (error) {
    console.error('Get Responses Error:', error);
    res.status(500).json({ message: 'Server error fetching responses.', error: error.message });
  }
});

module.exports = router;
