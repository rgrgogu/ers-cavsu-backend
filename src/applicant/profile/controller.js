const User = require("../../auth/login/model");
const ProfileOne = require("../../auth/profile_one/model") // used for student and applicant
const BCrypt = require("../../../global/config/BCrypt");

const ProfileController = {

    Update: async (req, res) => {
        try {
            const { id } = req.params; // Expecting user _id in URL params
            const updates = req.body;
            console.log('Update request received for user:', updates);

            // Find and update user
            const user = await User.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            res.status(200).json({ 
                message: 'User updated successfully',
                user: {
                    user_id: user.user_id,
                    fullName: user.fullName,
                    username: user.username,
                    role: user.role,
                    status: user.status
                }
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
