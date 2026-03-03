'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Snowflake, Wallet, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../lib/api';
import AccountDetailModal from './AccountDetailModal';

function getStatusIcon(status) {
    switch (status?.toLowerCase()) {
        case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
        case 'frozen': return <Snowflake className="w-4 h-4 text-blue-400" />;
        case 'closed': return <XCircle className="w-4 h-4 text-red-400" />;
        default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
}

/**
 * AccountsTable
 * Props:
 *   accounts {Array}
 *   loading  {boolean}
 *   error    {string|null}
 */
export default function AccountsTable({ accounts, loading, error }) {
    const [accountBalance, setAccountBalance] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedBalance, setSelectedBalance] = useState(null);

    useEffect(() => {
        accounts.forEach(async (account) => {
            const balance = await api.get(`/api/accounts/balance/${account._id}`);
            setAccountBalance((prev) => [...prev, balance.data.balance]);
        });
    }, [accounts])

    const handleRowClick = (acc, idx) => {
        setSelectedAccount(acc);
        setSelectedBalance(accountBalance[idx] ?? null);
    };

    return (
        <div className=" bg-[#05070e] rounded-3xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 shadow-2xl">
            {/* Table header bar */}
            <div className="p-[clamp(0.875rem,2vw,1.5rem)] border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="mid-text font-medium">Your Accounts</h2>
                <Link
                    href="/dashboard/create-account"
                    className="small-text flex items-center gap-1 sm:gap-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all font-medium border border-indigo-500/30"
                >
                    <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>New Account</span>
                </Link>
            </div>

            <div className="p-[clamp(0.875rem,2vw,1.5rem)]">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500/50" />
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group hover:bg-white/10 transition-all">
                            <Wallet className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="mid-text font-medium text-gray-300">No accounts found</p>
                            <p className="small-text mt-1">Create an account to start managing your funds.</p>
                        </div>
                        <Link
                            href="/dashboard/create-account"
                            className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                        >
                            Create Account
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="small-text text-gray-400 border-b border-white/5">
                                    <th className="pb-3 px-[clamp(0.5rem,1.5vw,1rem)] font-medium uppercase tracking-wider">Account ID</th>
                                    <th className="pb-3 px-[clamp(0.5rem,1.5vw,1rem)] font-medium uppercase tracking-wider">Status</th>
                                    <th className="pb-3 px-[clamp(0.5rem,1.5vw,1rem)] font-medium uppercase tracking-wider text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {accounts.map((acc, idx) => (
                                    <tr
                                        key={acc._id || idx}
                                        className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                                        onClick={() => handleRowClick(acc, idx)}
                                    >
                                        <td className="small-text py-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-mono text-indigo-300 group-hover:text-indigo-200 transition-colors">
                                            {acc._id}
                                        </td>
                                        <td className="py-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)]">
                                            <span className="small-text flex items-center gap-2 sm:gap-4 capitalize">
                                                {getStatusIcon(acc.status)}
                                                {acc.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="small-text py-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] text-right font-mono whitespace-nowrap font-medium text-white">
                                            {acc.currency === 'INR' ? '₹' : '$'} {accountBalance[idx]?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Account detail modal */}
            <AccountDetailModal
                account={selectedAccount}
                balance={selectedBalance}
                onClose={() => setSelectedAccount(null)}
                onStatusChange={(id, newStatus) => {
                    // keep selectedAccount in sync so badge updates immediately
                    setSelectedAccount((prev) => prev ? { ...prev, status: newStatus } : prev);
                }}
            />
        </div>
    );
}

