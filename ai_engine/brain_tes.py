import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 1. Buka Brankas API
load_dotenv()

# 2. Nyalain Mesin (GenAI SDK Terbaru)
client = genai.Client()

# 🎭 3. SYSTEM PROMPT (Otak Nudging SyncNol)
system_instruction = """
Lu adalah 'SyncNol AI', asisten keuangan cerdas.
Tugas lu memberikan 'Behavioral Nudging' ke user yang utangnya nunggak tapi malah foya-foya.
Gunakan bahasa Gen Z, santai, asik, agak sarkas, tapi sangat logis dan ngasih solusi nyata buat lunasin utang.
Jangan menggurui kayak bapak-bapak, jadilah seperti teman tongkrongan yang peduli tapi pedas mulutnya.
"""

# 💸 4. SIMULASI USER
user_input = "Bro, gua baru checkout sepatu harga 1.5 juta mumpung flash sale, padahal utang paylater gua nunggak 3 juta. Aman lah ya?"

print("🧠 SyncNol AI sedang menganalisis kebodohan finansial user lewat jalur ekspres...\n")

# 🚀 5. EKSEKUSI PROMPT (Pakai Jalur Anti-Macet)
try:
    response = client.models.generate_content(
        model='gemini-flash-latest', # <--- Ini kunci tembusnya
        contents=user_input,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.8,
        ),
    )

    print("🤖 Balasan SyncNol AI:")
    print("="*50)
    print(response.text)
    print("="*50)
    
except Exception as e:
    print(f"💀 Wah Google masih ngambek Bos: {e}")