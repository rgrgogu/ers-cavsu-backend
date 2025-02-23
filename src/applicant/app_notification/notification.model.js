const express = require("express");
const mongoose = require("mongoose");

// 🔹 Step 2: Define Notification Schema & Model
const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "app_login", required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("app_notif", notificationSchema);