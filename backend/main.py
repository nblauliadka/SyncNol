import base64
import os
import time
import json
from typing import Optional
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
import chromadb
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from database import engine, Base, SessionLocal
import models

# ==========================================
# 1. INISIALISASI & SETUP
# ==========================================

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SyncNol AI Core", description="API Asisten Keuangan All-Round + RAG POJK")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # <--- GANTI JADI BINTANG INI BOS!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
client = genai.Client()

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="hukum_ojk_asli")

# ==========================================
# 2. STARTUP EVENT (CHROMA DB)
# ==========================================
@app.on_event("startup")
def startup_event():
    if collection.count() > 0:
        print(f"✅ Otak AI udah hafal {collection.count()} pasal OJK! Nggak perlu baca PDF lagi.")
        return

    print("🚀 [PRODUCTION MODE] Membaca Dokumen PDF POJK Asli...")
    try:
        loader = PyPDFLoader("../docs/pojk_asli.pdf")
        dokumen_mentah = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(dokumen_mentah)
        
        print(f"📚 Memasukkan {len(chunks)} bagian ke otak. Santai dikit biar Google nggak tilang...")

        for i, chunk in enumerate(chunks):
            isi_teks = chunk.page_content
            vektor = client.models.embed_content(
                model='gemini-embedding-2-preview',
                contents=isi_teks
            ).embeddings[0].values
            
            collection.add(
                embeddings=[vektor],
                documents=[isi_teks],
                ids=[f"pasal_asli_{i}"]
            )
            time.sleep(1.2) 

        print("✅ Hukum OJK Asli 100% terserap PERMANEN! Server SIAP TEMPUR.")
    except Exception as e:
        print(f"💀 GAGAL BACA PDF: {e}")

# ==========================================
# 3. KUNCI DATABASE & CETAKAN DATA (PYDANTIC)
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class NudgeRequest(BaseModel):
    user_id: int
    pesan_user: str

class SyncUserRequest(BaseModel):
    email: str
    nama: str

class OnboardingRequest(BaseModel):
    nama: Optional[str] = None
    pekerjaan: Optional[str] = None
    tujuan_keuangan: Optional[str] = None
    pendapatan_bulanan: Optional[float] = None

class UserCreate(BaseModel):
    nama: str
    email: str
    pekerjaan: Optional[str] = None
    tujuan_keuangan: Optional[str] = None
    pendapatan_bulanan: Optional[float] = None

class DebtCreate(BaseModel):
    nama_kreditur: str
    jenis_utang: str
    total_utang: float
    user_id: int

class TransactionCreate(BaseModel):
    jenis_transaksi: str
    kategori: str
    nominal: float
    keterangan: Optional[str] = None
    user_id: int

class ChatRequest(BaseModel):
    message: str
    image: Optional[str] = None

# ==========================================
# 4. ENDPOINT AI (AGENTIC AUTO-JOURNALING)
# ==========================================
@app.post("/api/chat")
def chat_with_jarvis(req: ChatRequest):
    try:
        contents = [req.message]
        if req.image:
            import base64
            if "," in req.image:
                mime_type = req.image.split(";")[0].split(":")[1]
                img_base64 = req.image.split(",")[1]
            else:
                mime_type = "image/jpeg"
                img_base64 = req.image
            
            img_bytes = base64.b64decode(img_base64)
            contents.append(
                types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
            )

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction="You are J.A.R.V.I.S, a sarcastic, highly intelligent financial assistant. If the user provides a receipt image, analyze the receipt and reply with the extracted total amount and items.",
                temperature=0.7,
            ),
        )
        return {"status": "success", "response": response.text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "response": f"System error: {str(e)}"}

@app.post("/api/nudge")
def generate_nudge(req: NudgeRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        return {"status": "error", "pesan": "User nggak terdaftar di brankas!"}
    
    if user.debts:
        list_utang = ", ".join([f"{d.nama_kreditur} [{d.jenis_utang}] (Rp {d.total_utang:,.0f})" for d in user.debts])
    else:
        list_utang = "Belum ada utang (Aman)."

    # RAG: Cari pasal OJK
    vektor_user = client.models.embed_content(
        model='gemini-embedding-2-preview',
        contents=req.pesan_user
    ).embeddings[0].values

    hasil = collection.query(query_embeddings=[vektor_user], n_results=1)
    konteks_hukum = hasil['documents'][0][0] if hasil['documents'] else "Tidak ada referensi."

    # C. SYSTEM PROMPT PROFESIONAL
    system_prompt = f"""
    Lu adalah 'SyncNol AI', asisten keuangan cerdas kelas atas.
    User lu bernama {user.nama}. 
    Pekerjaan dia: {user.pekerjaan or 'Belum diset'}. 
    Tujuan dia: {user.tujuan_keuangan or 'Belum diset'}.
    Data utang (kewajiban) dia saat ini: {list_utang}.
    
    FAKTA HUKUM OJK:
    {konteks_hukum}
    
    TUGAS LU:
    1. Analisis pesan user. Apakah dia menyebutkan pengeluaran atau pemasukan uang?
    2. Berikan respons analitis, profesional, tapi tetap asik dan suportif (maksimal 3 kalimat).
    3. JANGAN GUNAKAN FORMAT MARKDOWN SEPERTI BINTANG (*) ATAU BOLD (**). Gunakan teks biasa.
    4. LU WAJIB MEMBALAS HANYA DALAM FORMAT JSON SEPERTI INI:
    {{
        "ai_roast": "Balasan profesional lu di sini",
        "ada_transaksi": true/false,
        "jenis_transaksi": "Pengeluaran" atau "Pemasukan" atau null,
        "kategori": "Lifestyle", "Makan", "Transport", "Gaji", atau null,
        "nominal": 50000 (berupa angka tanpa titik) atau 0,
        "keterangan": "Beli kopi" atau null
    }}
    """

    pesan_balasan = ""

    # KITA PINDAHIN MESIN GEMINI KE DALAM TRY-EXCEPT!
    try:
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=req.pesan_user,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )

        # Parsing jawaban JSON dari AI
        ai_data = json.loads(response.text)
        pesan_balasan = ai_data.get("ai_roast", "Mohon maaf, sistem sedang memproses data.")
        
        # JIKA AI MENDETEKSI TRANSAKSI, OTOMATIS CATAT KE DATABASE!
        if ai_data.get("ada_transaksi") and ai_data.get("nominal") > 0:
            db_trx = models.Transaction(
                jenis_transaksi=ai_data.get("jenis_transaksi"),
                kategori=ai_data.get("kategori"),
                nominal=ai_data.get("nominal"),
                keterangan=ai_data.get("keterangan"),
                user_id=user.id
            )
            db.add(db_trx)
            db.commit()
            
            # FORMAT LOG PROFESIONAL
            pesan_balasan += f"\n\n[SYSTEM LOG]: Transaksi {ai_data.get('jenis_transaksi')} sebesar Rp {ai_data.get('nominal'):,.0f} berhasil dicatat ke dalam jurnal."

    except Exception as e:
        error_msg = str(e)
        print("Error dari Gemini AI:", error_msg)
        
        # LOGIKA MENGHADAPI LIMIT GOOGLE
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            pesan_balasan = "Mesin AI sedang pendinginan (Rate Limit Google API). Mohon tunggu sekitar 1 menit sebelum mengirim laporan keuangan lagi."
        else:
            pesan_balasan = "Sistem gagal memproses transaksi. Silakan coba lagi."

    return {
        "status": "success",
        "nama_user": user.nama,
        "info_utang": list_utang,
        "ai_roast": pesan_balasan
    }
# ==========================================
# 5. ENDPOINT CRUD DATABASE LAINNYA
# ==========================================
@app.post("/api/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        nama=user.nama, 
        email=user.email,
        pekerjaan=user.pekerjaan,
        tujuan_keuangan=user.tujuan_keuangan
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"status": "success", "pesan": f"User {db_user.nama} berhasil didaftarkan!", "data": db_user}

@app.post("/api/debts")
def create_debt(debt: DebtCreate, db: Session = Depends(get_db)):
    db_debt = models.Debt(
        nama_kreditur=debt.nama_kreditur, 
        jenis_utang=debt.jenis_utang, 
        total_utang=debt.total_utang, 
        user_id=debt.user_id
    )
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return {"status": "success", "pesan": f"Utang ke {db_debt.nama_kreditur} berhasil dicatat.", "data": db_debt}

@app.post("/api/transactions")
def create_transaction(trx: TransactionCreate, db: Session = Depends(get_db)):
    db_trx = models.Transaction(
        jenis_transaksi=trx.jenis_transaksi,
        kategori=trx.kategori,
        nominal=trx.nominal,
        keterangan=trx.keterangan,
        user_id=trx.user_id
    )
    db.add(db_trx)
    db.commit()
    db.refresh(db_trx)
    return {"status": "success", "pesan": f"Transaksi {db_trx.kategori} tercatat!", "data": db_trx}

@app.get("/api/users/{user_id}/debts")
def get_user_debts(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"status": "error", "pesan": "User nggak ketemu Bos!"}
    
    return {"status": "success", "nama_user": user.nama, "daftar_utang": user.debts}

@app.delete("/api/debts/{debt_id}")
def delete_debt(debt_id: int, db: Session = Depends(get_db)):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id).first()
    if not debt:
        return {"status": "error", "pesan": "Utang tidak ditemukan"}
    db.delete(debt)
    db.commit()
    return {"status": "success", "pesan": "Utang berhasil dihapus"}

class DebtUpdate(BaseModel):
    total_utang: float

@app.put("/api/debts/{debt_id}")
def update_debt(debt_id: int, update: DebtUpdate, db: Session = Depends(get_db)):
    debt = db.query(models.Debt).filter(models.Debt.id == debt_id).first()
    if not debt:
        return {"status": "error", "pesan": "Utang tidak ditemukan"}
    debt.total_utang = update.total_utang
    db.commit()
    db.refresh(debt)
    return {"status": "success", "data": debt}

    # --- ENDPOINT 6: DASHBOARD SUMMARY ---
@app.get("/api/users/{user_id}/summary")
def get_financial_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"status": "error", "pesan": "User nggak ketemu!"}
    
    # Kalkulasi Otomatis ala J.A.R.V.I.S
    total_utang = sum(d.total_utang for d in user.debts) if user.debts else 0
    
    # Ambil transaksi dan hitung
    pemasukan = 0
    pengeluaran = 0
    if user.transactions:
        pemasukan = sum(t.nominal for t in user.transactions if t.jenis_transaksi.lower() == "pemasukan")
        pengeluaran = sum(t.nominal for t in user.transactions if t.jenis_transaksi.lower() == "pengeluaran")
    
    # Total Kekayaan Bersih (Net Worth) = Uang Masuk - Uang Keluar - Utang
    net_worth = pemasukan - pengeluaran - total_utang

    return {
        "status": "success",
        "data": {
            "nama": user.nama,
            "net_worth": net_worth,
            "pemasukan": pemasukan,
            "pengeluaran": pengeluaran,
            "total_utang": total_utang,
            "monthly_income": user.pendapatan_bulanan or 0
        }
    }
    # --- ENDPOINT 7: SINKRONISASI SUPABASE KE POSTGRESQL ---
@app.post("/api/sync-user")
def sync_user(req: SyncUserRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    
    if not user:
        user = models.User(
            nama=req.nama,
            email=req.email,
            pekerjaan=None,
            tujuan_keuangan=None,
            pendapatan_bulanan=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[SYSTEM] Brankas baru dibuat untuk: {req.email}")
    else:
        print(f"[SYSTEM] User lama kembali: {req.email}")

    needs_onboarding = user.tujuan_keuangan is None or user.pendapatan_bulanan is None
    return {"status": "success", "user_id": user.id, "nama": user.nama, "needs_onboarding": needs_onboarding}

@app.post("/api/users/{user_id}/onboarding")
def complete_onboarding(user_id: int, req: OnboardingRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"status": "error", "pesan": "User tidak ditemukan"}
    
    if req.nama: user.nama = req.nama
    if req.pekerjaan: user.pekerjaan = req.pekerjaan
    if req.tujuan_keuangan: user.tujuan_keuangan = req.tujuan_keuangan
    if req.pendapatan_bulanan is not None: user.pendapatan_bulanan = req.pendapatan_bulanan
    
    # Otomatis catat sebagai pemasukan awal jika ada pendapatan bulanan dan belum ada transaksi
    if req.pendapatan_bulanan and req.pendapatan_bulanan > 0:
        existing_trx = db.query(models.Transaction).filter(models.Transaction.user_id == user_id).first()
        if not existing_trx:
            db_trx = models.Transaction(
                jenis_transaksi="Pemasukan",
                kategori="Pendapatan Awal",
                nominal=req.pendapatan_bulanan,
                keterangan="Pendapatan bulanan dari Onboarding",
                user_id=user.id
            )
            db.add(db_trx)
            
    db.commit()
    db.refresh(user)
    return {"status": "success", "pesan": "Onboarding selesai", "data": {"nama": user.nama, "tujuan_keuangan": user.tujuan_keuangan}}

    # --- ENDPOINT 8: TARIK HISTORY TRANSAKSI UNTUK DASHBOARD ---
@app.get("/api/users/{user_id}/transactions")
def get_transactions(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"status": "error", "pesan": "User tidak ditemukan"}

    # Tarik 5 transaksi terakhir dari yang paling baru
    recent_trx = db.query(models.Transaction)\
        .filter(models.Transaction.user_id == user_id)\
        .order_by(models.Transaction.id.desc())\
        .limit(5).all()

    list_trx = []
    for t in recent_trx:
        list_trx.append({
            "id": t.id,
            "jenis": t.jenis_transaksi, # "Pemasukan" atau "Pengeluaran"
            "kategori": t.kategori,
            "nominal": t.nominal,
            "keterangan": t.keterangan
        })

    return {
        "status": "success",
        "data": list_trx
    }

    # --- ENDPOINT 9: HAPUS TRANSAKSI (FITUR UNDO) ---
@app.delete("/api/transactions/{trx_id}")
def delete_transaction(trx_id: int, db: Session = Depends(get_db)):
    # Cari transaksinya berdasarkan ID
    trx = db.query(models.Transaction).filter(models.Transaction.id == trx_id).first()
    
    if not trx:
        return {"status": "error", "pesan": "Transaksi tidak ditemukan di brankas!"}
    
    # Eksekusi mati transaksinya
    db.delete(trx)
    db.commit()
    
    return {"status": "success", "pesan": f"Transaksi {trx_id} berhasil dihapus"}

    import base64
from pydantic import BaseModel
from typing import Optional

# 1. Bikin keranjang buat nangkep pesan & foto dari Frontend
class ChatRequest(BaseModel):
    message: str
    image: Optional[str] = None

# 2. Mesin Utama J.A.R.V.I.S
@app.post("/api/chat")
async def chat_with_jarvis(req: ChatRequest):
    try:
        # Otak sarkas J.A.R.V.I.S
        system_prompt = "You are J.A.R.V.I.S, a sarcastic, highly intelligent financial assistant."
        
        # Siapin bahan obrolan
        contents = [system_prompt, req.message]
        
        # Kalau user ngirim foto struk (OCR)
        if req.image:
            # Bersihin header Base64 dari React kalau ada
            base64_data = req.image
            if "," in req.image:
                base64_data = req.image.split(",")[1]
            
            # Ubah teks Base64 jadi gambar beneran
            image_bytes = base64.b64decode(base64_data)
            
            # Masukin gambar ke otak Gemini
            contents.append(
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
            )

        # Gas panggil Google!
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents
        )
        return {"status": "success", "response": response.text}
        
    except Exception as e:
        return {"status": "error", "response": str(e)}