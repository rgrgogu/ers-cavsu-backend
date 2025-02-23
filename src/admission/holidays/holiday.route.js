const express = require("express");
const router = express.Router();

const {
    CreateHolidayGroup,
    GetHoliday,
    EditMultipleHolidays,
    GetHolidayGroup,
    EditHoliday,
    CreateSingleHoliday,
    ArchiveHolidayGroup
} = require("./holiday.controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_all", RequireAuth, GetHolidayGroup);
router.get("/get_holiday/:name", RequireAuth, GetHoliday);
router.post("/create_grp", RequireAuth, CreateHolidayGroup);
router.post("/add_holiday/:id", RequireAuth, CreateSingleHoliday);
router.put("/edit_multiple/:id", RequireAuth, EditMultipleHolidays);
router.put("/edit_holiday/:id", RequireAuth, EditHoliday);
router.put("/archive/:id", RequireAuth, ArchiveHolidayGroup);

module.exports = router;