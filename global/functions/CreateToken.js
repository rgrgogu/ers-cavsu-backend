const jwt = require('jsonwebtoken')

const CreateAccessToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '30m' })
}

const CreateRefreshToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '1d' })
}

const CreateEmailToken = (email) => {
    return jwt.sign({ email }, process.env.SECRET, { expiresIn: '30m' })
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
        console.log("dito")
        throw new Error("Invalid user token");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    } catch {
        console.log("dito1")
        throw new Error("Invalid authentication credentials");
    }

    if (!decodedToken.hasOwnProperty("email")){
        console.log("dito 2")
        throw new Error("Invalid authentication credentials");
    }
        
    const { email } = decodedToken;

    return email
}

module.exports = { CreateEmailToken, VerifyTokenInReset, CreateAccessToken, CreateRefreshToken, VerifyRefreshToken };