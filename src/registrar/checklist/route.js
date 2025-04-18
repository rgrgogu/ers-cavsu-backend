const express = require('express');
const router = express.Router();
const ChecklistController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/:id', RequireAuth, ChecklistController.GetChecklistForEnrollee);
router.get('/student/:id', RequireAuth, ChecklistController.GetChecklistForStudent);

module.exports = router;