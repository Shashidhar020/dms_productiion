export const adminAuth = (req, res, next) => {
  try {
    const user = req.user; 

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.user_type !== "PLATFORM_ADMIN") {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
