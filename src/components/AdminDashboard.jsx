import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Trash2, LogOut, Search, Filter } from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Use limit=-1 to get all transactions
      const response = await fetch(`http://localhost:3000/api/transactions?limit=-1&t=${Date.now()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple hardcoded password
      setIsAuthenticated(true);
      fetchTransactions();
    } else {
      alert('Password salah!');
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;
    
    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:3000/api/transactions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Jika filter aktif dan status berubah sehingga item hilang, reset filter ke All
        if (filterStatus !== 'All' && filterStatus !== newStatus) {
            setFilterStatus('All');
        }
        await fetchTransactions(); // Refresh data
        // alert('Status berhasil diupdate!'); // Optional feedback
      } else {
        const errorData = await response.json();
        alert(`Gagal update status: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error updating status: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const deleteTransaction = async (id) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchTransactions(); // Refresh data
      } else {
        alert('Gagal menghapus');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const status = t.status || 'Waiting'; // Treat empty status as Waiting
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm) ||
      t.game_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark p-4">
        <div className="bg-secondary p-8 rounded-xl border border-gray-700 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="Masukkan password admin"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-2 rounded-lg transition-colors"
            >
              Masuk
            </button>
            <button
                type="button"
                onClick={onLogout}
                className="w-full text-gray-500 hover:text-white text-sm mt-2"
            >
                Kembali ke Beranda
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTransactions}
              className="p-2 bg-secondary rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">Total Transaksi</p>
            <p className="text-3xl font-bold text-white mt-1">{transactions.length}</p>
          </div>
          <div className="bg-secondary p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">Menunggu Pembayaran</p>
            <p className="text-3xl font-bold text-yellow-500 mt-1">
              {transactions.filter(t => t.status === 'Waiting').length}
            </p>
          </div>
          <div className="bg-secondary p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">Sedang Diproses</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">
              {transactions.filter(t => t.status === 'Processing').length}
            </p>
          </div>
          <div className="bg-secondary p-6 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">Total Pendapatan (Sukses)</p>
            <p className="text-3xl font-bold text-green-500 mt-1">
              Rp {transactions
                .filter(t => t.status === 'Success')
                .reduce((acc, curr) => acc + Number(curr.final_price || 0), 0)
                .toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID, No. HP, atau Game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-secondary border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="All">Semua Status</option>
              <option value="Waiting">Waiting</option>
              <option value="Processing">Processing</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-secondary rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-dark/50 border-b border-gray-700">
                  <th className="p-4 font-semibold text-sm text-gray-400">Invoice ID</th>
                  <th className="p-4 font-semibold text-sm text-gray-400">Game / Item</th>
                  <th className="p-4 font-semibold text-sm text-gray-400">Harga</th>
                  <th className="p-4 font-semibold text-sm text-gray-400">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-dark/30 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm text-primary">{transaction.id}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(transaction.created_at).toLocaleString('id-ID')}</div>
                      <div className="text-xs text-gray-400 mt-1">{transaction.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{transaction.game_name}</div>
                      <div className="text-sm text-gray-400">{transaction.item_name}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-accent">
                        Rp {Number(transaction.final_price || transaction.price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[10px] text-yellow-500/80 mt-1 font-mono">
                        Kode: {transaction.unique_code}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'Success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        transaction.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        transaction.status === 'Failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {transaction.status || 'Waiting'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {(transaction.status === 'Waiting' || !transaction.status) && (
                          <button
                            onClick={() => updateStatus(transaction.id, 'Processing')}
                            disabled={processingId === transaction.id}
                            className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded hover:bg-blue-500/20 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === transaction.id ? 'Memproses...' : 'Proses'}
                          </button>
                        )}
                        
                        {transaction.status === 'Processing' && (
                           <div className="flex gap-2">
                              <button
                                onClick={() => updateStatus(transaction.id, 'Success')}
                                disabled={processingId === transaction.id}
                                className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded hover:bg-green-500/20 text-xs font-medium transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === transaction.id ? '...' : 'Selesai'}
                              </button>
                              <button
                                onClick={() => updateStatus(transaction.id, 'Failed')}
                                disabled={processingId === transaction.id}
                                className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 text-xs font-medium transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === transaction.id ? '...' : 'Gagal'}
                              </button>
                           </div>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
                              deleteTransaction(transaction.id);
                            }
                          }}
                          className="px-3 py-1 text-gray-500 hover:text-white text-xs transition-colors text-left"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;