@echo off
REM Backup MongoDB dengan timestamp

REM Buat direktori backup jika belum ada
if not exist "E:\mongodb-backup" (
    mkdir "E:\mongodb-backup"
)

REM Backup MongoDB dengan timestamp
set timestamp=%date:~10,4%-%date:~4,2%-%date:~7,2%
mongodump --db=lionp --out="E:\mongodb-backup\%timestamp%"

REM Pesan berhasil
echo Backup completed successfully!
pause