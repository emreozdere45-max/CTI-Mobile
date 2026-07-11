# CTI-Mobile Mobile

Expo/React Native mobil uygulama iskeleti.

## Ne Yapiyor?

Su an ilk ekran olarak login ekranini icerir. Login formu backend'deki su endpointi kullanir:

```text
POST /api/v1/auth/login
```

## Kurulum

Mobile klasorune gec:

```powershell
cd "C:\Users\Lenovo\Documents\Codex\2026-07-07\s-per-bence-art-k-bu\outputs\CTI-Mobile\mobile"
```

Paketleri kur:

```powershell
npm install
```

Uygulamayi baslat:

```powershell
npm run start
```

## Backend Adresi

Varsayilan API adresi:

```text
http://127.0.0.1:8000/api/v1
```

Telefon uzerinden Expo Go ile test ederken `127.0.0.1` telefonun kendisini gosterir. Bu durumda bilgisayarinin yerel IP adresini kullanman gerekir.

Ornek:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.34:8000/api/v1"
npm run start
```

Backend'i telefondan erisilebilir yapmak icin backend'i su sekilde baslatmak gerekebilir:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --reload
```

## Demo Login

```text
email: analyst@example.com
password: ChangeMe123!
```
