const jwt = require("jsonwebtoken");
const axios = require("axios");
const path = require("path");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
require('dotenv').config(); // Load .env FIRST

// ENV Vars
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";
const HF_TOKEN = process.env.HF_TOKEN;

// ======================================================================
// 1. HuggingFace Chat Completion Client (Llama 3 8B)
// ======================================================================
const hfClient = async (prompt) => {
    const token = process.env.HF_TOKEN || HF_TOKEN; // Check both
    if (!token) {
      console.error("❌ HF_TOKEN not found in environment!");
      throw new Error("HF token missing");
    }

    const url = "https://router.huggingface.co/v1/chat/completions";

    try {
        const response = await axios.post(
            url,
            {
                model: "meta-llama/Meta-Llama-3-8B-Instruct",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                }
            }
        );

        const choice = response.data.choices?.[0];

        // Safely extract model response
        let output =
            choice?.message?.content ||
            choice?.content?.[0]?.text ||
            "";

        if (!output.trim()) {
            console.log("HF WARNING: Model returned empty output");
            return "AI returned no answer.";
        }

        return output.trim();
    } catch (err) {
        console.log("HF ERROR:", err.response?.data || err.message);
        throw new Error("HF model call failed");
    }
};

// ======================================================================
// 2. Auth Middleware
// ======================================================================
const authMiddleware = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};

// ======================================================================
// 3. Admin Middleware
// ======================================================================
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") return next();
    res.status(403).json({ msg: "Access denied: Admin privileges required" });
};

// ======================================================================
// 4. Global Error Handler
// ======================================================================
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};

// ======================================================================
// 5. Resume Text Extraction
// ======================================================================
const extractResumeText = async (buffer, filename) => {
    const ext = path.extname(filename).toLowerCase();

    if (ext === ".pdf") {
        const data = await pdf(buffer);
        return data.text || ""; // avoid undefined
    }

    if (ext === ".docx") {
        const { value } = await mammoth.extractRawText({ buffer });
        return value || "";
    }

    throw new Error("Unsupported file type. Only PDF and DOCX allowed.");
};

// EXPORTS
module.exports = {
    hfClient,
    authMiddleware,
    adminMiddleware,
    errorHandler,
    extractResumeText
};
