@echo off
REM Backup MongoDB dengan timestamp

REM Pindah ke direktori MongoDB Tools
cd "C:\Program Files\MongoDB\Tools\100\bin"

REM Buat direktori backup jika belum ada
if not exist "D:\mongodb-backuprv" (
    mkdir "D:\mongodb-backuprv"
)

REM Backup MongoDB dengan timestamp
set timestamp=%date:~10,4%-%date:~4,2%-%date:~7,2%
mongodump --db=liond --out="D:\mongodb-backuprv\%timestamp%"

REM Pesan berhasil
echo Backup completed successfully!
pause