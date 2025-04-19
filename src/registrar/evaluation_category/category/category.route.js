const express = require("express");
const router = express.Router();

const {
    GetCategoryGroups,
} = require("./category.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_all_ctgygroups", RequireAuth, GetCategoryGroups);

module.exports = router;