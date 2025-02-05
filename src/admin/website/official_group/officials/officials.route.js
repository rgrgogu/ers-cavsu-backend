const express = require("express");
const router = express.Router();

const {
    GetOfficials,
    CreateOfficials,
    EditOfficials,
    ArchiveOfficials,
} = require("./officials.controller");

const RequireAuth = require("../../../../../global/middleware/RequireAuth");

router.get("/get_all_officials", RequireAuth, GetOfficials);
router.post("/create_official", RequireAuth, CreateOfficials);
router.put("/edit_official/:id", RequireAuth, EditOfficials);
router.put("/archive_official/:id", RequireAuth, ArchiveOfficials);

module.exports = router;