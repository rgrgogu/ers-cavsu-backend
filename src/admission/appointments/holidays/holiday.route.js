const express = require("express");
const router = express.Router();

const {
    CreateHolidayGroup,
    EditMultipleHolidays,
} = require("./holiday.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.post("/create_grp", RequireAuth, CreateHolidayGroup);
router.put("/edit_multiple/:id", RequireAuth, EditMultipleHolidays);
// router.post("/register", Register);
// router.post("/refresh/:id", RequireAuth, Refresh);

module.exports = router;