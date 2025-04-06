const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')

const User = require("./model");
const ProfileOne = require("../profile_one/model") // used for student and applicant
const ProfileTwo = require("../profile_two/model") // used for faculty, registrar, admin, and admission

const BCrypt = require("../../../global/config/BCrypt");
const { CreateEmailToken, VerifyTokenInReset, CreateAccessToken, CreateRefreshToken, VerifyRefreshToken } = require("../../../global/functions/CreateToken");
const { CreateFolder } = require("../../../global/utils/Drive");
const { Send } = require("../../../global/config/Nodemailer")
const CheckUser = require("../../../global/functions/CheckUser");

const rolePrefixes = {
    applicant: { prefix: 'AP', folder: process.env.APPLICANT_STUDENT_GDRIVE_FOLDER },
    admission: { prefix: 'AD', folder: process.env.ADMISSION_GDRIVE_FOLDER },
    faculty: { prefix: 'FT', folder: process.env.FACULTY_GDRIVE_FOLDER },
    registrar: { prefix: 'RG', folder: process.env.REGISTRAR_GDRIVE_FOLDER },
    admin: { prefix: 'AM', folder: process.env.ADMIN_GDRIVE_FOLDER },
};

const LoginController = {
    // Login function for all users
    Login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username });

            if (!user) {
                return res.status(400).json({ error: 'User not found' });
            }

            if (user.isArchived) {
                return res.status(400).json({ error: 'User is deactivated. Please contact the admin.' });
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
                    maxAge: 24 * 60 * 60 * 1000,
                });

                return res.status(200).json({ user: user, accessToken });
            } else {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Register function for all users
    // do not use register for student, since we are updating the role from applicant to student
    Register: async (req, res) => {
        try {
            const { role } = req.body;

            // Validate role
            if (!role || !rolePrefixes[role]) {
                return res.status(400).json({ error: 'Invalid or missing role.' });
            }

            // Extract prefix and folder from rolePrefixes
            const { prefix, folder } = rolePrefixes[role];
            if (!prefix) {
                return res.status(400).json({ error: 'Role prefix is missing.' });
            }

            // Generate user_id
            const count = await User.countDocuments({ role }) + 1;
            const year = new Date().getFullYear();
            const paddedCount = count.toString().padStart(6, '0');
            const user_id = `${prefix}${year}${paddedCount}`;

            // Assign default values for username and password
            const username = req.body.username || user_id;
            const password = await BCrypt.hash(req.body.password || process.env.DEFAULT_PASS);

            // Combine full name
            const fullName = [req.body.name.firstname, req.body.name.middlename, req.body.name.lastname, req.body.name.extension]
                .filter(Boolean)
                .join(' ');

            // Use the folder from rolePrefixes or fallback to a default folder
            const folder_id = await CreateFolder(fullName, folder);

            // Create user object
            const userData = { ...req.body, username, password, user_id, folder_id };

            // Create user in the database
            const user = await User.create(userData);

            // Create profile based on role
            if (role === 'applicant') {
                const profileOne = await ProfileOne.create({});
                await User.findByIdAndUpdate(user._id, { profile_id_one: profileOne._id });
            } else {
                const profileTwo = await ProfileTwo.create({ sex: req.body.sex });
                await User.findByIdAndUpdate(user._id, { profile_id_two: profileTwo._id });
            }

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
                await User.findByIdAndUpdate( id, { password: await BCrypt.hash(data.password) })
                res.status(200).json("Password successfully changed");
            }
            else
                res.status(400).json("Password doesn't matched.");
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

module.exports = LoginController
