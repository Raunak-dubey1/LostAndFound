const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("./User");
const { protect } = require("./authMiddleware");
const { sendOTPEmail, sendWelcomeEmail } = require("./mailService");

// Helper: generate JWT token with 30-day expiry
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper: generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
// Step 1: Send OTP to user's email
router.post("/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log("POST /api/auth/send-otp request received", {
      email,
      name,
      mailUserConfigured: !!process.env.MAIL_USER,
      mailPasswordConfigured: !!process.env.MAIL_PASSWORD,
      mailService: process.env.MAIL_SERVICE || "gmail",
    });

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name is required (minimum 2 characters)",
        });
    }

    // Validate email format (must be @nie.ac.in)
    if (!email.endsWith("@nie.ac.in")) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only @nie.ac.in email addresses are allowed",
        });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name.trim(),
        otp,
        otpExpiry,
        isVerified: false,
      });
    } else {
      // Update existing user with new OTP and name
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.name = name.trim();
      await user.save();
    }

    // Send OTP via email
    await sendOTPEmail(email, otp);
    console.log("OTP sent successfully", { email, userId: user._id });

    res.json({
      success: true,
      message: "OTP sent to your email. Please check your inbox.",
      data: { email },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstValidationMessage =
        Object.values(error.errors)[0]?.message || "Invalid email";
      console.error("send-otp validation error", {
        error: firstValidationMessage,
        stack: error.stack,
      });
      return res
        .status(400)
        .json({ success: false, message: firstValidationMessage });
    }

    console.error("send-otp unexpected error", {
      email: req.body?.email,
      name: req.body?.name,
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({
        success: false,
        message: "Error sending OTP",
        error: error.message,
      });
  }
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Step 2: Verify OTP and login user
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    // Find user
    const user = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name || "User").catch((err) => {
      console.error("Welcome email send failed:", err.message);
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error verifying OTP",
        error: error.message,
      });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find user and explicitly include password (it's excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare passwords using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error logging in",
        error: error.message,
      });
  }
});

// ─── GET /api/auth/user/:id ───────────────────────────────────────────────────
router.get("/user/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching user",
        error: error.message,
      });
  }
});

module.exports = router;
