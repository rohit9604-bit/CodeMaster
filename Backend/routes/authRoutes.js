const express = require("express");
const { register, login, logout, getMe, changePassword, resetPassword } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/reset-password", resetPassword);
router.get("/me", verifyToken, getMe);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
