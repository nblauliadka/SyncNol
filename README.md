<div align="center">
  <h1>SyncNol: Zero to Hero</h1>
  <p><b>Asisten finansial digital dan akademi literasi</b> yang dirancang khusus untuk <b>Gen Z</b>, <b>Mahasiswa</b>, dan <b>Hustler</b> untuk mengatur aset dari nol sampai jadi <i>hero</i>.</p>

[![Interactive Preview](https://img.shields.io/badge/Interactive_Preview-Click_Here-0A6C75?style=for-the-badge&logo=netlify&logoColor=white)](https://syncnol.netlify.app/)
  [![React](https://img.shields.io/badge/React_19-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
</div>

<br>

## ✨ What is SyncNol?

SyncNol adalah aplikasi *full-stack web* yang dirancang khusus untuk memecahkan masalah manajemen keuangan yang tidak terstruktur. Menggabungkan pencatatan finansial dengan *gamification* ala RPG, platform ini membuat proses belajar literasi keuangan dan menabung menjadi lebih interaktif dan menyenangkan.

| Core Features | Description | 
| ----- | ----- | 
| 🎯 **The Vision Planner** | Pelacak target impian dengan sistem kalkulasi otomatis untuk memastikan target finansial tercapai. | 
| 🛡️ **The Vault** | Brankas digital untuk melacak total aset dan mencatat pengeluaran dengan aman, terenkripsi, dan terpusat. | 
| 🎓 **SyncNol Academy** | Modul pembelajaran literasi finansial dari *Zero to Hero* yang terintegrasi langsung dengan sistem XP & Leveling. | 

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
```

---

##  Getting Started (Local Development)

Untuk menjalankan *project* ini di mesin lokal, pastikan Anda sudah menginstal **Node.js (v18+)** dan **Python (v3.10+)**. Ikuti langkah-langkah di bawah ini:

### 1. Clone the Repository
```bash
git clone [https://github.com/nblauliadka/SyncNol.git](https://github.com/nblauliadka/SyncNol.git)
cd SyncNol
```

### 2. Backend Setup (FastAPI)
Buka terminal dan arahkan ke direktori backend. Gunakan *virtual environment* agar *dependencies* terisolasi dan tidak berantakan.

```bash
cd backend

# Buat virtual environment
python -m venv venv

# Aktivasi virtual environment
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Install semua dependencies
pip install -r requirements.txt

# Jalankan server
uvicorn main:app --reload --port 8000
```
> **Note:** API otomatis berjalan di `http://localhost:8000`. Cek dokumentasi interaktifnya di `http://localhost:8000/docs`.

### 3. Frontend Setup (React/Vite)
Buka tab terminal baru, lalu arahkan ke direktori frontend.

```bash
cd frontend

# Install dependencies Node.js
npm install

# Jalankan development server
npm run dev
```
> **Note:** Frontend akan berjalan di `http://localhost:5173`.

---

## 🔑 Environment Variables

Agar fitur *Auth* dan *Database* dapat berjalan, Anda membutuhkan kredensial dari Supabase. Buat file `.env` di dua lokasi berikut:

**1. Di folder `frontend/.env`:**
```env
VITE_SUPABASE_URL=https://<PROJECT-REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
VITE_API_BASE_URL=http://localhost:8000
```

**2. Di folder `backend/.env`:**
```env
SUPABASE_URL=https://<PROJECT-REF>.supabase.co
SUPABASE_SERVICE_KEY=<YOUR-SERVICE-ROLE-KEY>
```

## 🤝 Contributing

Jika Anda menemukan *bug* atau ingin menambahkan fitur baru, silakan buat *Pull Request*:

1. **Fork** *repository* ini.
2. Buat *branch* fitur Anda (`git checkout -b feature/FiturKeren`).
3. *Commit* perubahan Anda (`git commit -m 'feat: nambahin FiturKeren'`).
4. *Push* ke *branch* (`git push origin feature/FiturKeren`).
5. Buka **Pull Request!**
```
