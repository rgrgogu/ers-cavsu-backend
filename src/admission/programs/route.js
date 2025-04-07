const express = require('express');
const router = express.Router();
const { getAllPrograms } = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, getAllPrograms);

module.exports = router;