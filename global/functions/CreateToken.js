const jwt = require('jsonwebtoken')

const CreateToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' })
}

module.exports = CreateToken;