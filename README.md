<div align="center">
  <h1>SyncNol: Zero to Hero</h1>
  <p><b>A digital financial assistant and literacy academy</b> specifically designed for <b>Gen Z</b>, <b>Students</b>, and <b>Hustlers</b> to manage assets from zero to hero.</p>

  [![Interactive Preview](https://img.shields.io/badge/Interactive_Preview-Click_Here-0A6C75?style=for-the-badge&logo=netlify&logoColor=white)](https://syncnol.netlify.app/)
  [![React](https://img.shields.io/badge/React_19-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
</div>

<br>

## ✨ What is SyncNol?

SyncNol is a full-stack web application tailored to solve unstructured financial management. By combining financial tracking with RPG-style gamification, this platform makes learning financial literacy and saving more interactive and engaging.

| Core Features | Description | 
| ----- | ----- | 
| 🎯 **The Vision Planner** | Dream target tracker with an automated calculation system to ensure your financial goals are met. | 
| 🛡️ **The Vault** | A digital safe to track total assets and record expenses securely, centralized, and encrypted. | 
| 🎓 **SyncNol Academy** | Financial literacy learning modules from *Zero to Hero*, seamlessly integrated with an XP & Leveling system. | 

---

## 🛠 Tech Stack

| Layer | Technology | 
| ----- | ----- | 
| **Frontend** | React 19 + Vite 8 | 
| **Styling** | Tailwind CSS v4 (Dark Mode Optimized) | 
| **Backend API** | Python / FastAPI | 
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security) | 
| **State/Routing** | Context API / React Router DOM | 
| **AI & Vector DB** | Custom AI Engine + ChromaDB |

---

## 📁 Project Structure

```text
syncnol/
├── ai_engine/            ← AI logic & processing
├── backend/              ← FastAPI backend (port 8000)
│   ├── main.py           ← Entry point & server config
│   ├── core/             ← Security, CORS, & Supabase client
│   ├── api/              ← Routers & API endpoints
│   └── requirements.txt  ← Python dependencies
├── chroma_db/            ← Vector database storage
├── docs/                 ← Project documentation & planning
├── frontend/             ← React/Vite client (port 5173)
│   ├── src/
│   │   ├── pages/        ← Dashboard, Vault, Academy UI
│   │   ├── components/   ← Reusable UI (Charts, Modals, Cards)
│   │   └── utils/        ← Axios instances & API helpers
│   └── vite.config.js    ← Vite config
└── README.md
