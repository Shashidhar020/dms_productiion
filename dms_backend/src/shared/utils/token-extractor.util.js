const extractAccessToken = (req) => {
  const authHeader = req.headers.authorization;

  // Priority 1: Authorization Header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

   
  // Priority 2: Secure Cookie (future-ready)
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

export default extractAccessToken;