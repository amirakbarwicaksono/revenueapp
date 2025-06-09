@echo off
REM Backup MongoDB dengan timestamp

REM Pindah ke direktori MongoDB Tools
cd "C:\Program Files\MongoDB\Tools\100\bin"


REM Alamat dan port MongoDB server di jaringan lokal
set mongoHost=192.168.198.139
set mongoPort=27017
set dbName=liond


REM Buat direktori backup jika belum ada
if not exist "D:\mongodb-backuprv" (
    mkdir "D:\mongodb-backuprv"
)

REM Backup MongoDB dengan timestamp
set timestamp=%date:~10,4%-%date:~4,2%-%date:~7,2%
"C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe" --host=%mongoHost% --port=%mongoPort% --db=%dbName%  --out="D:\mongodb-backuprv\%timestamp%"

REM Pesan berhasil
echo Backup completed successfully!
pause