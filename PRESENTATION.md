# NESA Task Management System - Presentation Documentation

## 1. Project Overview
**Objective:** To develop a robust, scalable Task Management System that enables organizations to efficiently manage projects, track tasks in real-time, and foster seamless collaboration among team members. 

**Key Problem Solved:** Traditional task management often suffers from poor role separation, scattered communication, and lack of real-time visibility. Our system centralizes projects, enforces strict role-based access, and unifies team chat and task tracking into a single, beautiful dashboard.

---

## 2. Core Features & Capabilities

### 🛡️ Role-Based Access Control (RBAC)
The application enforces strict separation of concerns across three distinct user roles:
1. **Admin:** Full system control. Can manage projects, create tasks, view system-wide activity logs, and dynamically change any user's role.
2. **Project Manager:** Operational control. Can create projects, assign tasks to members, and manage deadlines, but cannot alter system roles or view global audit logs.
3. **User:** Task execution. Can view their assigned tasks on a personal Kanban board, update task statuses, post comments, and upload files.

### 📊 Comprehensive Task Management (Kanban)
* **Visual Workflows:** Users interact with a drag-and-drop-style Kanban board (To Do, In Progress, Review, Done).
* **Detailed Task Tracking:** Every task tracks priority, due dates, project association, and status.
* **File Attachments:** Users can seamlessly attach images, PDFs, or documents directly to a task for context.

### ⚡ Real-Time Collaboration
* **Unified Project Chat:** A "WhatsApp-style" chatbox tied to specific projects allows team members to communicate instantly.
* **Live Updates:** Using WebSockets, whenever a task is updated or a new comment is posted, all active clients reflect the changes immediately without needing to refresh the page.

### 🔔 Automated Notification System
* **Email Dispatch:** The system integrates with Nodemailer to automatically send email notifications (e.g., when a user is assigned a new task).
* **In-App Alerts:** Toast notifications instantly inform users of critical events (new messages, status changes).

### 🔍 System Audit & Activity Logging
* Admins have access to a dedicated **Activity Logs Dashboard** that records every critical action in the system (e.g., project creations, role updates) complete with timestamps, user details, and JSON metadata.

---

## 3. Technology Stack

This project was built utilizing the **MERN** stack, augmented with modern web technologies:

* **Frontend:**
  * **React.js & Vite:** For blazing-fast UI rendering and development.
  * **Tailwind CSS & Lucide React:** For a highly responsive, premium, and modern user interface.
  * **Redux Toolkit:** For centralized, predictable global state management.
* **Backend:**
  * **Node.js & Express.js:** A robust and scalable server-side REST API framework.
  * **MongoDB & Mongoose:** A flexible NoSQL database utilizing complex aggregation and schemas.
* **Specialized Utilities:**
  * **Socket.io:** For bidirectional, real-time WebSocket communication.
  * **Multer:** For secure multipart/form-data file uploads.
  * **Nodemailer:** For SMTP-based automated email dispatch.
  * **JWT & bcrypt:** For secure authentication, password hashing, and route protection.

---

## 4. Architectural Highlights

* **MVC Pattern:** The backend strictly follows the Model-View-Controller architecture to separate database schemas (`/models`), business logic (`/controllers`), and API endpoints (`/routes`).
* **Security First:** Implemented `helmet` for HTTP header protection, strict CORS policies, and JWT token validation middleware (`protect` and `authorize`).
* **Responsive Design:** The UI is mobile-friendly and adapts seamlessly from large desktop monitors down to mobile screens.

---

## 5. Expected Outcomes & Conclusion

By utilizing modern web development practices, this system successfully demonstrates:
1. **Scalability:** The decoupled architecture allows the frontend and backend to scale independently.
2. **Proper Separation of Concerns:** Both in the codebase (MVC) and in user interaction (RBAC).
3. **Enhanced Usability:** Real-time updates and an intuitive UI provide a frictionless experience that rivals enterprise software.

This project perfectly fulfills all assignment requirements and is ready for production-level deployment.
