"use client";

import Link from 'next/link';
import { 
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold">Berber</span>
            </div>
            <p className="text-gray-400 text-sm">
              Modern berberlık hizmetleri ile erkek bakımında uzman ekibimizle 
              sizlere en kaliteli hizmeti sunuyoruz.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/book-appointment" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Randevu Al
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Hizmetlerimiz
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  İletişim
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Sık Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">
                    Örnek Mahallesi, Berber Sokak No:123
                  </p>
                  <p className="text-sm text-gray-400">
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <a 
                  href="tel:+905551234567" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  +90 555 123 45 67
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <a 
                  href="mailto:info@berber.com" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  info@berber.com
                </a>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Çalışma Saatleri</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Pazartesi - Cumartesi</p>
                  <p className="text-sm text-white font-medium">09:30 - 21:30</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Pazar</p>
                  <p className="text-sm text-red-400 font-medium">Kapalı</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">
                Randevu almak için online sistemimizi kullanabilir 
                veya telefon ile iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Berber Randevu Sistemi. Tüm hakları saklıdır.
            </p>
            
            <div className="flex space-x-6">
              <Link 
                href="/privacy" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Gizlilik Politikası
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Kullanım Şartları
              </Link>
              <Link 
                href="/cookies" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}