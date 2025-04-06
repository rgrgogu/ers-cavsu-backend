const BCrypt = require("../config/BCrypt")

const CheckUser = async (result, password) => {
    if (result.length === 0 || !result) {
        throw new Error(`User isn't existed. Sign up to gain access.`)
    }

    if (!(await BCrypt.compare(password, result.password))) {
        throw new Error(`Wrong password.`)
    }
    
    const isDefaultPassword = await BCrypt.compare(process.env.DEFAULT_PASS, result.password);

    return {
        isValid: true,
        mustResetPassword: isDefaultPassword
    };
}

module.exports = CheckUser;