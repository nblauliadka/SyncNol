from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# 1. TABEL PROFIL USER (Udah di-upgrade buat nyimpen hasil AI Interview)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    
    # Hasil Profiling AI
    pekerjaan = Column(String, nullable=True) # Misal: Mahasiswa, Freelancer
    tujuan_keuangan = Column(String, nullable=True) # Misal: Lunasin Pinjol, Beli Laptop
    pendapatan_bulanan = Column(Float, nullable=True)
    
    # Relasi ke tabel lain
    debts = relationship("Debt", back_populates="owner")
    transactions = relationship("Transaction", back_populates="owner")

# 2. TABEL UTANG (Bukan cuma Pinjol lagi, bisa Utang Temen/Warung)
class Debt(Base):
    __tablename__ = "debts"
    id = Column(Integer, primary_key=True, index=True)
    nama_kreditur = Column(String) # Misal: SPayLater, Budi, Ibu Kos
    jenis_utang = Column(String) # Misal: Pinjol, Personal, Bank
    total_utang = Column(Float)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="debts")

# 3. TABEL TRANSAKSI (Fitur Baru: Pencatat Keuangan All-Round)
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    jenis_transaksi = Column(String) # 'Pemasukan' atau 'Pengeluaran'
    kategori = Column(String) # Misal: Gaji, Makan, Transport, Nabung
    nominal = Column(Float)
    tanggal = Column(DateTime, default=datetime.utcnow)
    keterangan = Column(String, nullable=True) # Misal: "Makan di warkop", "Bayar SPP"
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="transactions")