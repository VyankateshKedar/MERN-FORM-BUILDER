// backend/routes/formRoutes.js
const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Folder = require('../models/Folder');
const Response = require('../models/Response');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid'); // For generating unique share links

// Create a new form within a folder
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, folderId, elements } = req.body;

    if (!name || !folderId) {
      return res.status(400).json({ message: 'Form name and folderId are required.' });
    }

    // Check if the folder exists and is owned by the user
    const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or not owned by the user.' });
    }

    const newForm = new Form({
      name,
      folder: folderId,
      user: req.user.id,
      elements: elements || [],
      shareLink: uuidv4(),
    });

    await newForm.save();

    res.status(201).json(newForm);
  } catch (error) {
    console.error('Create Form Error:', error);
    res.status(500).json({ message: 'Server error creating form.', error: error.message });
  }
});

// Update an existing form
router.put('/:formId', authMiddleware, async (req, res) => {
  try {
    const { formId } = req.params;
    const { name, elements } = req.body;

    // Find the form and ensure it belongs to the user
    const form = await Form.findOne({ _id: formId, user: req.user.id });
    if (!form) {
      return res.status(404).json({ message: 'Form not found or not owned by the user.' });
    }

    // Update the form fields
    if (name) form.name = name;
    if (elements) form.elements = elements;

    await form.save();

    res.status(200).json(form);
  } catch (error) {
    console.error('Update Form Error:', error);
    res.status(500).json({ message: 'Server error updating form.', error: error.message });
  }
});

// Share a form with another user via email
router.post('/:formId/share', authMiddleware, async (req, res) => {
  try {
    const { formId } = req.params;
    const { email, permission } = req.body;

    if (!email || !permission) {
      return res.status(400).json({ message: 'Email and permission are required.' });
    }

    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({ message: 'Invalid permission type.' });
    }

    // Find the form and ensure it belongs to the user
    const form = await Form.findOne({ _id: formId, user: req.user.id });
    if (!form) {
      return res.status(404).json({ message: 'Form not found or not owned by the user.' });
    }

    // Find the user to share with
    const sharedUser = await User.findOne({ email });
    if (!sharedUser) {
      return res.status(400).json({ message: 'User with this email does not exist.' });
    }

    // Check if the user is already shared
    const alreadyShared = form.sharedWith.some(
      (shared) => shared.user.toString() === sharedUser._id.toString()
    );
    if (alreadyShared) {
      return res.status(400).json({ message: 'Form already shared with this user.' });
    }

    // Add to sharedWith
    form.sharedWith.push({
      user: sharedUser._id,
      permission,
    });

    await form.save();

    res.status(200).json({ message: 'Form shared successfully.', form });
  } catch (error) {
    console.error('Share Form Error:', error);
    res.status(500).json({ message: 'Server error sharing form.', error: error.message });
  }
});

// Get form by share link and increment views
router.get('/share/:shareLink', async (req, res) => {
  try {
    const { shareLink } = req.params;

    // Find the form by shareLink
    const form = await Form.findOne({ shareLink });

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Increment views
    form.views = (form.views || 0) + 1;
    await form.save();

    res.status(200).json(form);
  } catch (error) {
    console.error('Get Form by Share Link Error:', error);
    res.status(500).json({ message: 'Server error fetching form.', error: error.message });
  }
});

// Submit a response to a form (no authentication needed)
router.post('/share/:shareLink/response', async (req, res) => {
  try {
    const { shareLink } = req.params;
    const responseData = req.body; // Contains the responses

    // Find the form by shareLink
    const form = await Form.findOne({ shareLink });

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Increment starts
    form.starts = (form.starts || 0) + 1;
    await form.save();

    const newResponse = new Response({
      form: form._id,
      data: responseData,
    });

    await newResponse.save();

    res.status(201).json({ message: 'Response submitted successfully.' });
  } catch (error) {
    console.error('Submit Response Error:', error);
    res.status(500).json({ message: 'Server error submitting response.', error: error.message });
  }
});

// Get form details
router.get('/:formId', authMiddleware, async (req, res) => {
  try {
    const { formId } = req.params;

    // Find the form and ensure it belongs to the user or is shared with the user
    const form = await Form.findOne({ _id: formId })
      .populate('sharedWith.user', 'email name')
      .exec();

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Check ownership or shared access
    if (form.user.toString() !== req.user.id) {
      const isShared = form.sharedWith.some(
        (shared) => shared.user._id.toString() === req.user.id
      );
      if (!isShared) {
        return res.status(403).json({ message: 'Access denied to this form.' });
      }
    }

    res.status(200).json(form);
  } catch (error) {
    console.error('Get Form Error:', error);
    res.status(500).json({ message: 'Server error fetching form.', error: error.message });
  }
});

// Get all responses for a form
router.get('/:formId/responses', authMiddleware, async (req, res) => {
  try {
    const { formId } = req.params;

    // Find the form and ensure it belongs to the user or is shared with the user
    const form = await Form.findOne({ _id: formId });

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Check ownership or shared access
    if (form.user.toString() !== req.user.id) {
      const isShared = form.sharedWith.some(
        (shared) => shared.user.toString() === req.user.id
      );
      if (!isShared) {
        return res.status(403).json({ message: 'Access denied to this form.' });
      }
    }

    const responses = await Response.find({ form: formId }).sort({ createdAt: -1 });

    res.status(200).json(responses);
  } catch (error) {
    console.error('Get Responses Error:', error);
    res.status(500).json({ message: 'Server error fetching responses.', error: error.message });
  }
});

module.exports = router;
