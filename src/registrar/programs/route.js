const express = require('express');
const router = express.Router();

const programController = require('./controller');

// Assuming you have authentication middleware
const RequireAuth = require("../../../global/middleware/RequireAuth");

// CRUA Routes
router.post('/', RequireAuth, programController.createProgram);        // Create
router.get('/', RequireAuth, programController.getAllPrograms);             // Read all active
router.get('/archived', RequireAuth, programController.getArchivedPrograms); // Read all archived
router.get('/:id', RequireAuth, programController.getProgram);             // Read single
router.put('/:id', RequireAuth, programController.updateProgram);     // Update
router.put('/archive/:id', RequireAuth, programController.archiveProgram); // Archive

module.exports = router;