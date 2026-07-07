# 06 - UI / UX

## Amaç

Bu belge, CTI-Mobile uygulamasının mobil kullanıcı deneyimini tanımlar. Hedef; CTI, SOC, IR ve yönetici kullanıcıların kritik tehdit bilgisine hızlı, güvenli ve anlaşılır biçimde erişmesini sağlamaktır.

## Tasarım İlkeleri

### 1. Önce Kritik Bilgi

Kullanıcı uygulamayı açtığında en önemli tehditleri, risk seviyelerini ve aksiyon gerektiren başlıkları hemen görmelidir.

### 2. Analist Hızına Uygun Deneyim

SOC ve CTI kullanıcıları yoğun çalışır. Ekranlar kısa, taranabilir ve hızlı aksiyon alınabilir olmalıdır.

### 3. Güven Veren Sadelik

Uygulama güvenlik ürünü olduğu için görsel dil ciddi, net ve kontrollü olmalıdır. Gereksiz animasyon, karmaşık renk kullanımı ve kalabalık kartlar azaltılmalıdır.

### 4. Rol Bazlı Odak

Analist daha fazla teknik detay isterken yönetici kısa risk özeti ister. Aynı veri farklı kullanıcı tipleri için farklı yoğunlukta gösterilmelidir.

### 5. AI Şeffaflığı

AI tarafından üretilen özetler açıkça işaretlenmelidir. Kullanıcı, AI çıktısının kaynak tehdit verisine bağlı olduğunu anlayabilmelidir.

## Bilgi Mimarisi

MVP uygulama aşağıdaki ana bölümlerden oluşur:

```text
Giriş
└── Ana Uygulama
    ├── Dashboard
    ├── Tehditler
    │   └── Tehdit Detayı
    ├── IOC Arama
    │   └── IOC Detayı
    ├── Favoriler
    └── Ayarlar
```

## Navigasyon Modeli

MVP için alt navigasyon önerilir.

Alt navigasyon sekmeleri:

- Dashboard
- Tehditler
- IOC Ara
- Favoriler
- Ayarlar

Gerekçe:

- Mobilde hızlı geçiş sağlar.
- SOC ve CTI kullanıcılarının en sık kullandığı alanlar tek dokunuş uzaklıkta olur.
- Dashboard ve IOC arama gibi yüksek frekanslı akışlar görünür kalır.

## Ekranlar

### 1. Giriş Ekranı

Amaç: Kullanıcının güvenli şekilde oturum açmasını sağlamak.

Ana bileşenler:

- Uygulama adı
- E-posta alanı
- Parola alanı
- Giriş butonu
- Şifremi unuttum bağlantısı
- Güvenli bağlantı/gizlilik bilgisi

Davranış:

- Hatalı girişte genel hata mesajı gösterilir.
- Ağ hatasında kullanıcıya tekrar deneme seçeneği sunulur.
- Başarılı giriş sonrası kullanıcı Dashboard ekranına yönlendirilir.

Boş/hata durumları:

- E-posta boşsa alan uyarısı gösterilir.
- Parola boşsa alan uyarısı gösterilir.
- Sunucu hatasında teknik detay verilmeden güvenli mesaj gösterilir.

### 2. Dashboard

Amaç: Kullanıcının güncel tehdit durumunu ilk bakışta anlamasını sağlamak.

Ana bileşenler:

- Kritik tehdit sayacı
- Yüksek riskli tehdit sayacı
- Son güncellenen tehditler
- AI günlük özet alanı
- Hızlı IOC arama alanı
- En kritik 3 tehdit listesi

Kart bilgileri:

- Tehdit başlığı
- Risk seviyesi
- Kaynak
- Tarih
- Kısa açıklama

Davranış:

- Kullanıcı tehdit kartına dokunarak Tehdit Detayı ekranına gider.
- Kullanıcı hızlı IOC alanına veri girerek IOC Arama sonucuna yönlenir.
- Dashboard aşağı çekerek yenilenebilir.

MVP önceliği:

- Kritik ve yüksek tehditler görünür olmalıdır.
- Kullanıcı ilk 10 saniyede önceliği anlayabilmelidir.

### 3. Tehdit Listesi

Amaç: Kullanıcının güncel tehditleri listelemesi, araması ve filtrelemesi.

Ana bileşenler:

- Arama alanı
- Filtre butonu
- Risk seviyesi filtresi
- Kaynak filtresi
- Tehdit listesi
- Sıralama seçeneği

Liste öğesi bilgileri:

- Başlık
- Risk etiketi
- Kaynak
- Yayın tarihi
- Kısa açıklama
- Favori butonu

Davranış:

- Liste varsayılan olarak en yeni tehdide göre sıralanır.
- Kullanıcı risk seviyesine göre filtreleyebilir.
- Liste öğesine dokununca Tehdit Detayı açılır.
- Favori butonu listeyi terk etmeden çalışır.

Boş/hata durumları:

- Filtre sonucu yoksa kullanıcıya filtreyi temizleme seçeneği gösterilir.
- Bağlantı hatasında son görülen veriler varsa gösterilir.

### 4. Tehdit Detayı

Amaç: Tehdidin bağlamını, etkisini, IOC listesini ve önerilen aksiyonları göstermek.

Ana bileşenler:

- Başlık
- Risk seviyesi
- Kaynak ve tarih
- Kısa açıklama
- AI kısa özet
- Teknik detaylar
- İlişkili IOC'ler
- Önerilen aksiyonlar
- Favoriye ekleme

Sayfa bölümleri:

```text
Başlık ve risk
AI kısa özet
Tehdit açıklaması
İlişkili IOC'ler
Önerilen aksiyonlar
Kaynak bilgisi
```

Davranış:

- Kullanıcı IOC öğesine dokunarak IOC Detayı ekranına gider.
- AI özet alanı yüklenirken ayrı durum gösterir.
- AI başarısız olursa ana tehdit bilgisi etkilenmez.

Önemli UX notu:

Tehdit Detayı ekranında teknik bilgi fazla olabilir. Bu nedenle bölümler açık başlıklarla ayrılmalı, uzun metinler kısa paragraflara bölünmelidir.

### 5. IOC Arama

Amaç: Kullanıcının IP, domain, URL, hash veya e-posta göstergesi araması.

Ana bileşenler:

- Büyük arama alanı
- Arama butonu
- IOC tip algılama etiketi
- Son aramalar
- Örnek format ipuçları

Desteklenen IOC tipleri:

- IP adresi
- Domain
- URL
- Hash
- E-posta adresi

Davranış:

- Kullanıcı yazarken sistem IOC tipini tahmin eder.
- Arama sonucu varsa IOC Detayı veya sonuç listesi gösterilir.
- Tek sonuç varsa doğrudan IOC Detayı açılabilir.
- Birden fazla eşleşme varsa liste gösterilir.

Boş/hata durumları:

- Geçersiz formatta kullanıcıya sade uyarı gösterilir.
- Sonuç yoksa "risk kaydı bulunamadı" mesajı gösterilir.
- Ağ hatasında tekrar deneme sunulur.

### 6. IOC Detayı

Amaç: Bir göstergenin riskini, bağlamını ve ilişkili tehditlerini göstermek.

Ana bileşenler:

- IOC değeri
- IOC tipi
- Risk skoru
- Güven skoru
- İlk görülme tarihi
- Son görülme tarihi
- İlişkili tehditler
- Kaynaklar
- Favori butonu

Davranış:

- İlişkili tehdit kartına dokununca Tehdit Detayı açılır.
- Kullanıcı IOC'yi favorilere ekleyebilir.
- Kullanıcı kısa metin olarak IOC bilgisini kopyalayabilir.

UX notu:

Risk ve güven skoru ayrı gösterilmelidir. Risk, göstergenin tehlike seviyesini; güven skoru ise verinin ne kadar güvenilir olduğunu anlatır.

### 7. Favoriler

Amaç: Kullanıcının kaydettiği tehdit ve IOC kayıtlarına hızlı erişmesi.

Ana bileşenler:

- Tehditler sekmesi
- IOC'ler sekmesi
- Favori listesi
- Arama alanı
- Favoriden çıkarma butonu

Davranış:

- Kullanıcı favori kaydı detayına gidebilir.
- Favoriden çıkarma işlemi geri alınabilir kısa bildirimle desteklenir.
- Favori listesi boşsa kullanıcıya tehdit veya IOC araması önerilir.

### 8. Ayarlar

Amaç: Kullanıcının profil, oturum ve bildirim tercihlerini yönetmesi.

Ana bileşenler:

- Kullanıcı adı/e-posta
- Rol bilgisi
- Bildirim seviyesi
- Tema tercihi
- Güvenlik bilgisi
- Çıkış yap butonu

Bildirim seviyeleri:

- Sadece kritik
- Kritik ve yüksek
- Tüm tehdit güncellemeleri
- Sessiz

Davranış:

- Kullanıcı bildirim seviyesini değiştirebilir.
- Kullanıcı tema tercihini seçebilir.
- Çıkış yaparken onay istenir.

## Ana Kullanıcı Akışları

### Akış 1 - Kritik Bildirimden Tehdit Detayına

```text
Push bildirimi
→ Tehdit Detayı
→ AI kısa özet
→ İlişkili IOC listesi
→ Önerilen aksiyonlar
```

Başarı kriteri:

Kullanıcı kritik bildirime dokunduktan sonra 5 saniye içinde tehdit bağlamını görebilmelidir.

### Akış 2 - IOC Arama

```text
Dashboard hızlı arama veya IOC Ara sekmesi
→ IOC değeri girilir
→ IOC tipi algılanır
→ Sonuç görüntülenir
→ IOC Detayı
→ İlişkili tehditler
```

Başarı kriteri:

SOC analisti, alarmdaki göstergenin riskini 30 saniye içinde anlayabilmelidir.

### Akış 3 - Tehdit İnceleme

```text
Tehditler sekmesi
→ Filtre seçimi
→ Tehdit kartı
→ Tehdit Detayı
→ AI özet
→ Favoriye ekleme
```

Başarı kriteri:

CTI analisti, ilgilendiği tehdide en fazla 3 dokunuşta ulaşabilmelidir.

### Akış 4 - Yönetici Günlük Kontrol

```text
Dashboard
→ Kritik tehditler
→ AI günlük özet
→ En yüksek etkili tehdit
→ Önerilen yönetim aksiyonları
```

Başarı kriteri:

Yönetici, günlük güvenlik önceliğini 1 dakika içinde anlayabilmelidir.

## Görsel Tasarım Yaklaşımı

### Renk Kullanımı

Renkler güvenlik ve risk algısını desteklemelidir.

Önerilen anlamlar:

- Kritik: Kırmızı
- Yüksek: Turuncu
- Orta: Sarı
- Düşük: Yeşil
- Bilgi: Mavi
- Nötr arka plan: Açık gri veya koyu tema için koyu gri

Not:

Risk renkleri sadece dekoratif kullanılmamalıdır. Her risk etiketi metinle de desteklenmelidir.

### Tipografi

- Başlıklar kısa ve net olmalıdır.
- Tehdit kartlarında uzun başlıklar iki satırı geçmemelidir.
- Teknik detaylarda okunabilirlik için satır aralığı rahat tutulmalıdır.
- Kod, hash, IP ve domain gibi değerler monospace yazı tipiyle gösterilebilir.

### Bileşenler

Temel bileşenler:

- Risk etiketi
- Tehdit kartı
- IOC kartı
- Filtre çipi
- Arama alanı
- AI özet paneli
- Boş durum görünümü
- Hata görünümü
- Yükleniyor durumu

## Erişilebilirlik

MVP'de aşağıdaki erişilebilirlik kuralları hedeflenmelidir:

- Renk tek başına anlam taşımaz; metin etiketi kullanılır.
- Dokunma alanları yeterli boyutta olur.
- Metinler küçük ekranlarda taşmaz.
- Koyu ve açık tema kontrastı okunabilir olur.
- Hata mesajları kısa ve anlaşılır yazılır.

## Durum Tasarımları

Her ana ekran aşağıdaki durumları desteklemelidir:

- İlk yükleniyor
- Veri var
- Veri yok
- Filtre sonucu yok
- Ağ hatası
- Yetkisiz erişim
- AI özeti yükleniyor
- AI özeti alınamadı

## Mikro Metinler

Örnek kullanıcı mesajları:

- "Tehditler güncellenemedi. Tekrar deneyin."
- "Bu IOC için kayıtlı risk bulunamadı."
- "AI özeti şu anda oluşturulamadı."
- "Bildirim tercihiniz kaydedildi."
- "Oturum süreniz doldu. Lütfen tekrar giriş yapın."

## Mobil MVP Wireframe Taslakları

### Dashboard

```text
┌─────────────────────────┐
│ CTI-Mobile              │
│ Bugünkü tehdit özeti    │
├─────────────────────────┤
│ Kritik  3   Yüksek  8   │
│ Orta    14  Düşük   21  │
├─────────────────────────┤
│ IOC hızlı ara           │
├─────────────────────────┤
│ AI günlük özet          │
│ - ...                   │
│ - ...                   │
├─────────────────────────┤
│ En kritik tehditler     │
│ [Risk] Tehdit başlığı   │
│ [Risk] Tehdit başlığı   │
└─────────────────────────┘
```

### Tehdit Detayı

```text
┌─────────────────────────┐
│ Geri       Favori       │
│ Tehdit başlığı          │
│ Kritik | Kaynak | Tarih │
├─────────────────────────┤
│ AI kısa özet            │
│ - ...                   │
│ - ...                   │
├─────────────────────────┤
│ Açıklama                │
├─────────────────────────┤
│ İlişkili IOC'ler        │
│ IP ...                  │
│ Domain ...              │
├─────────────────────────┤
│ Önerilen aksiyonlar     │
└─────────────────────────┘
```

### IOC Arama

```text
┌─────────────────────────┐
│ IOC Ara                 │
├─────────────────────────┤
│ IP, domain, URL, hash   │
│ veya e-posta girin      │
├─────────────────────────┤
│ Algılanan tip: Domain   │
├─────────────────────────┤
│ Son aramalar            │
│ example.com             │
│ 8.8.8.8                 │
└─────────────────────────┘
```

## MVP UX Kabul Kriterleri

- Kullanıcı giriş yaptıktan sonra Dashboard ekranına ulaşır.
- Kullanıcı Dashboard'dan hızlı IOC araması başlatabilir.
- Kullanıcı Tehditler sekmesinden tehdit detayına geçebilir.
- Kullanıcı Tehdit Detayı ekranında AI özeti, IOC'leri ve aksiyonları görebilir.
- Kullanıcı IOC Arama ekranında farklı IOC tiplerini arayabilir.
- Kullanıcı kritik bildirime dokunarak ilgili tehdit detayını açabilir.
- Tüm ana ekranlarda yükleniyor, boş ve hata durumları bulunur.

## Sonraki Tasarım Adımları

1. Ekran bazlı düşük çözünürlüklü wireframe hazırlanacak.
2. Flutter component listesi çıkarılacak.
3. Renk, tipografi ve spacing kuralları tasarım sistemi olarak yazılacak.
4. Rol bazlı dashboard varyasyonları netleştirilecek.
5. API alanlarıyla ekran veri ihtiyaçları eşleştirilecek.

