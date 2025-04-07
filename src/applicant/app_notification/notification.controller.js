
const { getIO, getOnlineUsers } = require("../../../global/config/SocketIO"); // Import getIO to get the existing `io`
const Notification = require("./notification.model")

class NotificationController {
    static async sendBulkNotification(data, userIds) {
        try {
            const io = getIO();
            const onlineUsers = getOnlineUsers();
            const notificationsToSave = []; // Store notifications to save in DB

            userIds.map(id => {
                const newNotification = { title: data.title, message: data.log, user: id, date: new Date() };
                notificationsToSave.push(newNotification); // Store in DB
                const user_id = id.toString()

                // Check if user is online and send notification
                if (onlineUsers.has(user_id)) {
                    io.to(onlineUsers.get(user_id)).emit("newNotification", {
                        message: "New notification received",
                        notification: newNotification,
                    });
                }
            });

            // Save all notifications in the database
            await Notification.insertMany(notificationsToSave);
        } catch (error) {
            console.log("error", error)
        }
    }

    // Get Notifications by User
    static async getNotifications(req, res) {
        try {
            const { userId } = req.params;
            const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
            res.status(200).json(notifications);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Mark Notification as Read
    static async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
            res.status(200).json({ message: "Notification marked as read" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = NotificationController;