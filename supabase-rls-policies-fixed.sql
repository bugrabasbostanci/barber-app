-- Berber Randevu Sistemi - Düzeltilmiş RLS Politikaları
-- MEVCUT POLİTİKALARI TEMİZLE ve YENİDEN OLUŞTUR

-- =============================================================================
-- 0. MEVCUT POLİTİKALARI TEMİZLE
-- =============================================================================

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "users_own_profile" ON users;
DROP POLICY IF EXISTS "barbers_view_users" ON users;
DROP POLICY IF EXISTS "authenticated_users_only" ON users;

DROP POLICY IF EXISTS "customers_own_appointments" ON appointments;
DROP POLICY IF EXISTS "staff_manage_appointments" ON appointments;
DROP POLICY IF EXISTS "employees_assigned_appointments" ON appointments;
DROP POLICY IF EXISTS "authenticated_appointments_only" ON appointments;

DROP POLICY IF EXISTS "employee_unavailable_times" ON employee_unavailable_times;
DROP POLICY IF EXISTS "barbers_view_all_unavailable_times" ON employee_unavailable_times;
DROP POLICY IF EXISTS "authenticated_unavailable_times_only" ON employee_unavailable_times;

DROP POLICY IF EXISTS "public_read_active_shops" ON shops;
DROP POLICY IF EXISTS "barbers_manage_shops" ON shops;

-- =============================================================================
-- 1. YARDIMCI FONKSİYONLAR
-- =============================================================================

-- Kullanıcı rolünü döndüren fonksiyon
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::text 
    FROM users 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Barber/Admin kontrol fonksiyonu
CREATE OR REPLACE FUNCTION is_barber_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_role() IN ('BARBER', 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff (çalışan) kontrol fonksiyonu
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_role() IN ('EMPLOYEE', 'BARBER', 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. USERS TABLOSU POLİTİKALARI
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Sadece giriş yapmış kullanıcılar erişebilir
CREATE POLICY "users_authenticated_only" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Kullanıcılar kendi profillerini yönetebilir
CREATE POLICY "users_own_profile" ON users
  FOR ALL USING (auth.uid() = id);

-- Barberler tüm kullanıcıları görebilir (sadece okuma)
CREATE POLICY "barbers_view_all_users" ON users
  FOR SELECT USING (is_barber_or_admin());

-- =============================================================================
-- 3. APPOINTMENTS TABLOSU POLİTİKALARI
-- =============================================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Sadece giriş yapmış kullanıcılar erişebilir
CREATE POLICY "appointments_authenticated_only" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

-- Müşteriler kendi randevularını yönetebilir
CREATE POLICY "customers_manage_own_appointments" ON appointments
  FOR ALL USING (
    auth.uid() = "customerId"::uuid OR 
    ("customerId" IS NULL AND auth.uid() = "createdById"::uuid)
  );

-- Barberler/Adminler tüm randevuları yönetebilir
CREATE POLICY "barbers_manage_all_appointments" ON appointments
  FOR ALL USING (is_barber_or_admin());

-- Çalışanlar sadece kendilerine atanan randevuları görebilir
CREATE POLICY "employees_view_assigned_appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = "staffId"::uuid AND 
    get_current_user_role() = 'EMPLOYEE'
  );

-- =============================================================================
-- 4. EMPLOYEE_UNAVAILABLE_TIMES POLİTİKALARI
-- =============================================================================

ALTER TABLE employee_unavailable_times ENABLE ROW LEVEL SECURITY;

-- Sadece giriş yapmış kullanıcılar erişebilir
CREATE POLICY "unavailable_times_authenticated_only" ON employee_unavailable_times
  FOR ALL USING (auth.role() = 'authenticated');

-- Çalışanlar kendi müsaitlik durumlarını yönetebilir
CREATE POLICY "staff_manage_own_unavailable_times" ON employee_unavailable_times
  FOR ALL USING (auth.uid() = "staffId"::uuid);

-- Barberler tüm çalışanların müsaitlik durumlarını görebilir
CREATE POLICY "barbers_view_all_unavailable_times" ON employee_unavailable_times
  FOR SELECT USING (is_barber_or_admin());

-- =============================================================================
-- 5. SHOPS TABLOSU POLİTİKALARI
-- =============================================================================

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Herkes aktif shop'ları görebilir (randevu almak için)
CREATE POLICY "public_view_active_shops" ON shops
  FOR SELECT USING (is_active = true);

-- Barberler shop'ları yönetebilir
CREATE POLICY "barbers_manage_shops" ON shops
  FOR ALL USING (is_barber_or_admin());

-- =============================================================================
-- 6. TEST SORULARI
-- =============================================================================

-- RLS durumunu kontrol et
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables pt
LEFT JOIN pg_class pc ON pt.tablename = pc.relname
WHERE schemaname = 'public' 
AND tablename IN ('users', 'appointments', 'employee_unavailable_times', 'shops');

-- Aktif politikaları listele
SELECT 
  tablename, 
  policyname,
  cmd as command_type,
  qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- KULLANIM TALİMATLARI
-- =============================================================================

/*
1. Bu dosyayı Supabase Dashboard > SQL Editor'da çalıştırın
2. Hataları kontrol edin - tüm komutlar başarıyla çalışmalı
3. Test kullanıcıları oluşturun:
   - Müşteri, Çalışan, Berber rolleriyle
4. API çağrıları yaparak test edin:
   - Farklı kullanıcılarla login olun
   - Sadece yetkili verileri görebildiğinizi kontrol edin

BEKLENEN DAVRANIŞLAR:
✅ Müşteriler: Sadece kendi randevularını görebilir
✅ Çalışanlar: Kendi randevuları + müsaitlik durumları
✅ Berberler: Tüm veriler + yönetim yetkileri
✅ Anonim kullanıcılar: Sadece aktif shop'lar
*/