#!/usr/bin/env node

import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";

// Get project name from command-line arguments
const projectName = process.argv[2] || "."; // Default to current directory
const isCurrentDir = projectName === "."; // Check if installing in current directory
const projectPath = path.resolve(projectName);
const srcPath = path.join(projectPath, "src");

// Folders to create inside `src/`
const folders = [
  "controllers",
  "middlewares",
  "models",
  "routes",
  "utils",
  "config",
];

// Files to create
const files = {
  "config/db.js": `import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
};

export default connectDB;`,

  "server.js": `import app from "./app.js";

const PORT = process.env.PORT || 4000;
if (!PORT) console.error("❌ Port is not specified in .env file");

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port http://localhost:\${PORT}\`);
});`,

  ".env": `PORT=4000
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET=your_jwt_secret`,

  "app.js": `import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
const app = express();

// connectDB();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;`,

  "routes/authRoutes.js": `import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;`,
  "controllers/authController.js": `
// import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// User Registration
export const registerUser = async (req, res) => {
const { name, email, password } = req.body;

try {
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ message: "User registered successfully" });
} catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
}
};

// User Login
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

// Get User Data (Protected Route)
export const getUser = async (req, res) => {
try {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
} catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
}
};

`,
};

// Function to create folders
async function createFolders() {
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

// Function to create files
async function createProjectFiles() {
  try {
    await createFolders();
    await Promise.all(
      Object.entries(files).map(([filePath, content]) =>
        fs.writeFile(path.join(srcPath, filePath), content.trim())
      )
    );
  } catch (err) {
    console.error("❌ Error creating project files:", err);
  }
}

// Function to create package.json if not exists
async function ensurePackageJson() {
  const packageJsonPath = path.join(projectPath, "package.json");
  try {
    await fs.access(packageJsonPath);
  } catch {
    console.log("📄 Creating package.json...");
    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(
        {
          name: path.basename(projectPath),
          version: "1.0.0",
          main: "server.js",
          scripts: {
            start: "node src/server.js",
            dev: "nodemon src/server.js",
          },
          dependencies: {},
          type: "module",
        },
        null,
        2
      )
    );
  }
}

// Function to update package.json
async function updatePackageJson() {
  const packageJsonPath = path.join(projectPath, "package.json");
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));

    packageJson.type = "module";
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "nodemon server.js",
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (err) {
    console.error("❌ Error updating package.json:", err);
  }
}

// Install dependencies and update package.json
async function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log("📦 Installing dependencies...");
    exec(
      `cd ${projectPath} && npm install express dotenv jsonwebtoken cors mongoose bcrypt cookie-parser nodemon`,
      async (error) => {
        if (error) {
          console.error("❌ Error installing dependencies:", error);
          reject(error);
        } else {
          console.log("✅ Dependencies installed successfully!");
          await updatePackageJson(); // Update package.json after dependencies are installed
          resolve();
        }
      }
    );
  });
}

// Main function to set up the project
async function setupProject() {
  console.log(
    `\n🚀 Setting up project in: ${
      isCurrentDir ? "current directory" : projectPath
    }...\n`
  );

  try {
    if (!isCurrentDir) {
      await fs.mkdir(projectPath, { recursive: true });
    }

    await ensurePackageJson();
    await createProjectFiles();
    await installDependencies();

    console.log("\n🎉 Setup Complete! Run the following commands to start:\n");
    if (!isCurrentDir) console.log(`  cd ${projectName}`);
    console.log("  cd src");
    console.log("  npm run dev\n");
  } catch (err) {
    console.error("❌ Setup failed:", err);
  }
}

setupProject();
