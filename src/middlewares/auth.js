const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ status_code: 401, message: 'No token provided' });
  }

  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ status_code: 401, message: 'Invalid authorization header format' });
  }

  const token = parts[1];
  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ status_code: 400, message: 'Invalid token' });
  }
};

module.exports = { verifyToken };
