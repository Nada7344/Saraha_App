# 📨 Saraha — Anonymous Messaging App

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![OAuth2](https://img.shields.io/badge/Google_OAuth2-EB5424?style=flat-square&logo=auth0&logoColor=white)

> A full-scale anonymous messaging backend built from scratch — secure, production-ready, and following industry-standard API design practices.

---

## 📌 Overview

Saraha is a backend system that allows users to send and receive **anonymous messages**. It supports full user authentication, profile management, and automated email flows — all built with security and scalability in mind.

---

## ✨ Features

- 🔐 **Authentication** — Register, login, logout with JWT-based session management
- 🌐 **Google OAuth2** — Sign in with Google
- ✉️ **Email Flows** — OTP verification on signup & password reset via Nodemailer
- 🔄 **Refresh Tokens** — Secure token rotation for persistent sessions
- 🛡️ **Role-Based Authorization (RBAC)** — Protected routes based on user roles
- 📁 **File Uploads** — Profile picture uploads via Multer
- ✅ **Input Validation** — Request validation using Joi
- 💬 **Anonymous Messaging** — Send/receive messages without revealing identity
- ⚙️ **API Security** — Helmet, rate limiting, and third-party security middleware

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT, Refresh Tokens, Google OAuth2 |
| Email | Nodemailer |
| Validation | Joi |
| File Upload | Multer |
| Security | Bcrypt, Helmet |
| Architecture | MVC |

---

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.router.js
│   │   └── auth.service.js
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.router.js
│   │   └── user.service.js
│   └── message/
│       ├── message.controller.js
│       ├── message.router.js
│       └── message.service.js
├── middlewares/
├── utils/
├── config/
└── app.js
```

---

## 🔗 API Endpoints

### 🔑 Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user + send OTP email |
| POST | `/auth/login` | Login with email & password |
| POST | `/auth/google` | Login with Google OAuth2 |
| POST | `/auth/verify-email` | Verify account via OTP |
| POST | `/auth/forget-password` | Send password reset email |
| POST | `/auth/reset-password` | Reset password with OTP |
| POST | `/auth/logout` | Logout & invalidate token |

### 👤 User
| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/profile` | Get current user profile |
| PUT | `/user/profile` | Update profile info |
| PUT | `/user/profile/picture` | Upload profile picture |
| DELETE | `/user/account` | Delete account |

### 💬 Messages
| Method | Endpoint | Description |
|---|---|---|
| POST | `/message/:userId` | Send anonymous message to user |
| GET | `/message/inbox` | Get all received messages |
| DELETE | `/message/:messageId` | Delete a message |

---



## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nada7344/Saraha_App.git
cd Saraha_App

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Start the server
npm run dev
```

Server runs on `http://localhost:3000`

---

## 🔒 Security Practices

- Passwords hashed with **Bcrypt**
- Tokens stored securely with expiry
- Input sanitized and validated with **Joi**
- Protected routes with **JWT middleware**
- Rate limiting to prevent brute-force attacks

---

## 👩‍💻 Author

**Nada Mahmoud** — Backend Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nada-mahmoud-80a966287)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Nada7344)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:nadamahmoud7344@gmail.com)
