@echo off
REM Restore MongoDB dari backup dengan timestamp

REM Pindah ke direktori MongoDB Tools
cd "C:\Program Files\MongoDB\Tools\100\bin"

REM Direktori backup
set backupDir=D:\mongodb-backuprv

REM Periksa apakah direktori backup ada
if not exist "%backupDir%" (
    echo Direktori backup tidak ditemukan: %backupDir%
    pause
    exit /b 1
)

REM Dapatkan daftar folder backup (timestamp)
echo Daftar folder backup yang tersedia:
for /d %%i in ("%backupDir%\*") do (
    echo %%~ni
)

REM Masukkan nama folder backup yang ingin direstore
set /p selectedBackup=Masukkan nama folder backup (contoh: 2023-10-30): 

REM Periksa apakah folder backup yang dipilih ada
if not exist "%backupDir%\%selectedBackup%" (
    echo Folder backup tidak ditemukan: %backupDir%\%selectedBackup%
    pause
    exit /b 1
)

REM Jalankan mongorestore
echo Memulai proses restore dari folder: %backupDir%\%selectedBackup%
mongorestore --db=lionb "%backupDir%\%selectedBackup%\liond"

REM Pesan berhasil
echo Restore completed successfully!
pause