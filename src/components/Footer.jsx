import React from 'react';

export default function Footer({ onAdminClick }) {
  return (
    <footer className="bg-secondary mt-12 py-8 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">DAYSTORE</h3>
            <p className="text-gray-400 text-sm">
              Website Top-Up Games Termurah, Tercepat dan Terpercaya di Indonesia.
              Buka 24 Jam Nonstop.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Peta Situs</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-primary">Beranda</a></li>
              <li><a href="#" className="hover:text-primary">Cek Pesanan</a></li>
              <li><a href="#" className="hover:text-primary">Hubungi Kami</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Metode Pembayaran</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white text-black text-xs rounded font-bold">WhatsApp</span>
              <span className="px-2 py-1 bg-white text-black text-xs rounded font-bold">BCA</span>
              <span className="px-2 py-1 bg-white text-black text-xs rounded font-bold">Dana</span>
              <span className="px-2 py-1 bg-white text-black text-xs rounded font-bold">Gopay</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} DAYSTORE. All rights reserved.
          <span 
            onClick={onAdminClick} 
            className="ml-2 cursor-pointer hover:text-gray-400"
            title="Admin Login"
          >
            •
          </span>
        </div>
      </div>
    </footer>
  );
}
