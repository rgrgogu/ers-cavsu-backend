const express = require('express');
const router = express.Router();
const sectionsController = require('./controller'); // Adjust path as needed

// Routes for sections
router.post('/', sectionsController.createSection);          // Create a new section
router.get('/', sectionsController.getAllSections);          // Get all sections
router.get('/wildcard', sectionsController.getSectionsByWildCard);          // Get all sections
router.get('/:id', sectionsController.getSectionById);       // Get a specific section
router.put('/archive_many', sectionsController.archiveManySections); // Archive multiple sections
router.put('/:id', sectionsController.updateSection);        // Update a section

module.exports = router;