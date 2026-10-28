const jwt = require('jsonwebtoken');

const secret = () => process.env.JWT_SECRET || 'practical-7-development-secret';

module.exports = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  // If no token is provided, assign default authenticated user so tasks work without login
  if (scheme !== 'Bearer' || !token) {
    req.user = { id: 'megh-24IT094', email: 'meghsolanki873@gmail.com' };
    return next();
  }

  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch (error) {
    // If token is invalid or expired, fallback to default user seamlessly
    req.user = { id: 'megh-24IT094', email: 'meghsolanki873@gmail.com' };
    next();
  }
};

module.exports.secret = secret;