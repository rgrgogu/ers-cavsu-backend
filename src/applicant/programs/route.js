const express = require('express');
const router = express.Router();
const programController = require('../../registrar/programs/controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, programController.getAllPrograms);

module.exports = router;