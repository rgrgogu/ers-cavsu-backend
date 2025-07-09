const jwt = require('jsonwebtoken')

const CreateAccessToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '30m' })
}

const CreateRefreshToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '1d' })
}

const CreateEmailToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '30m' })
}

const CreateOTPToken = (otp) => {
    return jwt.sign({ otp }, process.env.SECRET, { expiresIn: '5m' })
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

const VerifyTokenInReset = (token) => {
    if (!token) {
        throw new Error("Invalid user token");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    } catch {
        throw new Error("Invalid authentication credentials");
    }

    if (!decodedToken.hasOwnProperty("_id")) {
        throw new Error("Invalid authentication credentials");
    }

    const { _id } = decodedToken;

    return _id
}

const VerifyOTP = (token, existingOTP) => {
    if (!token) {
        throw new Error("Invalid OTP token");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    } catch {
        throw new Error("Invalid authentication credentials");
    }

    if (!decodedToken.hasOwnProperty("otp")) {
        throw new Error("Invalid authentication credentials");
    }

    const { otp } = decodedToken;

    console.log(otp, existingOTP)
    
    return otp === existingOTP;
}

module.exports = { CreateOTPToken, CreateEmailToken, VerifyTokenInReset, CreateAccessToken, CreateRefreshToken, VerifyRefreshToken, VerifyOTP };