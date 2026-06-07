# Todo Desktop Application

> A Complete Desktop Task Management System Built with Electron, Vue.js, Node.js, Express, and MySQL

<div align="center">

![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

</div>

---

## Overview

Todo Desktop Application (TDA) သည် သုံးစွဲသူများအတွက် Task Management ကို အဆင်ပြေချောမွေ့စေရန် Desktop Application အနေဖြင့် တည်ဆောက်ထားသော စနစ်ဖြစ်ပါတယ်။

သုံးစွဲသူများသည် User Registration ပြုလုပ်ပြီး Login ဝင်ရောက်ကာ မိမိတို့၏ Tasks များကို Create, Read, Update, Delete (CRUD) ပြုလုပ်နိုင်ပါတယ်။

Admin သုံးစွဲသူများသည် User Management, All Tasks Viewing, System Statistics များကို ကြည့်ရှုနိုင်ပြီး Role-Based Access Control ဖြင့် စနစ်အား စီမံခန့်ခွဲနိုင်ပါတယ်။

---

## Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Authentication | User registration and login with JWT | ✅ Complete |
| Task Management | Create, Read, Update, Delete tasks | ✅ Complete |
| Categories | Organize tasks with custom categories | ✅ Complete |
| Priority Levels | High, Medium, Low priority | ✅ Complete |
| Due Dates | Set and track task deadlines | ✅ Complete |
| Search & Filter | Find tasks by title, priority, status | ✅ Complete |
| Reports | Statistics and analytics dashboard | ✅ Complete |
| Dark Mode | Toggle between light/dark themes | ✅ Complete |
| Admin Panel | User management and system overview | ✅ Complete |

### User Roles

| Role | Permissions |
|------|-------------|
| **User** | Create/manage own tasks, categories, view reports |
| **Admin** | Manage all users, view all tasks, system statistics |

---

## System Workflow

### 1. User Authentication
- User opens the Electron Desktop Application
- New users click Register and create an account
- Existing users Login with email and password
- JWT Token is generated and stored
- User is redirected to Dashboard

### 2. Dashboard
- View task statistics (Total, Completed, Pending, Completion Rate)
- See recent tasks (last 5 created tasks)
- Quick action buttons for common tasks
- Welcome message with user's name

### 3. Task Management
- **Create Task** - Add new task with title, description, due date, priority, status, category
- **Read Tasks** - View all tasks in organized list
- **Update Task** - Edit task details or change status
- **Delete Task** - Remove unwanted tasks
- **Search Tasks** - Search by title
- **Filter Tasks** - Filter by priority or status
- **Sort Tasks** - Sort by due date, priority, or created date

### 4. Category Management
- **Create Category** - Add custom categories
- **Read Categories** - View all user categories
- **Delete Category** - Remove personal categories

### 5. Reports & Analytics
- Task Statistics - Total tasks, completion rate, overdue tasks
- Priority Distribution - High/Medium/Low task breakdown
- Status Distribution - Pending/In Progress/Completed tasks
- Weekly Activity - Tasks created per day of week
- Export Report - Download report as JSON file

### 6. Dark Mode
- Toggle between Light and Dark themes
- Theme preference saved in localStorage

### 7. Admin Functions
- View All Users - List all registered users
- Change User Roles - Promote users to admin or demote to user
- Delete Users - Remove users from system
- View All Tasks - See tasks from all users
- System Statistics - Overview of entire system

---

## Technologies Used

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.3.4 | Frontend Framework |
| Vue Router | 4.2.4 | Routing Management |
| Pinia | 2.1.6 | State Management |
| Axios | 1.5.0 | HTTP Client |
| Vite | 4.4.9 | Build Tool |
| Vue Toastification | 2.0.0 | Toast Notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x+ | Runtime Environment |
| Express.js | 4.18.2 | Web Framework |
| MySQL2 | 3.6.0 | Database Driver |
| JSON Web Token | 9.0.1 | Authentication |
| Bcryptjs | 2.4.3 | Password Hashing |

### Desktop Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| Electron | 26.2.0 | Desktop Framework |
| Electron Builder | 24.6.4 | Installer Builder |

---

## Installation Guide

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18.x or higher |
| XAMPP | 8.x or higher |
| Git | Latest |

### Step 1: Clone Repository

```bash
git clone https://github.com/MinNyiThatTant/todo-app.git
cd todo-app
```

### Step 2: Setup Database
```bash
Open XAMPP Control Panel, start apache and mysql
```

### install dependencies and run command (backend, electron)
```bash
npm install
npm run dev
npm run electron:dev
```