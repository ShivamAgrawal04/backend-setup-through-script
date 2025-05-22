# Express.js Project Setup Script

## 🚀 Overview

This script automates the setup of an Express.js project with essential dependencies and folder structure. It simplifies project initialization, installs necessary packages, and ensures a clean environment.

## 📁 Project Structure

After running the script, your project will have the following structure:

```
project-name/
│-- src/
│   │-- config/
│   │   ├── db.js
│   │-- controllers/
│   │   ├── authController.js
│   │-- middlewares/
│   │-- models/
│   │-- routes/
│   │   ├── authRoutes.js
│   │-- utils/
│   ├── app.js
│   ├── server.js
│-- .gitignore
│-- .env
│-- package.json
```

## 🛠️ Features

- Automatically creates necessary folders (`src/config`, `src/controllers`, etc.).
- Generates essential files (`server.js`, `app.js`, `.env`, `db.js`).
- Initializes `package.json` (if not present) and sets up scripts.
- Installs required dependencies.
- Adds `.gitignore` to exclude `node_modules` and `.env`.

## 📌 Prerequisites

- Node.js (Latest LTS recommended)
- npm installed

## ⚡ Installation & Usage

### **Step 1: Run the setup script**

```sh
npx shiv-backend-setup project-name
```

_Replace `project-name` with your desired project folder name._

### **Step 2: Navigate into the project folder**

```sh
cd project-name
```

### **Step 3: Start the server**

- **Run with Node.js:**
  ```sh
  npm start
  ```
- **Run with Nodemon (for development):**
  ```sh
  npm run dev
  ```

## 📦 Installed Dependencies

| Package       | Purpose                         |
| ------------- | ------------------------------- |
| express       | Backend framework               |
| dotenv        | Environment variable management |
| mongoose      | MongoDB ODM                     |
| jsonwebtoken  | Authentication (JWT)            |
| bcrypt        | Password hashing                |
| cookie-parser | Cookie handling                 |
| cors          | Cross-Origin Resource Sharing   |
| nodemon       | Auto-restart for development    |

## 📝 Environment Variables (.env)

```sh
PORT=4000
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET=your_jwt_secret
```

## 🤖 API Routes

### **Auth Routes** (`/api/auth`)

| Method | Route       | Description       |
| ------ | ----------- | ----------------- |
| POST   | `/register` | User registration |
| POST   | `/login`    | User login        |

## 🛠️ Contributing

1. Fork the repository.
2. Clone the forked repository.
3. Create a new branch (`git checkout -b feature-branch`).
4. Commit your changes (`git commit -m "Added new feature"`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a Pull Request.

## 📜 License

This project is licensed under the MIT License.

---

🎉 **Happy Coding!** 🚀

```sh
git add .
git commit -m "message"
npm version patch
npm publish --access public
```
