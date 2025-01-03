// backend/routes/submissionRoutes.js
const express = require('express');
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const router = express.Router();

// Submit a form (public route)
router.post('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const { name, email, answers } = req.body;

    // Basic validations
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required.' });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    const newSubmission = new Submission({
      form: formId,
      name,
      email,
      answers,
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Form submitted successfully.' });
  } catch (error) {
    console.error('Form Submission Error:', error);
    res.status(500).json({ message: 'Server error submitting form.', error: error.message });
  }
});

// Get submissions for a form (if you want to protect it, you can add authMiddleware)
router.get('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const submissions = await Submission.find({ form: formId });
    res.json(submissions);
  } catch (error) {
    console.error('Get Submissions Error:', error);
    res.status(500).json({ message: 'Server error fetching submissions.', error: error.message });
  }
});

module.exports = router;
