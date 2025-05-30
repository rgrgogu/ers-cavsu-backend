const User = require("../../auth/login/model");
const ProfileOne = require("../../auth/profile_one/model") // used for student and applicant
const BCrypt = require("../../../global/config/BCrypt");
const { getIO, getOnlineUsers } = require("../../../global/config/SocketIO");
const ProfileController = {

    Update: async (req, res) => {
        try {
            const { id } = req.params; // Expecting user _id in URL params
            const updates = req.body;
            console.log('Update request received for user:', updates);

            const io = getIO();
            const onlineUsers = getOnlineUsers();

            // Find and update user
            const user = await User.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            const user_id = id.toString()
            const obj = {
                birthdate: user.birthdate,
                contact_number: user.contact_number,
                personal_email: user.personal_email,
                name: user.name,
            }

            // Check if user is online and send notification
            if (onlineUsers.has(user_id)) {
                io.to(onlineUsers.get(user_id)).emit("newUserDetails", {
                    message: "New user_details received",
                    user: obj
                });
            }

            res.status(200).json({
                message: 'User updated successfully',
                user: obj
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error while updating user' });
        }
    },

}

module.exports = ProfileController
