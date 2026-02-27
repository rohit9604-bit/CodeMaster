const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const register = async (req, res) => {
    const { username, email, password, role, adminPasscode } = req.body;

    try {
        // Check if user exists
        const userCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Check Admin Passcode if registering as admin
        if (role === 'admin') {
            const codeCheck = await pool.query("SELECT value FROM app_settings WHERE key = 'admin_signup_code'");
            const actualCode = codeCheck.rows.length > 0 ? codeCheck.rows[0].value : 'admin123';
            if (adminPasscode !== actualCode) {
                return res.status(403).json({ error: "Invalid Admin Access Code" });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password_hash, role, points) VALUES ($1, $2, $3, $4, 0) RETURNING id, username, email, role, points",
            [username, email, password_hash, role || "user"]
        );

        const user = newUser.rows[0];

        // Generate token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
        });

        res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        res.json({
            message: "Logged in successfully",
            user: { id: user.id, username: user.username, email: user.email, role: user.role, points: user.points },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};

const getMe = async (req, res) => {
    try {
        const userResult = await pool.query(
            "SELECT id, username, email, role, points FROM users WHERE id = $1",
            [req.user.id]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Please provide both current and new passwords" });
    }

    try {
        // Find existing user to get current password hash
        const userResult = await pool.query("SELECT password_hash FROM users WHERE id = $1", [
            req.user.id,
        ]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult.rows[0];

        // Validate current password
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update database
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
            newPasswordHash,
            req.user.id
        ]);

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    const { username, email, newPassword } = req.body;

    if (!username || !email || !newPassword) {
        return res.status(400).json({ error: "Please provide username, email, and new password" });
    }

    try {
        // Find existing user by BOTH username and email to verify identity
        const userResult = await pool.query("SELECT id FROM users WHERE username = $1 AND email = $2", [
            username,
            email,
        ]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Invalid username or email combination." });
        }

        const user = userResult.rows[0];

        // Hash the completely new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update database
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
            newPasswordHash,
            user.id
        ]);

        res.json({ message: "Password reset successful! You can now log in." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { register, login, logout, getMe, changePassword, resetPassword };
