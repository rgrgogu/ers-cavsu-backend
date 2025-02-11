const express = require("express");
const router = express.Router();

const {
    CreateHolidayGroup,
    GetHoliday,
    EditMultipleHolidays,
    GetHolidayGroup
} = require("./holiday.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_all", RequireAuth, GetHolidayGroup);
router.get("/get_holiday/:name", RequireAuth, GetHoliday);
router.post("/create_grp", RequireAuth, CreateHolidayGroup);
router.put("/edit_multiple/:id", RequireAuth, EditMultipleHolidays);
// router.post("/register", Register);
// router.post("/refresh/:id", RequireAuth, Refresh);

module.exports = router;