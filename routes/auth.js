const express = require("express");
const bcrypt = require("bcrypt");
// const User = require("./models/User");

const router = express.Router();

// Signup Route
app.post("/signup", async (req, res) => {
    const { name, uniqueId, password } = req.body;

    try {
        // Check if uniqueId already exists
        const existingUser = await User.findOne({ uniqueId });
        if (existingUser) {
            return res.redirect("/login"); // Redirect to login if user exists
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            uniqueId,
            password: hashedPassword
        });

        await newUser.save();
        res.send("Signup successful! Please <a href='/login'>login here</a>.");
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Server error during signup.");
    }
});

// Login Route
post.post("/login", async (req, res) => {
    const { uniqueId, password } = req.body;

    try {
        // Check if uniqueId exists
        const user = await User.findOne({ uniqueId });
        if (!user) {
            return res.redirect("/signup"); // Redirect to signup if user does not exist
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.send("Login successful! Redirecting to <a href='/firstPage'>First Page</a>.");
        } else {
            res.status(400).send("Invalid password. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error during login.");
    }
});

module.exports = router;
