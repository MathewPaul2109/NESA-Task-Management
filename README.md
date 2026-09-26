## 🚀 Getting Started
Follow these instructions to set up and run the Nesa Task Management system on your local machine.
### Prerequisites
Before you begin, ensure you have the following installed:
- **[Node.js](https://nodejs.org/)** (v14 or higher)
- **[MongoDB](https://www.mongodb.com/try/download/community)** (Running locally, or a MongoDB Atlas cloud URI)
- **npm** or **yarn** package manager
### Environment Setup
The backend relies on environment variables for sensitive configurations like database connections, JWT secrets, and email credentials. 
1. Navigate to the `backend/` directory.
2. Create a new file named `.env` in the root of the backend folder.
3. Copy the following example configuration into your `.env` file and replace the placeholder values with your actual credentials:
```env
# Server Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nesa-task-system
JWT_SECRET=your_jwt_secret_key_here
# Email Configuration (Nodemailer/SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_smtp_username
SMTP_PASSWORD=your_smtp_password
FROM_NAME="Nesa Task System"
FROM_EMAIL=noreply@nesa.com
Note: If you are testing email functionality locally, services like Mailtrap provide great free SMTP servers for testing without sending actual emails.

Installation & Running Locally
Install Backend Dependencies:

bash
cd backend
npm install
Start the Backend Server:

bash
npm run dev
The server should now be running on http://localhost:5000.

Install Frontend Dependencies: Open a new terminal window/tab:

bash
cd frontend
npm install
Start the Frontend Development Server:

bash
npm run dev
The frontend should now be accessible in your browser (usually http://localhost:5173 or http://localhost:3000).

