const jwt = require('jsonwebtoken')

const CreateAccessToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '30m' })
}

const CreateRefreshToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '1d' })
}

const VerifyRefreshToken = (refreshToken) => {
    // Verifying refresh token
    try {
        jwt.verify(refreshToken, process.env.SECRET);
        return true; // Token is valid
    } catch (err) {
        return false; // Token is invalid
    }
}

module.exports = { CreateAccessToken, CreateRefreshToken, VerifyRefreshToken };