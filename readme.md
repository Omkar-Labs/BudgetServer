# ⚙️ Budget App - Backend (Server)

Welcome to the backend of my **Budget Tracker App**! This is the server-side architecture of my **first full-stack project**. It provides a robust, secure, and fast RESTful API to manage users, transactions, and budgets.

## 🚀 Features

- **Secure Authentication:** User registration, login, and secure sessions using JSON Web Tokens (JWT).
- **Password Protection:** Passwords securely hashed with Bcrypt.
- **CRUD Operations:** Create, Read, Update, and Delete endpoints for transactions and budgets.
- **Media Uploads:** Seamless image uploads for user avatars using Cloudinary & Multer.
- **Email Services:** OTP generation and password resets using Nodemailer.

## 🛠️ Tech Stack

This backend is built on the Node.js ecosystem:

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Auth:** [jsonwebtoken (JWT)](https://jwt.io/) & [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **File Uploads:** [Cloudinary](https://cloudinary.com/) & [Multer](https://www.npmjs.com/package/multer)
- **Emails:** [Nodemailer](https://nodemailer.com/)

## 🏃‍♂️ How to Run Locally

1. Clone the repository and navigate to the project folder.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file with the following keys (examples):
   - `PORT=8000`
   - `MONGODB_URI=your_mongodb_connection_string`
   - `CORS_ORIGIN=http://localhost:5173`
   - `ACCESS_TOKEN_SECRET=...`
   - `REFRESH_TOKEN_SECRET=...`
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
5. The API will listen on `http://localhost:8000`.

## 💡 What I Learned
Building this API taught me how to architect a backend from scratch, handle middleware, securely hash passwords, generate tokens for stateless authentication, and design aggregation pipelines in MongoDB!
