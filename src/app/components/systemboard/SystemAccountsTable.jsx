'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Snowflake, Wallet, AlertCircle, Search } from 'lucide-react';
import api from '../lib/api';
import SystemAccountDetailModal from './SystemAccountDetailModal';

function getStatusIcon(status) {
    switch (status?.toLowerCase()) {
        case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
        case 'frozen': return <Snowflake className="w-4 h-4 text-blue-400" />;
        case 'closed': return <XCircle className="w-4 h-4 text-red-400" />;
        default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
}

export default function SystemAccountsTable({ accounts, loading, error }) {
    const [localAccounts, setLocalAccounts] = useState(accounts);
    const [accountBalanceMap, setAccountBalanceMap] = useState({});
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { setLocalAccounts(accounts); }, [accounts]);

    const handleRowClick = async (acc) => {
        // Fetch balance just in time for selected account to display in modal
        setSelectedAccount(acc);
        try {
            const balanceRes = await api.get(`/api/accounts/userbalance/${acc._id}`);
            setAccountBalanceMap(prev => ({...prev, [acc._id]: balanceRes.data.balance}));
        } catch {}
    };

    const handleStatusChange = (accountId, newStatus) => {
        setLocalAccounts((prev) =>
            prev.map((a) => (a._id === accountId ? { ...a, status: newStatus } : a))
        );
        setSelectedAccount((prev) => (prev?._id === accountId ? { ...prev, status: newStatus } : prev));
    };

    const filteredAccounts = localAccounts.filter(acc => 
        acc._id.toLowerCase().includes(search.toLowerCase()) || 
        acc.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
        acc.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-[#05070e] rounded-3xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 shadow-2xl">
            <div className="p-[clamp(0.875rem,2vw,1.5rem)] border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
                <h2 className="mid-text font-medium text-white">Platform Accounts</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search users or ID..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0c0f23] border border-white/10 rounded-xl pl-9 pr-3 py-2 small-text text-white focus:outline-none focus:border-indigo-500/50"
                    />
                </div>
            </div>

            <div className="p-[clamp(0.875rem,2vw,1.5rem)]">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500/50" />
                        <p className="text-red-400 small-text">{error}</p>
                    </div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group hover:bg-white/10 transition-all">
                            <Wallet className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="mid-text font-medium text-gray-300">No matching accounts</p>
                            <p className="small-text mt-1">{search ? "Try adjusting your search" : "No accounts found on platform"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="small-text text-gray-400 border-b border-white/5">
                                    <th className="pb-3 px-[clamp(0.5rem,1.5vw,1rem)] font-medium uppercase tracking-wider">Account ID</th>
                                    <th className="pb-3 px-[clamp(0.5rem,1.5vw,1rem)] font-medium uppercase tracking-wider">User</th>
                                    <th className="pb-3 px-[clamp(0.5rem,1.5vw,1rem)] font-medium uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAccounts.map((acc, idx) => (
                                    <tr
                                        key={acc._id || idx}
                                        className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                                        onClick={() => handleRowClick(acc)}
                                    >
                                        <td className="small-text py-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-mono text-indigo-300 group-hover:text-indigo-200 transition-colors truncate max-w-[150px]">
                                            {acc._id}
                                        </td>
                                        <td className="py-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)]">
                                            <div className="flex flex-col">
                                                <span className="small-text text-white font-medium">{acc.user?.name || '-'}</span>
                                                <span className="text-[10px] text-gray-500">{acc.user?.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)]">
                                            <span className="small-text flex items-center gap-2 capitalize text-gray-300">
                                                {getStatusIcon(acc.status)}
                                                {acc.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <SystemAccountDetailModal
                account={selectedAccount}
                balance={selectedAccount ? accountBalanceMap[selectedAccount._id] : null}
                onClose={() => setSelectedAccount(null)}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
