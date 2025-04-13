const express = require('express');
const router = express.Router();

const sectionsController = require('./controller'); // Adjust path as needed
const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes for sections
router.post('/', RequireAuth, sectionsController.createSection);          // Create a new section
router.get('/', RequireAuth, sectionsController.getAllSections);          // Get all sections
router.get('/wildcard', RequireAuth, sectionsController.getSectionsByWildCard);          // Get all sections
router.get('/:id', RequireAuth, sectionsController.getSectionById);       // Get a specific section
router.put('/archive_many', RequireAuth, sectionsController.archiveManySections); // Archive multiple sections
router.put('/:id', RequireAuth, sectionsController.updateSection);        // Update a section

module.exports = router;