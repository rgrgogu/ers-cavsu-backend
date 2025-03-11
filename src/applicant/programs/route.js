const express = require('express');
const router = express.Router();
const {getProgramsByApplicantType} = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, getProgramsByApplicantType);

module.exports = router;