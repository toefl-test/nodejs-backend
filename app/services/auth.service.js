const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    if(!req.headers.authorization) return res.status(401).json({ error: 'Access denied' });
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.username = decoded.username;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;