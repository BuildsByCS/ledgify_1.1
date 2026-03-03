'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../components/lib/api';
import { Send, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';

export default function TransactionsPage() {
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
    const [accounts, setAccounts] = useState([]);
    const [copied, setCopied] = useState(false);
    const selectedFrom = watch('from');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get('/api/accounts');
                setAccounts(res.data?.accounts || res.data || []);
            } catch (err) {
                console.error('Could not fetch accounts for dropdown', err);
            }
        };
        fetchAccounts();
    }, []);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setStatus(null);
        let res;
        try {
            // Build payload as a plain object (NOT useState — state updates are async,
            // reading state right after setX gives the OLD value, not the new one)
            const payload = {
                fromAccount: data.from,
                toAccount: data.to,
                amount: Number(data.amount),
                idempotencyKey: crypto.randomUUID(),
            };
            console.log('Transaction payload:', payload);
            res = await api.post('/api/transactions', payload);
            setStatus({ type: 'success', message: 'Transaction successful! Ledger updated.' });
            reset();
        } catch (err) {
            console.error(err);
            console.log(res);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Transaction failed. Please check account IDs and balance.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsLoading(false);
            // clear success message after 5 seconds
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Transfer Funds</h1>
                <p className="text-gray-400 mt-2">Send money securely via the ledger system.</p>
            </header>

            <div className="bg-[#12183b] p-8 rounded-2xl border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    {status?.type === 'success' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-300">Success</p>
                                <p className="text-sm text-green-200/80">{status.message}</p>
                            </div>
                        </div>
                    )}

                    {status?.type === 'error' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{status.message}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Sender */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">From Account (sender)</label>
                            {accounts.length > 0 ? (
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                                    {...register('from', { required: 'Please select an account' })}
                                >
                                    <option value="" className="bg-[#0c0f23]">Select your account...</option>
                                    {accounts.map(acc => (
                                        <option key={acc._id} value={acc._id} className="bg-[#0c0f23] cursor-pointer user-select-all">
                                            {acc._id} - ${acc.balance} ({acc.status})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Enter your source account ID"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
                                    {...register('from', { required: 'Sender Account ID is required' })}
                                />
                            )}
                            {errors.from && <p className="text-xs text-red-400">{errors.from.message}</p>}

                            {/* Copyable account ID strip — shown when an account is selected */}
                            {selectedFrom && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedFrom);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="mt-1 w-full flex items-center justify-between gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 transition-all group"
                                    title="Click to copy account ID"
                                >
                                    <span className="font-mono text-xs text-gray-400 truncate">{selectedFrom}</span>
                                    <span className={`shrink-0 text-xs font-medium transition-colors ${copied ? 'text-green-400' : 'text-gray-500 group-hover:text-indigo-400'}`}>
                                        {copied ? '✓ Copied!' : 'Copy ID'}
                                    </span>
                                </button>
                            )}
                        </div>

                        <div className="flex justify-center -my-2 opacity-50 relative z-20 pointer-events-none">
                            <div className="bg-[#0c0f23] p-2 rounded-full border border-white/10">
                                <ArrowRightLeft className="w-5 h-5 text-indigo-400 rotate-90" />
                            </div>
                        </div>

                        {/* Receiver */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">To Account (receiver)</label>
                            <input
                                type="text"
                                placeholder="Enter destination account ID"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
                                {...register('to', { required: 'Receiver Account ID is required' })}
                            />
                            {errors.to && <p className="text-xs text-red-400">{errors.to.message}</p>}
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Amount</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-400 sm:text-lg">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg font-mono placeholder:text-gray-600"
                                    {...register('amount', {
                                        required: 'Amount is required',
                                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                                    })}
                                />
                            </div>
                            {errors.amount && <p className="text-xs text-red-400">{errors.amount.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 group"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span>Processing Ledger...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                <span>Execute Transfer</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
