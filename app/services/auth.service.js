const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    if(!req.headers.authorization) return res.status(401).json({ error: 'Access denied' });
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        req.decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
}

function verifyAdminToken(req, res, next) {
    if(!req.headers.authorization) return res.status(401).json({ error: 'Access denied' });
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        req.decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if(req.decoded.permissions !== 'ADMIN') return res.status(401).json({ error: 'Access denied' });
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
}



function createToken(email, permissions){

    const tokenPayload = {
        email: email,
        permissions: permissions,
    };

    // Create a token
    return jwt.sign(tokenPayload, process.env.TOKEN_SECRET);
}

module.exports = {
    verifyToken,
    createToken,
    verifyAdminToken
};