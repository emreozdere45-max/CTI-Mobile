# 04 - User Stories

## Amaç

Bu belge, CTI-Mobile MVP ve sonraki sürümleri için kullanıcı hikayelerini tanımlar. Hikayeler daha sonra GitHub issue, sprint görevi, test senaryosu ve kabul kriteri olarak detaylandırılabilir.

## Format

```text
Bir [rol] olarak,
[hedef] yapmak istiyorum,
böylece [fayda] elde ederim.
```

## Kimlik Doğrulama ve Hesap

### US-001 - Güvenli Giriş

Bir kullanıcı olarak, güvenli şekilde giriş yapmak istiyorum, böylece tehdit verilerine sadece yetkili kişilerin eriştiğinden emin olurum.

Kabul kriterleri:

- Kullanıcı e-posta/parola ile giriş yapabilir.
- Başarısız girişlerde güvenli hata mesajı gösterilir.
- Oturum süresi dolduğunda kullanıcı tekrar girişe yönlendirilir.

### US-002 - Rol Bazlı Görünüm

Bir güvenlik yöneticisi olarak, kullanıcıların rollerine göre farklı içerikler görmesini istiyorum, böylece hassas bilgiler kontrollü paylaşılır.

Kabul kriterleri:

- Kullanıcının rolü oturumla birlikte alınır.
- CTI analisti, SOC analisti ve yönetici rolleri ayrıştırılır.
- Yetkisiz sayfaya erişim engellenir.

### US-003 - Profil ve Bildirim Ayarları

Bir kullanıcı olarak, profil ve bildirim tercihlerimi düzenlemek istiyorum, böylece sadece benim için önemli uyarıları alırım.

Kabul kriterleri:

- Kullanıcı profil bilgilerini görebilir.
- Bildirim seviyesi seçilebilir.
- Tercihler kaydedilir ve sonraki oturumda korunur.

## Dashboard

### US-004 - Tehdit Özeti Görüntüleme

Bir CTI analisti olarak, güncel tehditlerin özetini dashboard'da görmek istiyorum, böylece hangi tehditlere odaklanacağımı hızlıca anlayabilirim.

Kabul kriterleri:

- Dashboard kritik, yüksek, orta ve düşük tehdit sayılarını gösterir.
- En yeni tehditler listelenir.
- Kullanıcı tehdit detayına geçebilir.

### US-005 - Yönetici Risk Özeti

Bir güvenlik operasyon yöneticisi olarak, kurum için en önemli tehditleri kısa özet halinde görmek istiyorum, böylece ekibin günlük önceliklerini belirleyebilirim.

Kabul kriterleri:

- Yönetici görünümünde en kritik tehditler öne çıkar.
- Her tehdit için kısa etki açıklaması gösterilir.
- Kullanıcı haftalık görünümü açabilir.

## Tehdit Akışı

### US-006 - Tehdit Listesi

Bir kullanıcı olarak, güncel tehditleri liste halinde görmek istiyorum, böylece yeni gelişmeleri takip edebilirim.

Kabul kriterleri:

- Tehditler tarih sırasına göre listelenir.
- Her kayıt başlık, seviye, kaynak ve tarih içerir.
- Liste yenilenebilir.

### US-007 - Filtreleme

Bir CTI analisti olarak, tehditleri kaynak, sektör, seviye ve etikete göre filtrelemek istiyorum, böylece aradığım tehdide hızlı ulaşırım.

Kabul kriterleri:

- Kullanıcı birden fazla filtre seçebilir.
- Filtreler liste sonucunu günceller.
- Filtreler temizlenebilir.

### US-008 - Tehdit Detayı

Bir kullanıcı olarak, bir tehdidin detayını açmak istiyorum, böylece kaynak, etki, IOC ve önerilen aksiyonları inceleyebilirim.

Kabul kriterleri:

- Detay sayfasında başlık, açıklama, seviye ve kaynak görünür.
- İlişkili IOC'ler listelenir.
- Önerilen aksiyonlar ayrı bölümde gösterilir.

## IOC Arama

### US-009 - IOC Arama

Bir SOC analisti olarak, IP, domain, URL, hash veya e-posta aramak istiyorum, böylece alarmdaki göstergenin riskini hızlıca anlayabilirim.

Kabul kriterleri:

- Arama alanı farklı IOC tiplerini kabul eder.
- Sistem IOC tipini otomatik algılar veya kullanıcıya gösterir.
- Sonuç risk seviyesiyle birlikte döner.

### US-010 - IOC Detayı

Bir incident response uzmanı olarak, IOC detayını görmek istiyorum, böylece göstergeyle ilişkili kampanya ve aksiyonları anlayabilirim.

Kabul kriterleri:

- IOC detayında tip, değer, ilk görülme, son görülme ve güven skoru bulunur.
- İlişkili tehditler gösterilir.
- Kullanıcı IOC'yi favorilere ekleyebilir.

### US-011 - Arama Geçmişi

Bir kullanıcı olarak, son aramalarımı görmek istiyorum, böylece tekrar eden analizleri hızlıca açabilirim.

Kabul kriterleri:

- Son aramalar cihaz veya hesap seviyesinde listelenir.
- Kullanıcı geçmişten arama başlatabilir.
- Kullanıcı geçmişi temizleyebilir.

## AI Destekli Analiz

### US-012 - Kısa Tehdit Özeti

Bir CTI analisti olarak, uzun tehdit raporunun kısa özetini almak istiyorum, böylece raporun önemini hızlıca değerlendirebilirim.

Kabul kriterleri:

- AI özeti 3-5 madde halinde gösterilir.
- Özet, kaynak rapordaki kritik bilgileri korur.
- Kullanıcı teknik özete geçebilir.

### US-013 - Teknik Özet

Bir SOC analisti olarak, tehdidin teknik özetini görmek istiyorum, böylece saldırı vektörü, IOC ve savunma adımlarını anlayabilirim.

Kabul kriterleri:

- Teknik özet IOC, TTP ve önerilen aksiyonları içerir.
- Gereksiz pazarlama veya belirsiz ifadeler bulunmaz.
- AI çıktısı kaynak tehditle ilişkilendirilir.

### US-014 - Yönetici Özeti

Bir CISO olarak, tehdidin iş etkisini kısa biçimde görmek istiyorum, böylece hızlı karar alabilirim.

Kabul kriterleri:

- Yönetici özeti teknik jargonu azaltır.
- İş etkisi ve önerilen yönetim aksiyonu bulunur.
- Özet kritik seviye tehdide öncelik verir.

## Bildirimler

### US-015 - Kritik Tehdit Bildirimi

Bir kullanıcı olarak, kritik tehdit olduğunda bildirim almak istiyorum, böylece önemli gelişmeleri kaçırmam.

Kabul kriterleri:

- Kritik seviye tehdit için push bildirimi gönderilir.
- Bildirime dokununca tehdit detayı açılır.
- Kullanıcı bildirim seviyesini değiştirebilir.

### US-016 - Takip Edilen Tehdit Güncellemesi

Bir CTI analisti olarak, takip ettiğim tehdit güncellendiğinde bildirim almak istiyorum, böylece değişiklikleri kaçırmam.

Kabul kriterleri:

- Kullanıcı tehdidi takip listesine ekleyebilir.
- Tehdit güncellenirse bildirim oluşur.
- Güncelleme detayı tehdit sayfasında görünür.

## Favoriler ve Kaydetme

### US-017 - Favori Tehdit

Bir kullanıcı olarak, önemli tehditleri favorilere eklemek istiyorum, böylece daha sonra hızlıca erişebilirim.

Kabul kriterleri:

- Tehdit favorilere eklenebilir ve çıkarılabilir.
- Favoriler ayrı listede görüntülenir.
- Favori durumu cihazlar arasında korunur.

### US-018 - Kısa Özet Paylaşma

Bir incident response uzmanı olarak, tehdit özetini paylaşılabilir formatta almak istiyorum, böylece ekip içi iletişim hızlanır.

Kabul kriterleri:

- Kullanıcı kısa özet oluşturabilir.
- Özet hassas bilgileri gereksiz açığa çıkarmaz.
- Paylaşım için metin kopyalama desteklenir.

## Yönetim ve Denetim

### US-019 - Audit Log

Bir güvenlik yöneticisi olarak, önemli kullanıcı aksiyonlarının loglanmasını istiyorum, böylece denetim ve güvenlik takibi yapılabilir.

Kabul kriterleri:

- Giriş, arama ve detay görüntüleme gibi temel olaylar kaydedilir.
- Loglar kullanıcı, zaman ve aksiyon bilgisi içerir.
- Hassas veri loglarda maskelenir.

### US-020 - Kaynak Yönetimi

Bir yönetici olarak, tehdit kaynaklarını yönetmek istiyorum, böylece güvenilir veriler uygulamaya dahil edilir.

Kabul kriterleri:

- Kaynak adı, tipi ve güven seviyesi tanımlanır.
- Pasif kaynaklardan veri gösterilmez.
- Kaynak değişiklikleri loglanır.

## Önceliklendirme

| ID | Başlık | Öncelik | Sürüm |
| --- | --- | --- | --- |
| US-001 | Güvenli Giriş | Must | MVP |
| US-004 | Tehdit Özeti Görüntüleme | Must | MVP |
| US-006 | Tehdit Listesi | Must | MVP |
| US-008 | Tehdit Detayı | Must | MVP |
| US-009 | IOC Arama | Must | MVP |
| US-012 | Kısa Tehdit Özeti | Must | MVP |
| US-015 | Kritik Tehdit Bildirimi | Must | MVP |
| US-017 | Favori Tehdit | Should | MVP |
| US-002 | Rol Bazlı Görünüm | Should | V1 |
| US-013 | Teknik Özet | Should | V1 |
| US-014 | Yönetici Özeti | Should | V1 |
| US-019 | Audit Log | Should | V1 |
| US-020 | Kaynak Yönetimi | Could | V1 |

