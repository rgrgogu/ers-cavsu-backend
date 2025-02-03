const express = require("express");
const router = express.Router();

const {
    GetCavsuInfo,
    CreateCavsu,
    EditMandate,
    EditVision,
    EditMission,
    EditCoreValues,
    EditQualityPolicy,
    EditHistory
} = require("./cavsu_info.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_info", RequireAuth, GetCavsuInfo);
router.post("/create_cavsu", RequireAuth, CreateCavsu);
router.put("/edit_mandate/:id",  RequireAuth, EditMandate);
router.put("/edit_vision/:id", RequireAuth, EditVision);
router.put("/edit_mission/:id",  RequireAuth, EditMission);
router.put("/edit_core/:id", RequireAuth, EditCoreValues);
router.put("/edit_quality/:id",  RequireAuth, EditQualityPolicy);
router.put("/edit_history/:id", RequireAuth, EditHistory);

module.exports = router;