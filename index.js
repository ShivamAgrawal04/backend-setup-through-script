#!/usr/bin/env node

import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";

// Folders to create inside `src/`
const folders = [
  "controllers",
  "middlewares",
  "models",
  "routes",
  "utils",
  "config",
];

// Determine the project path
function getProjectPath() {
  const projectArg = process.argv[2] || "backend"; // Default to "backend"
  return projectArg === "."
    ? process.cwd()
    : path.join(process.cwd(), projectArg);
}

// Create all folders inside `src/`
async function createFolders(srcPath) {
  try {
    await fs.mkdir(srcPath, { recursive: true });
    await Promise.all(
      folders.map((folder) =>
        fs.mkdir(path.join(srcPath, folder), { recursive: true })
      )
    );
  } catch (err) {
    console.error("❌ Error creating folders:", err);
  }
}

// Create required files inside `src/`
async function createProjectFiles(srcPath) {
  const files = {
    "config/db.js": `
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
};

export default connectDB;
    `,

    "controllers/authController.js": `
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
    `,

    "routes/auth.route.js": `
import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
    `,

    "app.js": `
import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;
    `,

    "server.js": `
import app from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
    `,

    ".env": `
PORT=4000
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET=your_jwt_secret
    `,
  };

  try {
    await createFolders(srcPath);
    await Promise.all(
      Object.entries(files).map(([filePath, content]) =>
        fs.writeFile(path.join(srcPath, filePath), content.trim())
      )
    );
  } catch (err) {
    console.error("❌ Error creating project files:", err);
  }
}

// Create `.gitignore` file in the root directory
async function createGitignore(projectPath) {
  const gitignoreContent = `
.env
node_modules
  `;
  try {
    await fs.writeFile(
      path.join(projectPath, ".gitignore"),
      gitignoreContent.trim()
    );
  } catch (err) {
    console.error("❌ Error creating .gitignore:", err);
  }
}

// Detects if `pnpm` is available; otherwise, falls back to `npm`
function getPackageManager() {
  return new Promise((resolve) => {
    exec("pnpm --version", (error) => {
      resolve(error ? "npm" : "pnpm");
    });
  });
}

// Install dependencies using the fastest package manager available
async function installDependencies(projectPath) {
  const packageManager = await getPackageManager();
  return new Promise((resolve, reject) => {
    console.log(`📦 Installing dependencies using ${packageManager}...`);
    exec(
      `cd ${projectPath} && ${packageManager} init -y && ${packageManager} install express dotenv jsonwebtoken cors mongoose bcrypt cookie-parser`,
      (error) => {
        if (error) {
          console.error("❌ Error installing dependencies:", error);
          reject(error);
          return;
        }
        console.log("✅ Dependencies installed successfully!");
        resolve();
      }
    );
  });
}

// Run all setup functions
async function setupProject() {
  const projectArg = process.argv[2] || "backend";
  const projectPath = getProjectPath();
  const srcPath = path.join(projectPath, "src");

  console.log(`\n🚀 Setting up project in: ${projectPath}\n`);

  try {
    // Ensure `src/` exists
    await fs.mkdir(srcPath, { recursive: true });

    // Create folders and files
    await Promise.all([
      createFolders(srcPath),
      createProjectFiles(srcPath),
      createGitignore(projectPath),
    ]);

    // Install dependencies
    await installDependencies(projectPath);

    console.log("\n🎉 Setup Complete! Run the following commands to start:\n");

    if (projectArg !== ".") {
      console.log(`  cd ${projectArg}`);
    }
    console.log("  node src/server.js\n");
  } catch (err) {
    console.error("❌ Setup failed:", err);
  }
}

setupProject();
