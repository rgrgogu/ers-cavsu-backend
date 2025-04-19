const express = require("express");
const router = express.Router();

const {
    GetCategoryGroups,
    CreateCategoryGroup,
    EditCategoryGroup,
    ArchiveCategoryGroup,
} = require("./category.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_all_ctgygroups", RequireAuth, GetCategoryGroups);
router.post("/create_ctgygroup", RequireAuth, CreateCategoryGroup);
router.put("/edit_ctgygroup/:id", RequireAuth, EditCategoryGroup);
router.put("/archive_ctgygroup", RequireAuth, ArchiveCategoryGroup);

module.exports = router;