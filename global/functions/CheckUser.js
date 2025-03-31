const BCrypt = require("../config/BCrypt")

const CheckUser = async (result, password, role) => {
    if (result.length === 0 || !result) {
        throw new Error(`User isn't existed. Sign up to gain access.`)
    }

    if (!(await BCrypt.compare(password, result.password))) {
        throw new Error(`Wrong password.`)
    }

    if (result.role !== role) {
        throw new Error(`User can't access. Try again`)
    }

    const isDefaultPassword = await BCrypt.compare(process.env.DEFAULT_PASS, result.password);

    // if (["Denied", "For Review"].includes(result[0].acc_status) || result[0].isArchived) {
    //     console.log(["Denied", "For Review"].includes(result[0].acc_status))
    //     console.log(!result[0].isArchived)
    //     console.log(["Denied", "For Review"].includes(result[0].acc_status) || !result[0].isArchived)
    //     throw new Error(`Your account is not eligible for the system. Contact the administrator.`)
    // }

    return {
        isValid: true,
        mustResetPassword: isDefaultPassword
    };
}

module.exports = CheckUser;