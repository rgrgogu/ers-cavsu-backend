const User = require("./model");
const ProfileOne = require("../profile_one/model") // used for student and applicant

const BCrypt = require("../../../global/config/BCrypt");
const { CreateOTPToken, CreateEmailToken, VerifyOTP, VerifyTokenInReset, CreateAccessToken, CreateRefreshToken, VerifyRefreshToken } = require("../../../global/functions/CreateToken");
const { CreateFolder } = require("../../../global/utils/Drive");
const { Send, SendOTP } = require("../../../global/config/Nodemailer")
const CheckUser = require("../../../global/functions/CheckUser");

const LoginController = {
    // Login function for all users
    Login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username });

            // User not found
            if (!user) {
                return res.status(400).json({ error: 'An unexpected error occurred. Please contact the admin.' });
            }

            if (user.isArchived) {
                return res.status(400).json({ error: 'User is deactivated. Please contact the admin.' });
            }

            const result = await CheckUser(user, password);

            if (result.isValid) {
                const email = user.school_email || user.personal_email;
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const token = CreateOTPToken(otp);
                await SendOTP(email, otp);

                return res.status(200).json({ email, otpToken: token });
            } else {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    LoginOTP: async (req, res) => {
        try {
            const { otp, otpToken, username, password } = req.body;

            const user = await User.findOne({ username })

            // User not found
            if (!user) {
                return res.status(400).json({ error: 'An unexpected error occurred. Please contact the admin.' });
            }

            if (user.isArchived) {
                return res.status(400).json({ error: 'User is deactivated. Please contact the admin.' });
            }
            // Check if OTP is valid
            if (!VerifyOTP(otpToken, otp)) {
                return res.status(400).json({ error: 'Invalid OTP' });
            }

            const result = await CheckUser(user, password);

            if (result.isValid) {
                const accessToken = CreateAccessToken(user._id, user.role);
                const refreshToken = CreateRefreshToken(user._id, user.role);
                // Assigning refresh token in http-only cookie
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000, // 1 day
                });
                return res.status(200).json({ user, accessToken, mustResetPassword: result.mustResetPassword, mustResetUsername: username === user.user_id });
            } else {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Get user details by ID
    GetUserById: async (req, res) => {
        try {
            const { id } = req.params;

            const user = await User.findById(id)
                .populate('profile_id_one'); // Optional: Populate profile if needed

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json({ user });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },


    // Register function for applicant
    Register: async (req, res) => {
        try {
            const role = "applicant"

            // Generate user_id
            const count = await User.countDocuments({ role: { $in: ['applicant', 'student'] } }) + 1;
            const year = new Date().getFullYear();
            const paddedCount = count.toString().padStart(6, '0');
            const user_id = `AP${year}${paddedCount}`;

            // Assign default values for username and password
            const username = req.body.username || user_id;
            const password = await BCrypt.hash(req.body.password || process.env.DEFAULT_PASS);

            // Combine full name
            const fullName = [req.body.name.firstname, req.body.name.middlename, req.body.name.lastname, req.body.name.extension]
                .filter(Boolean)
                .join(' ');

            // Create user in the database
            const user = await User.create({ ...req.body, role, username, password, user_id });

            // Use the folder from rolePrefixes or fallback to a default folder
            const folder_id = await CreateFolder(fullName, process.env.APPLICANT_STUDENT_GDRIVE_FOLDER);

            // Create profile based on role
            const profileOne = await ProfileOne.create({ user_id: user._id });
            await User.findByIdAndUpdate(user._id, { profile_id_one: profileOne._id, folder_id });

            res.status(201).json({ message: 'User created successfully.' });
        } catch (error) {
            if (error.code === 11000) return res.status(400).json({ error: "Please try another username." }) // Duplicate key error
            else return res.status(400).json({ error: error.message })
        }
    },

    // Refresh token is used to get a new access token when the old one expires
    Refresh: async (req, res) => {
        try {
            if (req.cookies?.refreshToken) {
                // Destructuring refreshToken from cookie
                const { id, role } = req.params;
                const refreshToken = req.cookies.refreshToken;
                const valid = VerifyRefreshToken(refreshToken)

                if (valid) {
                    // Correct token we send a new access token
                    const accessToken = CreateAccessToken(id, role)
                    return res.json({ accessToken });
                }
                else
                    // Wrong Refesh Token
                    return res.status(406).json({ message: 'Unauthorized' });
            } else {
                return res.status(406).json({ message: 'Unauthorized' });
            }
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    },

    // RequestReset function for all users
    RequestReset: async (req, res) => {
        try {
            const { email, username } = req.body;

            if (!username) res.status(400).send({ message: "Invalid username." });
            if (!email) res.status(400).send({ message: "Invalid email address." });

            const find = await User.findOne({
                username,
                $or: [
                    { personal_email: email },
                    { school_email: email }
                ]
            });

            if (find) {
                const token = CreateEmailToken(find._id);
                const link = `${process.env.DEV_LINK || process.env.PROD_LINK}/auth/verify/${token}`
                await Send(email, link);

                res.status(200).json({ message: 'Sent password successfully' });
            }
            else {
                res.status(400).json({ message: 'Email doesn\'t exist.' });
            }
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    Verify: async (req, res) => {
        try {
            const token = req.params.token;
            VerifyTokenInReset(token)
            res.status(200).send("Verfication successful");
        } catch (error) {
            res.status(401).send(error.message);
        }
    },

    ChangePass: async (req, res) => {
        try {
            const data = req.body;
            const id = VerifyTokenInReset(req.token)

            if (id && data.confirm === data.password) {
                await User.findByIdAndUpdate(id, { password: await BCrypt.hash(data.password) })
                res.status(200).json("Password successfully changed");
            }
            else
                res.status(400).json("Password doesn't matched.");
        } catch (error) {
            res.status(400).send(error);
        }
    },

    InitialReset: async (req, res) => {
        try {
            const data = req.body;
            const id = req.params.id;

            if (id && data.confirm === data.password) {
                // Build the update object dynamically
                const updateData = { password: await BCrypt.hash(data.password) };
                if (data.username) {
                    updateData.username = data.username; // Only include username if it's provided
                }

                await User.findByIdAndUpdate(id, updateData);
                res.status(200).json("Password successfully changed");
            } else {
                res.status(400).json("Password doesn't match.");
            }
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

module.exports = LoginController
