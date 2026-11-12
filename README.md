# 🚀 JobMate AI – AI-Powered Career Development Platform

**JobMate AI** is a full-stack AI-powered career development platform designed to help job seekers improve their career opportunities through intelligent tools, personalized recommendations, and career guidance.

The platform brings multiple career-related services together, helping users analyze resumes, explore job opportunities, practice interviews, identify skill gaps, and plan their professional growth.

---

## ✨ Key Features

### 👤 User Features

- **User Authentication:** Secure registration and login system.
- **User Dashboard:** Manage career activities from one place.
- **Resume Analyzer:** Analyze resumes and identify areas for improvement.
- **Job Recommendations:** Explore relevant job opportunities.
- **Saved Jobs:** Save and manage interesting job opportunities.
- **Interview Practice:** Practice interview questions.
- **Interview History:** Track previous interview attempts.
- **Career Roadmap:** Get personalized career development guidance.
- **AI Project Generator:** Generate project ideas to improve technical skills.
- **Profile Management:** Manage personal profile information.
- **Applications:** Track job application activities.

### 🛡️ Admin Features

- Admin panel for managing platform activities.
- Role-based access and protected routes.

---

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- React Router DOM

### Backend
- Python
- Flask
- Flask-CORS
- Flask-JWT-Extended
- REST API

### Database
- MySQL
- MySQL Connector

### AI & Document Processing
- Google GenAI
- PyPDF
- Python-Docx

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman
- MySQL Workbench

---

## 📂 Project Structure

```text
JobMet-AI/
│
├── Backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── Pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

*Note: `.env.example` is a suggested template file. Create it if it does not already exist. Never upload your actual `.env` file.*

---

## ⚙️ Installation & Setup

Follow these steps to run JobMate AI on your local machine.

### 1. Prerequisites

Make sure you have installed:

- Python
- Node.js and npm
- MySQL Server
- MySQL Workbench (optional)
- Git

### 2. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/sunnyghodke9299-dev/JobMet-AI.git
```

Navigate to the project directory:

```bash
cd JobMet-AI
```

### 3. Frontend Setup

Navigate to the Frontend folder:

```bash
cd Frontend
```

Install the required packages:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173/
```

### 4. Backend Setup

Open a new terminal from the project root directory.

Navigate to Backend:

```bash
cd Backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask backend:

```bash
python app.py
```

The backend runs on:

```text
http://127.0.0.1:5000/
```

### 5. Database Configuration

1. Start MySQL Server.
2. Create the database required by the application.
3. Configure the MySQL connection settings in the backend.
4. Ensure the database credentials are valid.
5. Keep database passwords and other secrets outside publicly shared source code.

The database used by the current project is:

```sql
CREATE DATABASE jobmate_ai;
```

---

## 🔐 Security

- Do not upload `.env` files to GitHub.
- Never expose database passwords or API keys.
- Use environment variables for sensitive configuration.
- Use a strong JWT secret.
- Avoid using the MySQL root account for production applications.

---

## 🎯 Project Goal

The main goal of JobMate AI is to simplify the job search and career development process by combining modern web technologies with AI-powered career assistance.

It aims to provide job seekers with useful tools for resume improvement, interview preparation, job discovery, and personalized career planning.

---

## 🔮 Future Enhancements

- Advanced AI-based resume scoring.
- Intelligent job matching using skills and experience.
- Personalized skill gap analysis.
- AI-powered mock interview evaluation.
- Personalized career recommendations.
- Improved analytics and progress tracking.
- Deployment with cloud infrastructure.

---

## 👨‍💻 Developer

**Sunny Ramesh Ghodke**

Python Developer | React.js | MySQL | Full Stack Web Development

- GitHub: https://github.com/sunnyghodke9299-dev
- Location: Pune, Maharashtra, India

---

## ⭐ Support

If you find this project interesting, consider giving the repository a star on GitHub!

**Built with ❤️ using React, Python, MySQL, and AI.**
