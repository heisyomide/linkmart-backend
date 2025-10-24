import { verifyToken } from "../config/jwt.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded); // 👈 Add this
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
};
export const userOnly = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Forbidden: Users only" });
  }
  next();
};