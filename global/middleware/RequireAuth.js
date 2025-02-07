const jwt = require('jsonwebtoken')
const Applicant  = require('../../src/applicant/account_login/account_login.model')
const Admin = require('../../src/admin/login/adm_login.model')

const RequireAuth = async (req, res, next) => {
    const models = {
        admin: Admin,
        applicant: Applicant
    }

    // verify user is authenticated
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authorization.split(' ')[1]

    try {
        const { _id, role } = jwt.verify(token, process.env.SECRET)
        const extractedWord = req.baseUrl.split('/')[2];

        if(extractedWord === role){
            req.user = await models[role].findOne({ _id }).select('_id')
            next()
        }
        else{
            console.log("eme")
            res.status(400).json({ error: 'Request is not applicable' })
        }
    } catch (error) {
        console.log(error.message)
        res.status(401).json({ error: 'Request is not authorized' })
    }
}

module.exports = RequireAuth