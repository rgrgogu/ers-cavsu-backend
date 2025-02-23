const express = require("express");
const router = express.Router();

const NotificationController = require("./notification.controller")
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_notif/:userId", RequireAuth, NotificationController.getNotifications)
router.put("/read/:notificationId", RequireAuth, NotificationController.markAsRead)

module.exports = router;