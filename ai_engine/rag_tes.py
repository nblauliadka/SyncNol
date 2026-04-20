import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import chromadb

# 1. Buka brankas
load_dotenv()
client = genai.Client()

print("📚 Mengirim AI ke Fakultas Hukum OJK...")

# 2. Baca dokumen hukum secara manual (Native Python)
with open("docs/pojk_dummy.txt", "r") as file:
    teks_hukum = file.read()

# Potong teks sederhana per pasal (split berdasarkan kata 'Pasal')
chunks = [f"Pasal {pasal}" for pasal in teks_hukum.split("Pasal ") if pasal.strip() != ""]

# 3. Setup Database ChromaDB (Lokal & Cepat)
chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="hukum_ojk")

print("🧠 Memproses pasal-pasal menjadi vektor (Embedding)...")

# 4. Jurus Embedding Native Google GenAI
for i, chunk in enumerate(chunks):
    # Panggil model embedding terbaru yang stabil
    vektor = client.models.embed_content(
        model='gemini-embedding-2-preview', # <--- Ganti ini
        contents=chunk
    ).embeddings[0].values
    
    # Masukin ke brankas ChromaDB
    collection.add(
        embeddings=[vektor],
        documents=[chunk],
        ids=[f"pasal_{i}"]
    )

# 💸 SIMULASI USER NGEBLANK
user_input = "Bro, gua telat bayar paylater 40 hari nih. Ngeri didatengin DC yang main pukul. Lagian kalau dibiarin doang emang kenapa sih? Paling cuma ditelponin doang kan?"

print("🔍 Mencari pasal OJK yang relevan dengan curhatan user...")

# 5. Ubah omongan user jadi vektor juga buat dicari kemiripannya
vektor_user = client.models.embed_content(
    model='gemini-embedding-2-preview', # <--- Ganti ini juga
    contents=user_input
).embeddings[0].values

# Cari pasal yang paling nyambung di database
hasil_pencarian = collection.query(
    query_embeddings=[vektor_user],
    n_results=1
)
konteks_hukum = hasil_pencarian['documents'][0][0]

print("⚖️ Pasal ditemukan! Meracik Nudging berdasarkan hukum...\n")

# 6. SYSTEM PROMPT ULTIMATE
system_prompt = f"""
Lu adalah 'SyncNol AI', asisten keuangan cerdas.
Tugas lu negur user yang ngemplang utang pakai gaya Gen Z yang sarkas, asik, tapi logis.
LU WAJIB menggunakan fakta hukum dari dokumen OJK berikut untuk menyadarkan user secara legal:
---
ATURAN OJK:
{konteks_hukum}
---
Jangan copas mentah-mentah pasalnya, bahasakan ulang dengan gaya lu biar user kena mental!
"""

# 7. Eksekusi Nudging
response = client.models.generate_content(
    model='gemini-flash-latest',
    contents=user_input,
    config=types.GenerateContentConfig(
        system_instruction=system_prompt,
        temperature=0.7,
    ),
)

print("🤖 Balasan SyncNol AI (Mode Debt Collector Berlisensi):")
print("="*60)
print(response.text)
print("="*60)