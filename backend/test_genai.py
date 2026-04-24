import os
import base64
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
client = genai.Client()

img_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xfc\xff\xff\x9f\x00\x05\xfe\x02\xfe\xa4\xce\x92\x02\x00\x00\x00\x00IEND\xaeB`\x82'
contents = ["What is this?", types.Part.from_bytes(data=img_data, mime_type="image/png")]

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", str(e))
