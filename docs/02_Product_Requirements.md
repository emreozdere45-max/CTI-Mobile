# 02 - Product Requirements

## Amac

CTI-Mobile MVP surumu, siber tehdit istihbarati verilerini mobilde takip edilebilir, aranabilir ve aksiyona donusturulebilir hale getirecektir.

## Hedef Kullanicilar

- CTI analisti
- SOC analisti
- Guvenlik operasyon yoneticisi
- Incident response ekibi
- CISO veya guvenlik lideri

## MVP Ozellikleri

1. Kimlik dogrulama
2. Rol bazli yetkilendirme
3. Tehdit dashboard'u
4. IOC arama
5. Tehdit detayi sayfasi
6. AI destekli ozetleme
7. Kritik tehdit bildirimleri
8. Kaynak ve etiket filtreleme
9. Favorilere ekleme
10. Temel audit log

## MVP Disi Ozellikler

- Tam otomatik SOAR entegrasyonu
- Derin malware sandbox analizi
- Gercek zamanli chat ops
- Kurum ici SIEM iki yonlu senkronizasyon

## Fonksiyonel Gereksinimler

- Kullanici e-posta ve parola veya SSO ile giris yapabilmeli.
- Kullanici tehditleri tarih, seviye, sektor, kaynak ve etiket ile filtreleyebilmeli.
- Kullanici IP, domain, URL, hash veya e-posta IOC arayabilmeli.
- Sistem tehdit detayinda kaynak, guven skoru, etki, onerilen aksiyon ve ilgili IOC listesini gostermeli.
- AI katmani uzun raporlari kisa ozet, teknik ozet ve aksiyon listesi olarak uretebilmeli.

## Fonksiyonel Olmayan Gereksinimler

- API yanitlari normal kosullarda 500 ms - 1500 ms araliginda hedeflenmeli.
- Hassas veriler transit ve storage seviyesinde korunmali.
- Mobil uygulama offline durumda son gorulen verileri kisitli olarak gosterebilmeli.
- Loglar kisisel veya gizli verileri gereksiz yere tutmamali.

## Kabul Kriterleri

- Kullanici giris yapip dashboard'u gorebilir.
- Kullanici IOC aramasi yapip sonuc detayina gidebilir.
- Kullanici kritik tehdit bildirimini alabilir.
- AI ozetleme bir tehdit raporu icin okunabilir cikt? uretir.
- Temel guvenlik kontrolleri dokumante edilir.
