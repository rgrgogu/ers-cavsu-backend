const jwt = require('jsonwebtoken')

const RequireAuth = async (req, res, next) => {
    try {
        // verify user is authenticated
        const { authorization } = req.headers

        if (!authorization) {
            return res.status(401).json({ error: 'Authorization token required' })
        }

        const token = authorization.split(' ')[1]

        const { _id, role } = jwt.verify(token, process.env.SECRET)
        const extractedWord = req.baseUrl.split('/')[2];

        if (extractedWord === role || extractedWord === 'auth') {
            req.token = token
            next()
        }
        else {
            res.status(400).json({ error: 'Request is not applicable' })
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({ error: 'Request is not authorized' })
    }
}

module.exports = RequireAuth