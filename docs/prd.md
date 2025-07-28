# **Berber Randevu Yönetim Sistemi - Ürün Gereksinimleri Dokümanı (PRD)**

**1. Projeye Genel Bakış**

Bu doküman, berber salonları için geliştirilecek dijital randevu yönetim platformunun gereksinimlerini tanımlar. Projenin temel amacı, müşteri randevu sürecini otomatize ederek hem müşteriler için kolaylık sağlamak hem de salon sahibinin (berber) ve çalışanının operasyonel verimliliğini artırmaktır.

**2. Hedef Kitle**

- **Müşteri:** Online olarak randevu almayı tercih eden son kullanıcılar.
- **Berber (Salon Sahibi):** Randevu defteri ve telefon trafiğini azaltarak iş akışını dijital bir takvim üzerinden yönetmek isteyen işletme sahibi.
- **Çalışan:** Randevu takvimi salon sahibi tarafından yönetilen personel. (MVP'de kendi kullanıcı girişi olmayacaktır).

**3. Kapsam ve Özellikler (MVP)**

**3.1. Temel Sistem ve Randevu Mantığı**

- **Kullanıcı Yönetimi:** Müşteriler için e-posta/şifre veya telefon numarası ile basit kayıt ve giriş sistemi.
- **Çalışma Saatleri:** **09:30 - 21:30**.
- **Randevu Süresi:** Tüm hizmetler için sabit **45 dakika**.
- **Kapalı Gün:** **Pazar** günleri randevuya tamamen kapalıdır.
- **Randevu Periyodu:** Müşteriler, içinde bulunulan günden sonraki **7 gün** için randevu alabilir.

**3.2. Müşteri Rolü Özellikleri**

- **Kayıt/Giriş:** Sisteme güvenli bir şekilde kayıt olma ve giriş yapma.
- **Randevu Oluşturma Akışı:**
  1. **Gün Seçimi:** Sadece randevuya açık olan gelecek 7 günü gösteren bir takvimden gün seçimi.
  2. **Personel Seçimi:** Randevu almak istediği kişiyi seçme (Berber / Çalışan).
  3. **Saat Seçimi:** Seçilen personelin o gün için müsait olan 45 dakikalık randevu saatlerinden birini seçme.
  4. **Onay:** Randevu özetini (tarih, saat, personel) görme ve onaylama. (Kayıtlı olduğu için bilgileri tekrar girmesine gerek kalmaz).
- **Randevularım Ekranı:**
  - Gelecekteki ve geçmiş randevularını listeleme.
  - **Randevu İptali:** Gelecekteki bir randevuyu, **randevu saatine 2 saat kalana kadar** iptal etme butonu. 2 saatten az süre kaldığında bu buton pasif hale gelir.

**3.3. Berber (Salon Sahibi) Rolü Özellikleri**

- **Yönetici Paneli:** Kendine özel, güvenli bir giriş ile erişebileceği yönetim paneli.
- **Takvim Yönetimi:**
  - **Görünümler:** Randevuları **Günlük, Haftalık ve Aylık** formatta (Google Calendar benzeri) görsel bir takvim üzerinde görme.
  - **Filtreleme:** Takvimde sadece kendi randevularını, sadece çalışanın randevularını veya her ikisini birden görme.
  - **Randevu Detayı:** Takvimdeki bir randevuya tıklandığında müşteri adı ve telefonunu görme.
- **Manuel Randevu Yönetimi:**
  - **Müşteri Adına Randevu Oluşturma:** Sisteme kayıtlı olmayan veya telefonla arayan bir müşteri için manuel randevu ekleyebilme. Bu işlem sırasında **müşterinin sadece adını ve telefon numarasını girmek yeterlidir**, sistemde bir hesap oluşturulması gerekmez.
  - **Randevu İptali:** Mevcut bir randevuyu (gerekçe belirterek veya belirtmeden) iptal edebilme.
- **Zaman Bloklama (Manuel Yönetim):**
  - **Belirli Saatleri Kapatma:** Gün içinde belirli bir zaman aralığını (örn. "doktor randevusu", "öğle yemeği") kendisi veya çalışanı için randevuya kapatabilme.
  - **Tüm Günü Kapatma:** Hastalık, izin, resmi tatil gibi durumlar için bir veya daha fazla günü **tamamen manuel olarak** kendisi veya çalışanı için randevuya kapatabilme.

**3.4. Bildirimler (MVP için Düşük Maliyetli Çözüm)**

- **Temel Yaklaşım:** MVP aşamasında maliyet yaratacak SMS veya ücretli WhatsApp API entegrasyonlarından kaçınılacaktır.
- **Uygulama İçi Onay:** Müşteri randevu oluşturduğunda veya iptal ettiğinde, ekranda net bir onay mesajı ("Randevunuz oluşturulmuştur", "Randevunuz başarıyla iptal edildi") gösterilir.
- **Gelecek Potansiyeli (WhatsApp):** Berberin mevcut "İşletme WhatsApp" hesabını kullanarak randevudan bir gün önce manuel veya yarı-otomatik bir hatırlatma göndermesi teşvik edilebilir. Tam otomasyon, projenin bir sonraki aşamasında değerlendirilecektir. Bu, MVP'de sıfır teknik maliyetle "no-show" oranını düşürmeye yardımcı olur.

**4. Kapsam Dışı (MVP Sonrası Değerlendirilecekler)**

- Otomatik SMS/E-posta/WhatsApp bildirimleri ve hatırlatmaları.
- Online ödeme entegrasyonu.
- Farklı hizmetler, süreler ve fiyatlandırma.
- Çalışan için ayrı kullanıcı girişi ve kendi takvimini yönetme yetkisi.
- Detaylı raporlama (gelir, müşteri yoğunluğu vb.).
- Pazarlama ve kampanya modülleri.

Bu doküman, projenin ilk ve en yalın halini hayata geçirmek için sağlam bir temel oluşturmaktadır. Proje canlıya alındıktan sonra bir berber tarafından aktif olarak kullanılması, en değerli geri bildirimleri toplayarak sonraki adımları doğru bir şekilde planlamamızı sağlayacaktır.
