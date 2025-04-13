const express = require('express');
const FacultyController = require('./controller');

const router = express.Router();
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get('/', RequireAuth, FacultyController.GetAllFaculty);

module.exports = router;
