# CTI-Mobile

CTI-Mobile, siber tehdit istihbaratini mobil ekipler, analistler ve operasyon sorumlulari icin daha erisilebilir hale getirmeyi hedefleyen bir mobil uygulama projesidir.

## Hedef

Uygulama; tehdit akislari, IOC arama, alarm takibi, AI destekli ozetleme, bildirimler ve ekip is birligi gibi temel CTI is ak??larini mobilde sade ve guvenli bir deneyimle sunar.

## Ilk Paket

- Urun vizyonu
- Urun gereksinimleri
- Kullanici personeleri
- Kullanici hikayeleri
- Ozellik listesi
- UI/UX yaklasimi
- Mimari taslak
- Veritabani ve API tasarimi
- AI entegrasyon plani
- Guvenlik, test ve deployment planlari

## Klasorler

```text
CTI-Mobile/
??? docs/
??? backend/
??? mobile/
??? prompts/
??? assets/
```

## Gelistirme Yaklasimi

Bu repo belge odakli basladi. Once urun ve teknik kararlar netlestirildi; simdi FastAPI backend, PostgreSQL veritabani ve Expo/React Native mobil uygulama sprintler halinde ekleniyor.

## Mevcut Durum

- Backend API calisiyor.
- PostgreSQL Docker ile kullaniliyor.
- Auth, threats, IOC search, AI summary, favorites ve notifications endpointleri hazir.
- Mobil klasor Expo/React Native icin hazirlaniyor.

## Hizli Baslangic

Backend icin:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Mobil icin:

```powershell
cd mobile
npm install
npm run start
```

Detayli backend adimlari icin `backend/README.md` dosyasina bak.
