exports.allow = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, msg: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, msg: `Role '${req.user.role}' not authorized` });
  }
  next();
};
