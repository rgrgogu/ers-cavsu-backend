const express = require('express');
const router = express.Router();
const ChecklistController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
// router.post('/', RequireAuth, ChecklistController.MassCreateChecklist);

module.exports = router;