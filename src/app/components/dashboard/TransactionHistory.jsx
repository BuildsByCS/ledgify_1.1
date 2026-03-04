'use client';

import { useState, useEffect, useRef } from 'react';
import {
    TrendingUp, TrendingDown, History, ChevronDown,
    ArrowRightLeft, Clock, Hash,
} from 'lucide-react';
import api from '../lib/api';
import { CopyButton } from './DashboardHelpers';

/* ─────────────────────── AccountPicker ─────────────────────── */
function AccountPicker({ accounts, value, onChange, placeholder = 'Select an account…' }) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-[clamp(0.625rem,2vw,1rem)] flex items-center">
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ background: 'rgba(99,102,241,0.05)' }}
                className="w-full font-mono small-text text-indigo-300 border border-white/8 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer hover:border-indigo-500/30"
            >
                <option value="" className="bg-[#0c0f23] text-gray-400">
                    {placeholder}
                </option>
                {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id} className="bg-[#0c0f23] text-indigo-300">
                        {acc._id}  ·  {acc.status}  ·  {acc.currency}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* ─────────────────────── TxRow ─────────────────────── */
function TransactionRow({ tx, currency }) {
    const isCredit = tx.type?.toUpperCase() === 'CREDIT';
    const date = new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const txId = tx.transaction?._id ?? tx.transaction ?? '—';
    const peerLabel = isCredit ? 'From' : 'To';
    const peerId = isCredit
        ? (tx.transaction?.fromAccount ?? '—')
        : (tx.transaction?.toAccount ?? '—');

    return (
        <div className="group flex flex-col gap-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-3 sm:px-[clamp(0.75rem,2vw,1.125rem)] sm:py-[clamp(0.75rem,2vw,1.125rem)] transition-colors">

            {/* ── Row 1: icon + type + amount ── */}
            <div className="flex items-center gap-2.5 sm:gap-[clamp(0.5rem,1.5vw,0.75rem)]">
                {/* icon */}
                <div className={`w-[clamp(1.75rem,3.5vw,2rem)] h-[clamp(1.75rem,3.5vw,2rem)] rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {isCredit
                        ? <TrendingUp className="w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)]" />
                        : <TrendingDown className="w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)]" />
                    }
                </div>

                <p className="base-text font-semibold capitalize flex-1" style={{ color: isCredit ? '#4ade80' : '#f87171' }}>
                    {tx.type?.toLowerCase()}
                </p>

                <p className={`font-mono small-text font-bold flex-shrink-0 ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                    {isCredit ? '+' : '−'}{currency}{Number(tx.amount).toLocaleString('en-IN')}
                </p>
            </div>

            {/* ── Row 2: metadata ── */}
            <div className="flex flex-col gap-2 pl-0 sm:pl-[clamp(2.25rem,5vw,2.75rem)]">

                {/* datetime */}
                <div className="flex items-center gap-1.5">
                    <Clock className="w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)] text-gray-600 flex-shrink-0" />
                    <p className="small-text text-gray-500 leading-tight">{date} · {time}</p>
                </div>

                {/* peer account */}
                <div className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)] text-gray-600 flex-shrink-0" />
                    <span className="small-text text-gray-500 flex-shrink-0">{peerLabel}:</span>
                    <span className="small-text font-mono text-gray-400 truncate max-w-[14rem] group-hover:text-indigo-300/70 transition-colors">{peerId}</span>
                    {peerId !== '—' && <CopyButton text={peerId} />}
                </div>

                {/* tx id */}
                <div className="flex items-center gap-1.5">
                    <Hash className="w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)] text-gray-600 flex-shrink-0" />
                    <span className="small-text font-mono text-gray-600 truncate max-w-[14rem]">{txId}</span>
                    {txId !== '—' && <CopyButton text={txId} />}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────── TransactionHistory (main export) ─────────────────────── */
/**
 * Props:
 *   myAccounts  {array}  — user's own accounts (passed from parent to avoid refetch)
 */
export default function TransactionHistory({ myAccounts = [] }) {
    const [selectedId, setSelectedId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null); // full pagination object from API
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    /* Stop Lenis from intercepting wheel events inside the scroll area */
    // useEffect(() => {
    //     const el = scrollRef.current;
    //     if (!el) return;
    //     const block = (e) => { e.stopPropagation(); };
    //     el.addEventListener('wheel', block, { passive: true, capture: true });
    //     return () => el.removeEventListener('wheel', block, { capture: true });
    // }, []);

    /* Fetch page 1 whenever account changes */
    useEffect(() => {
        if (!selectedId) {
            setTransactions([]);
            setPagination(null);
            setPage(1);
            setError(null);
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/api/transactions?accountId=${selectedId}&page=1&limit=10`);
                const raw = res.data?.transactions ?? [];
                const seen = new Set();
                setTransactions(raw.filter((t) => {
                    const id = t.transaction?._id ?? t.transaction;
                    if (seen.has(id)) return false;
                    seen.add(id);
                    return true;
                }));
                setPage(1);
                setPagination(res.data?.pagination ?? null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load transactions.');
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [selectedId]);

    /* Load next page */
    const loadMore = async () => {
        if (loadingMore || !pagination || page >= pagination.totalPages) return;
        const nextPage = page + 1;
        setLoadingMore(true);
        try {
            const res = await api.get(`/api/transactions?accountId=${selectedId}&page=${nextPage}&limit=10`);
            const incoming = res.data?.transactions ?? [];
            setTransactions((prev) => {
                const seen = new Set(prev.map((t) => t.transaction?._id ?? t.transaction));
                const unique = incoming.filter((t) => {
                    const id = t.transaction?._id ?? t.transaction;
                    return !seen.has(id);
                });
                return [...prev, ...unique];
            });
            setPage(nextPage);
            setPagination(res.data?.pagination ?? pagination);
        } catch {
            // silently fail on load-more
        } finally {
            setLoadingMore(false);
        }
    };

    const selectedAcc = myAccounts.find((a) => a._id === selectedId);
    const currency = selectedAcc?.currency === 'INR' ? '₹' : '$';
    const totalEntries = pagination?.totalEntries ?? 0;
    const shownCount = transactions.length;

    return (
        <div className="relative z-10 w-full pt-[clamp(4rem,6vw,6rem)] pb-[clamp(3rem,6vw,6rem)]">

            {/* ── Section header ── */}
            <div className="flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)] mb-[clamp(1rem,3vw,1.75rem)]">
                <div className="w-[clamp(2rem,4vw,2.5rem)] h-[clamp(2rem,4vw,2.5rem)] rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <History className="w-[clamp(0.875rem,2vw,1.25rem)] h-[clamp(0.875rem,2vw,1.25rem)]" />
                </div>
                <div>
                    <h2 className="mid-text font-normal text-white leading-tight">Transaction History</h2>
                    <p className="small-text text-gray-500 mt-0.5">Browse all financial activity for an account.</p>
                </div>
            </div>

            {/* ── Card container ── */}
            <div className="bg-[#0c0f23] border border-white/8 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.08)] overflow-hidden">

                {/* ── Account picker header ── */}
                <div className="flex items-end justify-between gap-4 px-[clamp(1rem,3vw,1.75rem)] py-[clamp(0.875rem,2.5vw,1.25rem)] border-b border-white/5 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                        <p className="small-text text-gray-500 uppercase tracking-wider font-medium my-[clamp(0.375rem,1vw,0.5rem)]">
                            Select Account
                        </p>
                        {myAccounts.length > 0 ? (
                            <AccountPicker
                                accounts={myAccounts}
                                value={selectedId}
                                onChange={(id) => setSelectedId(id)}
                            />
                        ) : (
                            <div className="flex items-center gap-2 py-[clamp(0.375rem,1vw,0.625rem)]">
                                <div className="w-3 h-3 border border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
                                <span className="small-text text-gray-600">Loading accounts…</span>
                            </div>
                        )}
                    </div>

                    {/* entry count pill */}
                    {pagination && !loading && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
                            <span className="text-[10px] font-semibold text-indigo-300 tabular-nums">
                                {shownCount} / {totalEntries}
                            </span>
                            <span className="text-[10px] text-indigo-400/60">entries</span>
                        </div>
                    )}
                </div>

                {/* ── Transaction list ── */}
                <div
                    ref={scrollRef}
                    className="p-[clamp(0.875rem,3vw,1.5rem)]"
                    style={{ overscrollBehavior: 'contain' }}
                >
                    {/* empty placeholder — no account selected */}
                    {!selectedId && (
                        <div className="flex flex-col items-center justify-center py-[clamp(2.5rem,8vw,4rem)] gap-[clamp(0.5rem,1.5vw,0.75rem)]">
                            <div className="w-[clamp(2.5rem,6vw,3rem)] h-[clamp(2.5rem,6vw,3rem)] rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
                                <History className="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)] text-indigo-500/50" />
                            </div>
                            <p className="small-text text-gray-600 text-center">
                                Select an account above to view its transaction history.
                            </p>
                        </div>
                    )}

                    {/* loading spinner */}
                    {selectedId && loading && (
                        <div className="flex items-center justify-center gap-2 py-[clamp(2rem,6vw,3rem)]">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                            <span className="small-text text-gray-600">Fetching transactions…</span>
                        </div>
                    )}

                    {/* error */}
                    {selectedId && !loading && error && (
                        <div className="flex items-center gap-2 py-[clamp(1rem,3vw,1.5rem)] px-[clamp(0.625rem,2vw,1rem)] bg-red-500/10 border border-red-500/20 rounded-xl">
                            <span className="small-text text-red-400">{error}</span>
                        </div>
                    )}

                    {/* no transactions */}
                    {selectedId && !loading && !error && transactions.length === 0 && (
                        <p className="small-text text-gray-600 text-center py-[clamp(1.5rem,4vw,2.5rem)]">
                            No transactions found for this account.
                        </p>
                    )}

                    {/* transaction rows */}
                    {!loading && transactions.length > 0 && (
                        <div className="space-y-[clamp(0.375rem,1vw,0.5rem)]">
                            {transactions.map((tx, i) => (
                                <TransactionRow
                                    key={`${tx.transaction?._id ?? tx.transaction ?? 'tx'}-${i}`}
                                    tx={tx}
                                    currency={currency}
                                />
                            ))}

                            {/* load more */}
                            {pagination && page < pagination.totalPages && (
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="w-full mt-[clamp(0.25rem,0.75vw,0.375rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] small-text text-gray-500 hover:text-gray-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {loadingMore ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
                                            Loading…
                                        </>
                                    ) : (
                                        `Load more  (page ${page + 1} / ${pagination.totalPages})`
                                    )}
                                </button>
                            )}

                            {/* all loaded indicator */}
                            {pagination && page >= pagination.totalPages && transactions.length > 0 && (
                                <p className="text-center text-[10px] text-gray-700 pt-[clamp(0.375rem,1vw,0.5rem)]">
                                    All {totalEntries} transactions loaded
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
