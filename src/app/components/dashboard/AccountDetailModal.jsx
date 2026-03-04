'use client';

import { useEffect, useState, useRef } from 'react';
import {
    X, TrendingUp, TrendingDown, Clock, CreditCard, AlertCircle,
} from 'lucide-react';
import api from '../lib/api';
import { useSelector } from 'react-redux';
import { CopyButton, StatusBadge } from './DashboardHelpers';

/* helpers — CopyButton & StatusBadge are imported from DashboardHelpers */

/* status toggle switch */
function StatusToggle({ currentStatus, accountId, onStatusChange }) {
    const isActive = currentStatus === 'ACTIVE';
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'ok' | 'err'

    const toggle = async () => {
        const newStatus = isActive ? 'CLOSED' : 'ACTIVE';
        setLoading(true);
        setFeedback(null);
        try {
            const statusChanged = await api.post(`/api/accounts/update-status?accountId=${accountId}&status=${newStatus}`);
            console.log(statusChanged);
            onStatusChange(newStatus);
            setFeedback('ok');
        } catch {
            setFeedback('err');
        } finally {
            setLoading(false);
            setTimeout(() => setFeedback(null), 2500);
        }
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <span className="small-text text-gray-500 font-medium">
                {isActive ? 'Close Account' : 'Activate Account'}
            </span>

            {/* pill toggle */}
            <button
                onClick={toggle}
                disabled={loading}
                aria-label="Toggle account status"
                className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full border transition-all duration-300 flex-shrink-0
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isActive
                        ? 'bg-green-500/20 border-green-500/40'
                        : 'bg-red-500/10   border-red-500/30'
                    }`}
            >
                <span
                    className={`absolute top-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow transition-all duration-300
                        ${isActive
                            ? 'left-[calc(100%-1.125rem)] sm:left-[calc(100%-1.375rem)] bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                            : 'left-0.5 bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'
                        }`}
                >
                    {loading && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                        </span>
                    )}
                </span>
            </button>

            {/* inline feedback */}
            {feedback === 'ok' && <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />}
            {feedback === 'err' && <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />}
        </div>
    );
}


/* main component */

/**
 * AccountDetailModal
 * Props:
 *   account  {object|null}  — clicked account; null = closed
 *   balance  {number|null}
 *   onClose  {fn}
 *   onStatusChange {fn}  — (accountId, newStatus) => void  (so table row can update)
 */
export default function AccountDetailModal({ account, balance, onClose, onStatusChange }) {
    const { user } = useSelector((state) => state.auth);
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(false);
    const [txLoadingMore, setTxLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [localStatus, setLocalStatus] = useState(null);
    const scrollBodyRef = useRef(null);

    /* sync local status whenever a new account is opened */
    useEffect(() => { setLocalStatus(account?.status ?? null); }, [account]);

    /* lock body scroll while modal is open */
    useEffect(() => {

        if (!account) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => { document.body.style.overflow = prev; };

    }, [account]);

    /*
     * Stop Lenis from intercepting wheel events inside the modal body.
     */
    useEffect(() => {
        const el = scrollBodyRef.current;

        if (!el || !account) return;
        const block = (e) => { e.stopPropagation(); };
        el.addEventListener('wheel', block, { passive: true, capture: true });

        return () => el.removeEventListener('wheel', block, { capture: true });

    }, [account]);


    /* close on Escape */
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);

    }, [onClose]);


    /* fetch page 1 whenever a new account is opened */
    useEffect(() => {

        if (!account) { setTransactions([]); setPage(1); setTotalPages(1); return; }

        const load = async () => {
            setTxLoading(true);
            try {
                const res = await api.get(
                    `/api/accounts/ledger-list?accountId=${account._id}&page=1&limit=10`
                );
                setTransactions(res.data?.transactions ?? []);
                setPage(1);
                setTotalPages(res.data?.pagination?.totalPages ?? 1);
            } catch {
                setTransactions([]);
            } finally {
                setTxLoading(false);
            }
        };
        load();

    }, [account]);

    /* next page */
    const loadMore = async () => {

        if (txLoadingMore || page >= totalPages) return;
        const nextPage = page + 1;
        setTxLoadingMore(true);

        try {
            const res = await api.get(
                `/api/accounts/ledger-list?accountId=${account._id}&page=${nextPage}&limit=10`
            );
            setTransactions((prev) => [...prev, ...(res.data?.transactions ?? [])]);
            setPage(nextPage);
            setTotalPages(res.data?.pagination?.totalPages ?? totalPages);
        } catch {
            // silently fail
        } finally {
            setTxLoadingMore(false);
        }

    };

    if (!account) return null;

    const currency = account.currency === 'INR' ? '₹' : '$';
    const createdAt = account.createdAt
        ? new Date(account.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    const handleStatusChange = (newStatus) => {
        setLocalStatus(newStatus);
        onStatusChange?.(account._id, newStatus);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-[clamp(0.5rem,3vw,1.5rem)]"
            onClick={onClose}
        >
            {/* blur overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* panel, flex column so header & footer are sticky, only body scrolls */}
            <div
                className="relative mt-[clamp(5rem,5vw,9rem)] z-10 w-full max-w-lg h-[clamp(26rem,72vh,38rem)] bg-[#0c0f23] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >

                {/* sticky header */}
                <div className="flex items-start justify-between  p-[clamp(0.875rem,3vw,1.5rem)] pb-[clamp(0.5rem,1.5vw,1rem)] flex-shrink-0">
                    <div className="flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)]">
                        {/* icon */}
                        <div className="w-[clamp(2rem,4vw,2.5rem)] h-[clamp(2rem,4vw,2.5rem)] rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                            <CreditCard className="w-[clamp(0.875rem,2vw,1.25rem)] h-[clamp(0.875rem,2vw,1.25rem)]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                                <p className="base-text text-gray-400 font-medium">Account Details</p>
                                <StatusBadge status={localStatus} variant="icon" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-[clamp(1.75rem,4vw,2rem)] h-[clamp(1.75rem,4vw,2rem)] rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
                    >
                        <X className="w-[clamp(0.75rem,2vw,1rem)] h-[clamp(0.75rem,2vw,1rem)]" />
                    </button>
                </div>

                <div className="mx-[clamp(0.875rem,3vw,1.5rem)] h-px bg-white/5 flex-shrink-0" />

                {/* scrollable body */}
                <div
                    ref={scrollBodyRef}
                    className="flex-1 overflow-y-auto p-[clamp(0.875rem,3vw,1.5rem)] pt-[clamp(0.5rem,1.5vw,1rem)] space-y-[clamp(0.75rem,2vw,1.25rem)] min-h-0"
                    style={{ overscrollBehavior: 'contain' }}
                >

                    {/* account id */}
                    <div>
                        <p className="small-text text-gray-500 uppercase tracking-wider font-medium mb-1">Account ID</p>
                        <div className="flex items-center font-mono small-text text-indigo-300 bg-indigo-500/5 border border-indigo-500/10 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] break-all">
                            <span className="flex-1 truncate">{account._id}</span>
                            <CopyButton text={account._id} />
                        </div>
                    </div>

                    {/* account holder */}
                    <div>
                        <p className="small-text text-gray-500 uppercase tracking-wider font-medium mb-1">Account Holder</p>
                        <div className="flex items-center font-mono small-text text-gray-500 bg-white/[0.03] border border-indigo-500/10 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] break-all">
                            {user?.name && (
                                <p className="small-text text-gray-500">
                                    <span className="text-gray-200 font-medium">{user.name}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* balance & currency */}
                    <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.5vw,0.75rem)]">
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-[clamp(0.625rem,2vw,1rem)]">
                            <p className="small-text text-gray-500 font-medium mb-0.5 sm:mb-1">Balance</p>
                            <p className="mid-text font-bold text-white font-mono">
                                {currency}{balance != null ? Number(balance).toFixed(2) : '—'}
                            </p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-[clamp(0.625rem,2vw,1rem)]">
                            <p className="small-text text-gray-500 font-medium mb-0.5 sm:mb-1">Currency</p>
                            <p className="mid-text font-bold text-white">{account.currency ?? 'INR'}</p>
                        </div>
                    </div>

                    {/* status toggle */}
                    <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-2xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)]">
                        <div className="flex items-center gap-2 small-text text-gray-400">
                            <span>Account Status</span>
                        </div>
                        <StatusToggle
                            currentStatus={localStatus}
                            accountId={account._id}
                            onStatusChange={handleStatusChange}
                        />
                    </div>

                    {/* opened date */}
                    <div className="flex items-center gap-[clamp(0.375rem,1vw,0.5rem)] small-text text-gray-500">
                        <Clock className="w-[clamp(0.75rem,2vw,0.875rem)] h-[clamp(0.75rem,2vw,0.875rem)] flex-shrink-0" />
                        <span>Opened on <span className="text-gray-300">{createdAt}</span></span>
                    </div>

                    {/* transactions */}
                    <div>
                        <div className="flex items-center justify-between mb-[clamp(0.5rem,1.5vw,0.75rem)]">
                            <p className="small-text text-gray-500 uppercase tracking-wider font-medium">
                                Transactions
                            </p>
                            {!txLoading && transactions.length > 0 && (
                                <p className="text-gray-600 small-text">
                                    {page} of {totalPages} pages
                                </p>
                            )}
                        </div>

                        {txLoading ? (
                            <div className="flex justify-center py-[clamp(1rem,3vw,1.5rem)]">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-indigo-500 rounded-full animate-spin" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <p className="small-text text-gray-600 text-center py-[clamp(0.75rem,2vw,1rem)]">No transactions yet.</p>
                        ) : (
                            <div className="space-y-[clamp(0.375rem,1vw,0.5rem)]">
                                {transactions.map((tx, i) => {
                                    const isCredit = tx.type?.toUpperCase() === 'CREDIT';
                                    const date = new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                                    const time = new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                                    return (
                                        <div
                                            key={tx.transaction ?? i}
                                            className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] transition-colors"
                                        >
                                            <div className="flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)]">
                                                <div className={`w-[clamp(1.5rem,3vw,1.75rem)] h-[clamp(1.5rem,3vw,1.75rem)] rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                                    {isCredit
                                                        ? <TrendingUp className="w-[clamp(0.75rem,2vw,0.875rem)] h-[clamp(0.75rem,2vw,0.875rem)]" />
                                                        : <TrendingDown className="w-[clamp(0.75rem,2vw,0.875rem)] h-[clamp(0.75rem,2vw,0.875rem)]" />}
                                                </div>
                                                <div>
                                                    <p className="small-text font-medium capitalize" style={{ color: isCredit ? '#4ade80' : '#f87171' }}>
                                                        {tx.type?.toLowerCase()}
                                                    </p>
                                                    <p className="small-text text-gray-600" style={{ fontSize: 'var(--text-xs)' }}>{date} · {time}</p>
                                                </div>
                                            </div>
                                            <p className={`font-mono small-text font-bold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                                                {isCredit ? '+' : '−'}{currency}{Number(tx.amount).toLocaleString()}
                                            </p>
                                        </div>
                                    );
                                })}

                                {/* load more */}
                                {page < totalPages && (
                                    <button
                                        onClick={loadMore}
                                        disabled={txLoadingMore}
                                        className="w-full mt-1 py-[clamp(0.5rem,1.5vw,0.625rem)] rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] small-text text-gray-500 hover:text-gray-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {txLoadingMore
                                            ? <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-t border-indigo-400 rounded-full animate-spin" /> Loading...</>
                                            : `Load more  (page ${page + 1} / ${totalPages})`
                                        }
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {/* sticky footer */}
                <div className="px-[clamp(0.875rem,3vw,1.5rem)] pb-[clamp(0.75rem,2vw,1.25rem)] pt-[clamp(0.5rem,1.5vw,0.75rem)] flex-shrink-0 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full small-text font-medium py-[clamp(0.5rem,1.5vw,0.75rem)] rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
