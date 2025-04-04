const jwt = require('jsonwebtoken')
// const Applicant  = require('../../src/applicant/login/app_login.model')
// const Admin = require('../../src/admin/login/adm_login.model')
// const Admission = require('../../src/admission/login/adn_login.model')

const RequireAuth = async (req, res, next) => {
    // const models = {
    //     admin: Admin,
    //     applicant: Applicant,
    //     admission: Admission,
    // }

    // verify user is authenticated
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authorization.split(' ')[1]

    try {
        console.log()
        const { _id, role } = jwt.verify(token, process.env.SECRET)
        const extractedWord = req.baseUrl.split('/')[2];
        console.log(extractedWord,role)
        if(extractedWord === role){
            // req.user = await models[role].findOne({ _id }).select('_id')
            next()
        }
        else{
            res.status(400).json({ error: 'Request is not applicable' })
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({ error: 'Request is not authorized' })
    }
}

module.exports = RequireAuth