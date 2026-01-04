import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TransactionCheck from './components/TransactionCheck';
import AdminDashboard from './components/AdminDashboard';
import { Search, ChevronRight, Zap, ShoppingBag, Shield, Globe, MessageCircle } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState([]);
  const [view, setView] = useState('home'); // 'home' | 'detail' | 'transactions'
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bagibagi'); // 'bagibagi' or 'whatsapp'

  useEffect(() => {
    fetch('http://localhost:3000/api/games')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGames(data);
        }
      })
      .catch(err => console.error('Error fetching games:', err));
  }, []);

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setFormData({}); // Reset form
    setSelectedItem(null); // Reset item
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleHomeClick = () => {
    setView('home');
    setSelectedGame(null);
    window.scrollTo(0, 0);
  };

  const handleTransactionClick = () => {
    setView('transactions');
    setSelectedGame(null);
    window.scrollTo(0, 0);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!selectedItem) {
      alert('Silakan pilih item terlebih dahulu!');
      return;
    }
    
    // Validate required inputs
    const missingFields = selectedGame.inputs.filter(input => !formData[input.name]);
    if (missingFields.length > 0) {
      alert(`Mohon lengkapi ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    // Find User Phone (Assuming the first input is user ID, we might need a separate phone input for notifications or just use a dummy one if not collected)
    // In this app structure, we don't explicitly ask for user's phone number for contact, only game ID.
    // For the sake of the DB, let's ask for a phone number or use the game ID as reference if it looks like a phone.
    // However, to match the reference "No. Handphone" column, we should probably add a "No. WhatsApp" field to the form.
    
    // Let's assume we add a "No. WhatsApp" field to every game form for now dynamically or just hardcode it to test.
    // Better approach: Prompt user for WhatsApp number before processing.
    const userPhone = prompt("Masukkan Nomor WhatsApp untuk konfirmasi pesanan:", "08...");
    if (!userPhone) return;

    const adminNumber = '628123456789'; // Ganti dengan nomor admin asli
    
    // Generate Invoice ID
    const invoiceId = 'DS' + Date.now().toString().slice(-10);
    
    // Generate Unique Code (Random 3 digits)
    const uniqueCode = Math.floor(Math.random() * 999) + 1; // 1 to 999
    const finalPrice = Number(selectedItem.price) + uniqueCode;

    const transactionData = {
      id: invoiceId,
      phone: userPhone,
      game_name: selectedGame.name,
      item_name: selectedItem.name,
      price: selectedItem.price,
      unique_code: uniqueCode,
      final_price: finalPrice,
      formData: formData
    };

    // Save to Database
    try {
      const response = await fetch('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: invoiceId,
          phone: userPhone,
          game_name: selectedGame.name,
          item_name: selectedItem.name,
          price: selectedItem.price,
          unique_code: uniqueCode,
          final_price: finalPrice
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned ' + response.status);
      }
    } catch (error) {
      console.error('Failed to save transaction', error);
      alert('Gagal menyimpan transaksi ke database. Mohon coba lagi.');
      return; // Stop execution if save fails
    }

    setCurrentTransaction(transactionData);
    setShowPaymentModal(true);
    setView('transactions'); // Switch to transactions view immediately so user sees the status
  };

  const handleWhatsAppRedirect = () => {
    if (!currentTransaction) return;

    const adminNumber = '628123456789'; // Ganti dengan nomor admin asli
    
    let userDetails = '';
    selectedGame.inputs.forEach(input => {
      userDetails += `${input.label}: ${currentTransaction.formData[input.name]}\n`;
    });

    const message = `Halo Admin DAYSTORE,
Saya sudah melakukan pembayaran untuk:

*Invoice:* ${currentTransaction.id}
*Game:* ${currentTransaction.game_name}
${userDetails}
*Item:* ${currentTransaction.item_name}
*Harga:* Rp ${Number(currentTransaction.final_price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (Sudah termasuk kode unik)
*Pembayaran:* Bagibagi.co / Transfer

Mohon segera diproses ya! Terima kasih.`;

    const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowPaymentModal(false);
    setView('transactions'); // Redirect to transaction check page after confirmation
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-100">
      <Navbar onHomeClick={handleHomeClick} onTransactionClick={handleTransactionClick} />

      <main className="flex-grow">
        {showPaymentModal && currentTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-secondary rounded-xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden animate-fade-in flex flex-col">
              <div className="bg-primary p-3 text-center shrink-0">
                <h3 className="text-lg font-bold text-white">Selesaikan Pembayaran</h3>
                <p className="text-primary-foreground text-xs opacity-90">Invoice: {currentTransaction.id}</p>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-accent">Rp {currentTransaction.final_price.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-yellow-400 mt-1 font-bold animate-pulse">
                      PENTING: Transfer TEPAT hingga 3 digit terakhir ({currentTransaction.unique_code.toString().padStart(3, '0')})
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-white text-xs">Metode Pembayaran:</p>
                  
                  {/* Opsi 1: Bagibagi.co (QRIS / E-Wallet) */}
                  <div className="bg-dark p-3 rounded-lg border border-primary/50 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 bg-primary text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">
                        REKOMENDASI
                     </div>
                     <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3 p-1 overflow-hidden">
                           {/* Icon Bagibagi / QRIS */}
                           <img src="https://www.google.com/s2/favicons?domain=bagibagi.co&sz=128" alt="Bagibagi" className="w-full h-full object-contain" />
                        </div>
                        <div>
                           <p className="font-bold text-white text-sm">QRIS / E-Wallet / VA</p>
                           <p className="text-[10px] text-gray-400">Via Bagibagi.co (Cek Otomatis)</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => window.open(`https://bagibagi.co/daypay?amount=${currentTransaction.final_price}`, '_blank')}
                        className="w-full bg-white text-black hover:bg-gray-200 font-bold py-1.5 rounded text-xs transition-colors"
                     >
                        Bayar Sekarang
                     </button>
                  </div>


                </div>

                <div className="space-y-2 pt-2">
                    <button 
                      onClick={handleWhatsAppRedirect}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg shadow-lg transition-colors flex items-center justify-center text-sm"
                    >
                       Konfirmasi via WhatsApp
                    </button>
                    
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full text-gray-400 text-xs hover:text-white"
                    >
                      Tutup / Bayar Nanti
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'transactions' && <TransactionCheck initialTransactionId={currentTransaction?.id} />}
        
        {view === 'admin' && <AdminDashboard onLogout={() => setView('home')} />}

        {view === 'home' && (
          <>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-secondary to-primary h-64 overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-30"></div>
              <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    Top Up Game <span className="text-accent">Termurah</span> & <span className="text-accent">Tercepat</span>
                  </h1>
                  <p className="text-lg text-gray-200 mb-8">
                    Layanan Top Up Game Mobile Legends, Free Fire, PUBG Mobile, dan lainnya. Proses hitungan detik!
                  </p>
                  <div className="flex items-center bg-white rounded-full px-4 py-2 w-full max-w-md shadow-lg">
                    <Search className="text-gray-400 h-5 w-5" />
                    <input 
                      type="text" 
                      placeholder="Cari game favoritmu..." 
                      className="bg-transparent border-none focus:ring-0 text-gray-800 ml-2 w-full outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Games Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="flex items-center mb-8">
                <Zap className="text-accent h-6 w-6 mr-2" />
                <h2 className="text-2xl font-bold">Game Populer</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {games.map((game) => (
                  <div 
                    key={game.id}
                    onClick={() => handleGameClick(game)}
                    className="group bg-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-primary"
                  >
                    <div className="relative aspect-[1/1] overflow-hidden">
                      <img 
                        src={game.image} 
                        alt={game.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">TOP UP</span>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-white group-hover:text-primary transition-colors">{game.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{game.publisher}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === 'detail' && selectedGame && (
          <div className="relative min-h-screen">
             {/* Background Banner Effect */}
            <div className="absolute top-0 left-0 w-full h-80 overflow-hidden -z-10 opacity-10">
                <img src={selectedGame.image} alt="Background" className="w-full h-full object-cover blur-2xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-400 mb-6">
                <span onClick={handleHomeClick} className="cursor-pointer hover:text-white transition-colors">Beranda</span>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-white font-semibold">{selectedGame.name}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Game Info */}
                <div className="lg:col-span-1">
                  <div className="bg-secondary/80 backdrop-blur-md rounded-2xl p-6 sticky top-24 border border-gray-700 shadow-xl z-30 h-fit">
                    <div className="relative">
                        <img src={selectedGame.image} alt={selectedGame.name} className="w-40 h-40 rounded-2xl mx-auto mb-6 shadow-2xl border-4 border-gray-800" />
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-center mb-1 text-white">{selectedGame.name}</h2>
                    <p className="text-center text-primary font-medium text-sm mb-6">{selectedGame.publisher}</p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6 bg-dark/50 p-3 rounded-xl border border-gray-700/50">
                       <div className="flex items-center text-xs text-gray-300 gap-2">
                          <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 
                          <span>Proses Cepat</span>
                       </div>
                       <div className="flex items-center text-xs text-gray-300 gap-2">
                          <Shield className="w-4 h-4 text-green-500 fill-green-500/20" /> 
                          <span>Pembayaran Aman</span>
                       </div>
                       <div className="flex items-center text-xs text-gray-300 gap-2">
                          <Globe className="w-4 h-4 text-blue-400" /> 
                          <span>Region Indo</span>
                       </div>
                       <div className="flex items-center text-xs text-gray-300 gap-2">
                          <MessageCircle className="w-4 h-4 text-purple-400" /> 
                          <span>Layanan 24/7</span>
                       </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider flex items-center">
                        <span className="w-1 h-4 bg-accent mr-2 rounded-full"></span>
                        Cara Top Up
                      </h3>
                      <ol className="list-decimal list-outside text-sm text-gray-400 space-y-2 pl-4">
                        <li>Masukkan <strong>ID Akun</strong> Anda.</li>
                        <li>Pilih nominal <strong>Diamonds</strong>.</li>
                        <li>Pilih <strong>Metode Pembayaran</strong>.</li>
                        <li>Klik <strong>Pesan Sekarang</strong>.</li>
                        <li>Diamonds masuk otomatis!</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Form */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Step 1: Data */}
                  <div className="bg-secondary rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-black text-white">1</span>
                    </div>
                    <div className="flex items-center mb-6 relative z-10">
                      <span className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 text-lg shadow-lg shadow-primary/30">1</span>
                      <h3 className="text-xl font-bold text-white">Masukkan Data Akun</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                      {selectedGame.inputs.map((input) => (
                        <div key={input.name} className={input.name === 'userId' && selectedGame.inputs.length === 1 ? 'sm:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">{input.label}</label>
                          {input.type === 'select' ? (
                            <select 
                              name={input.name} 
                              onChange={handleInputChange}
                              className="w-full bg-dark border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-medium"
                            >
                              <option value="">Pilih {input.label}</option>
                              {input.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              name={input.name}
                              placeholder={input.placeholder}
                              onChange={handleInputChange}
                              className="w-full bg-dark border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-medium placeholder-gray-600"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4 ml-1 flex items-center">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Butuh bantuan mencari ID? Lihat menu petunjuk di dalam game.
                    </p>
                  </div>

                  {/* Step 2: Item */}
                  <div className="bg-secondary rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-black text-white">2</span>
                    </div>
                    <div className="flex items-center mb-6 relative z-10">
                      <span className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 text-lg shadow-lg shadow-primary/30">2</span>
                      <h3 className="text-xl font-bold text-white">Pilih Nominal Top Up</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
                      {selectedGame.items.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 relative overflow-hidden group/item ${
                            selectedItem?.id === item.id 
                              ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(124,58,237,0.3)] scale-[1.02]' 
                              : 'bg-dark border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                          }`}
                        >
                           {selectedItem?.id === item.id && (
                              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold shadow-md">
                                <span className="animate-pulse">DIPILIH</span>
                              </div>
                           )}
                          <div className="flex flex-col h-full justify-between">
                              <p className="font-bold text-sm text-white group-hover/item:text-primary transition-colors">{item.name}</p>
                              <p className="text-xs text-gray-400 mt-3 font-mono">Rp {Number(item.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Payment */}
                  <div className="bg-secondary rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-black text-white">3</span>
                    </div>
                    <div className="flex items-center mb-6 relative z-10">
                      <span className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 text-lg shadow-lg shadow-primary/30">3</span>
                      <h3 className="text-xl font-bold text-white">Pilih Pembayaran</h3>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      {/* Option 1: Bagibagi.co */}
                      <div 
                        onClick={() => setPaymentMethod('bagibagi')}
                        className={`relative rounded-xl p-5 flex items-center justify-between cursor-pointer border-2 transition-all duration-200 ${
                          paymentMethod === 'bagibagi' 
                            ? 'bg-dark border-primary shadow-[0_0_15px_rgba(124,58,237,0.2)]' 
                            : 'bg-dark border-gray-700 hover:border-gray-600 opacity-80 hover:opacity-100'
                        }`}
                      >
                         {paymentMethod === 'bagibagi' && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">
                              DIPILIH
                            </div>
                         )}
                         <div className="flex items-center">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 p-2 overflow-hidden shadow-sm">
                              <img src="https://www.google.com/s2/favicons?domain=bagibagi.co&sz=128" alt="Bagibagi" className="w-full h-full object-contain" />
                            </div>
                            <div>
                             <p className="font-bold text-white text-base">QRIS / E-Wallet / VA</p>
                             <p className="text-xs text-gray-400 mt-0.5">Verifikasi Otomatis via Bagibagi.co</p>
                             <div className="flex gap-2 mt-2">
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">QRIS</span>
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">DANA</span>
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">GOPAY</span>
                             </div>
                           </div>
                         </div>
                         <div className="text-right pl-4">
                           <p className="text-xs text-gray-400 mb-1">Total:</p>
                           <p className="font-bold text-accent text-xl">
                             {selectedItem ? `Rp ${Number(selectedItem.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}
                           </p>
                         </div>
                      </div>

                      {/* Option 2: WhatsApp Admin */}
                      <div 
                        onClick={() => setPaymentMethod('whatsapp')}
                        className={`relative rounded-xl p-5 flex items-center justify-between cursor-pointer border-2 transition-all duration-200 ${
                          paymentMethod === 'whatsapp' 
                            ? 'bg-dark border-primary shadow-[0_0_15px_rgba(124,58,237,0.2)]' 
                            : 'bg-dark border-gray-700 hover:border-gray-600 opacity-80 hover:opacity-100'
                        }`}
                      >
                         {paymentMethod === 'whatsapp' && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">
                              DIPILIH
                            </div>
                         )}
                         <div className="flex items-center">
                           <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 text-white font-bold shadow-lg shadow-green-500/20">
                             <MessageCircle className="w-7 h-7" />
                           </div>
                           <div>
                             <p className="font-bold text-white text-base">WhatsApp Admin</p>
                             <p className="text-xs text-gray-400 mt-0.5">Transfer Manual & Chat Admin</p>
                             <div className="flex gap-2 mt-2">
                                <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/30">BCA</span>
                                <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/30">MANDIRI</span>
                             </div>
                           </div>
                         </div>
                         <div className="text-right pl-4">
                           <p className="text-xs text-gray-400 mb-1">Total:</p>
                           <p className="font-bold text-accent text-xl">
                             {selectedItem ? `Rp ${Number(selectedItem.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}
                           </p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Checkout Button */}
                  <button 
                    onClick={handleCheckout}
                    disabled={!selectedItem}
                    className={`w-full font-bold py-4 rounded-xl shadow-xl transform transition-all duration-200 text-lg flex items-center justify-center ${
                        selectedItem 
                        ? 'bg-accent hover:bg-yellow-400 text-black hover:-translate-y-1 shadow-accent/20' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="mr-2 h-6 w-6" />
                    {selectedItem ? 'Pesan Sekarang' : 'Pilih Nominal Terlebih Dahulu'}
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer onAdminClick={() => setView('admin')} />
    </div>
  );
}
