const BCrypt = require("../config/BCrypt")

const CheckUser = async (result, password, res) => {
    if (result.length === 0 || !result) {
        throw new Error(`User isn't existed. Sign up to gain access.`)
    }

    if (!(await BCrypt.compare(password, result[0].password))) {
        throw new Error(`Wrong password.`)
    }

    if (["Denied", "For Review"].includes(result[0].acc_status) || result[0].isArchived) {
        console.log(["Denied", "For Review"].includes(result[0].acc_status))
        console.log(!result[0].isArchived)
        console.log(["Denied", "For Review"].includes(result[0].acc_status) || !result[0].isArchived)
        throw new Error(`Your account is not eligible for the system. Contact the administrator.`)
    }

    return true;
}

module.exports = CheckUser;