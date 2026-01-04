import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TransactionCheck({ initialTransactionId }) {
  const [searchInvoice, setSearchInvoice] = useState(initialTransactionId || '');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from API
  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto search if initialTransactionId is provided
  useEffect(() => {
    if (initialTransactionId) {
      handleSearch(null, initialTransactionId);
    }
  }, [initialTransactionId]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e, idOverride = null) => {
    if (e) e.preventDefault();
    const idToSearch = idOverride || searchInvoice;
    
    if (!idToSearch) return;
    
    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/transactions/${idToSearch}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        setSearchResult('not_found');
      }
    } catch (error) {
      console.error('Error searching transaction:', error);
      setSearchResult('not_found');
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
      return dateString;
    }
  };

  const sensorPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    return phone.substring(0, 4) + '****' + phone.substring(phone.length - 3);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Waiting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Failed': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'Processing': return <Clock className="w-4 h-4 mr-1 animate-spin" />;
      case 'Waiting': return <Clock className="w-4 h-4 mr-1" />;
      case 'Failed': return <XCircle className="w-4 h-4 mr-1" />;
      default: return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Cek Transaksi</h1>

      {/* Search Section */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="bg-secondary p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Cari Pesanan Kamu</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan Nomor Invoice (Contoh: DS...)"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              className="flex-1 bg-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-primary hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Mencari...' : 'Cari'}
            </button>
          </form>

          {/* Search Result */}
          {searchResult && searchResult !== 'not_found' && (
             <div className="mt-6 p-4 bg-dark rounded-lg border border-gray-600 animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <p className="text-xs text-gray-400">No. Invoice</p>
                      <p className="font-mono font-bold text-white">{searchResult.id}</p>
                   </div>
                   <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center ${getStatusColor(searchResult.status)}`}>
                      {getStatusIcon(searchResult.status)}
                      {searchResult.status}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div>
                      <p className="text-xs text-gray-400">Game</p>
                      <p className="font-semibold">{searchResult.game_name}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-400">Item</p>
                      <p className="font-semibold">{searchResult.item_name}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-400">Harga</p>
                      <p className="font-semibold">Rp {searchResult.price.toLocaleString('id-ID')}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-400">Tanggal</p>
                      <p className="text-sm">{formatDate(searchResult.created_at)}</p>
                   </div>
                </div>
             </div>
          )}
          
          {searchResult === 'not_found' && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-red-400">
                  Transaksi tidak ditemukan. Mohon cek kembali nomor invoice anda.
              </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-secondary rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <Clock className="mr-2 text-accent" />
            10 Transaksi Terakhir
          </h2>
          <div className="flex items-center space-x-2 text-sm">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-gray-400">Live Update</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-400">Memuat data...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-dark text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">No. Invoice</th>
                  <th className="px-6 py-4">No. Handphone</th>
                  <th className="px-6 py-4">Game</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-sm">
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDate(trx.created_at)}</td>
                    <td className="px-6 py-4 font-mono text-primary whitespace-nowrap">
                      {trx.id.substring(0, 4)}****{trx.id.substring(trx.id.length - 4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{sensorPhone(trx.phone)}</td>
                    <td className="px-6 py-4 font-medium text-white">{trx.game_name}</td>
                    <td className="px-6 py-4 text-gray-300">{trx.item_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {Number(trx.final_price || trx.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(trx.status)}`}>
                        {getStatusIcon(trx.status)}
                        {trx.status === 'Waiting' ? 'Menunggu Pembayaran' : 
                         trx.status === 'Processing' ? 'Sedang Diproses' : 
                         trx.status === 'Failed' ? 'Gagal' : 
                         trx.status === 'Success' ? 'Berhasil' : trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Belum ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
