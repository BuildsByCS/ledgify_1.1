'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    Send, CheckCircle, AlertCircle, ArrowDown, CreditCard,
    Search, User, ChevronDown, X,
    ArrowRight, Sparkles, ShieldCheck, Zap,
} from 'lucide-react';
import { CopyButton, StatusBadge } from './DashboardHelpers';

/* ─────────────────────── FieldLabel ─────────────────────── */
function FieldLabel({ children }) {
    return (
        <p className="small-text text-gray-500 uppercase tracking-wider font-medium mb-[clamp(0.375rem,1vw,0.625rem)]">
            {children}
        </p>
    );
}

/* ─────────────────────── ToAccountSelector ─────────────────────── */
function ToAccountSelector({ allAccounts, loading, onChange, value, excludeId }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const ref = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    /* Stop Lenis from intercepting wheel events inside the dropdown list */
    useEffect(() => {
        const el = listRef.current;
        if (!el || !open) return;
        const block = (e) => { e.stopPropagation(); };
        el.addEventListener('wheel', block, { passive: true, capture: true });
        return () => el.removeEventListener('wheel', block, { capture: true });
    }, [open]);

    const base = excludeId ? allAccounts.filter(a => a._id !== excludeId) : allAccounts;
    const filtered = query.trim()
        ? base.filter(a =>
            a.user?.name?.toLowerCase().includes(query.toLowerCase()) ||
            a.user?.email?.toLowerCase().includes(query.toLowerCase()))
        : base;

    const handleSelect = (acc) => { setSelected(acc); onChange(acc._id); setOpen(false); setQuery(''); };
    const handleClear = (e) => { e.stopPropagation(); setSelected(null); onChange(''); setQuery(''); };

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => setOpen(true)}
                className={`w-full flex items-center gap-[clamp(0.375rem,1vw,0.5rem)] bg-white/[0.03] border rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] cursor-pointer transition-all ${open
                    ? 'border-indigo-500/50 ring-1 ring-indigo-500/20'
                    : 'border-white/8 hover:border-indigo-500/30'}`}
            >
                {/* ── search icon (only when open or nothing selected) ── */}
                {(!selected || open) && (
                    <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                )}

                {/* ── text input ── */}
                <input
                    type="text"
                    value={open ? query : ''}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={selected ? '' : 'Search by name or email…'}
                    className={`bg-transparent small-text text-gray-300 placeholder:text-gray-600 focus:outline-none min-w-0 ${selected && !open ? 'w-0 p-0' : 'flex-1'}`}
                />

                {/* ── selected chip (closed state only) ── */}
                {selected && !open && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* avatar */}
                        <div className="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)] rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                            <User className="w-[clamp(0.625rem,1.5vw,0.75rem)] h-[clamp(0.625rem,1.5vw,0.75rem)] text-indigo-400" />
                        </div>

                        {/* name + id stacked, shrink to available space */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="small-text text-gray-200 font-medium truncate leading-tight">{selected.user?.name}</p>
                                <StatusBadge status={selected.status.toLowerCase()} />
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono truncate leading-tight mt-0.5">{selected._id}</p>
                        </div>

                        {/* clear */}
                        <button type="button" onClick={handleClear} className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 cursor-pointer">
                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                    </div>
                )}

                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </div>

            {open && (
                <div className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-[#0d1029] border border-white/10 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-[clamp(1rem,3vw,1.5rem)] text-gray-500 small-text">
                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
                            Loading accounts…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-[clamp(1rem,3vw,1.5rem)] text-center small-text text-gray-600">
                            No accounts match "<span className="text-gray-400">{query}</span>"
                        </div>
                    ) : (
                        <ul ref={listRef} className="max-h-52 overflow-y-auto divide-y divide-white/5">
                            {filtered.map(acc => (
                                <li
                                    key={acc._id}
                                    onClick={() => handleSelect(acc)}
                                    className={`flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)] px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] cursor-pointer transition-colors group ${value === acc._id ? 'bg-indigo-500/10' : 'hover:bg-white/[0.04]'}`}
                                >
                                    <div className="w-[clamp(1.5rem,3vw,1.75rem)] h-[clamp(1.5rem,3vw,1.75rem)] rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                        <User className="w-[clamp(0.75rem,2vw,0.875rem)] h-[clamp(0.75rem,2vw,0.875rem)] text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="small-text text-gray-200 font-medium leading-tight">{acc.user?.name}</p>
                                            <StatusBadge status={acc.status.toLowerCase()} variant="dot" />
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{acc.user?.email}</p>
                                        <p className="text-[10px] font-mono text-gray-600 leading-tight mt-0.5 truncate group-hover:text-indigo-400/60 transition-colors">{acc._id}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 flex-shrink-0">{acc.currency}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────── PreviewPanel ─────────────────────── */
function PreviewPanel({ fromAcc, toAcc, amount, status, currency }) {
    const hasFrom = !!fromAcc;
    const hasTo = !!toAcc;
    const hasAmount = amount && Number(amount) > 0;
    const ready = hasFrom && hasTo && hasAmount;
    const fmt = (n) => Number(n).toLocaleString('en-IN');

    return (
        <div className="relative flex flex-col">

            {/* top label */}
            <div className="relative flex items-center gap-[clamp(0.375rem,1vw,0.5rem)] mb-[clamp(1rem,3vw,2rem)]">
                <Sparkles className="w-[clamp(0.875rem,2vw,1rem)] h-[clamp(0.875rem,2vw,1rem)] text-indigo-400" />
                <span className="small-text text-indigo-300 font-medium uppercase tracking-widest">Transfer Preview</span>
            </div>

            {/* cards */}
            <div className="relative flex-1 flex flex-col items-center justify-center gap-[clamp(1rem,3vw,1.5rem)]">

                {/* FROM */}
                <div className={`w-full max-w-sm bg-[#0d1029] border rounded-2xl p-[clamp(0.625rem,2vw,1rem)] transition-all duration-500 ${hasFrom ? 'border-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.08)]' : 'border-white/5 opacity-40'}`}>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-[clamp(0.375rem,1vw,0.5rem)]">From</p>
                    {hasFrom ? (
                        <>
                            <p className="small-text font-mono text-indigo-300 truncate">{fromAcc._id}</p>
                            <div className="flex items-center gap-2 mt-[clamp(0.375rem,1vw,0.5rem)]">
                                <StatusBadge status={fromAcc.status} variant="icon" />
                                <span className="text-[10px] text-gray-500">{fromAcc.currency}</span>
                                {fromAcc.balance != null && (
                                    <span className="text-[10px] text-gray-500 ml-auto">
                                        Bal: {fromAcc.currency === 'INR' ? '₹' : '$'}{fmt(fromAcc.balance)}
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="small-text text-gray-600 italic">Select sender account…</p>
                    )}
                </div>

                {/* animated arrow + amount */}
                <div className={`flex flex-col items-center gap-1 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-20'}`}>
                    <div className={`flex flex-col items-center ${ready ? 'animate-bounce' : ''}`}>
                        <div className="w-px h-4 bg-gradient-to-b from-transparent to-indigo-500/60" />
                        <div className="w-[clamp(1.75rem,4vw,2rem)] h-[clamp(1.75rem,4vw,2rem)] rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <ArrowDown className="w-[clamp(0.875rem,2vw,1rem)] h-[clamp(0.875rem,2vw,1rem)] text-indigo-400" />
                        </div>
                        <div className="w-px h-4 bg-gradient-to-b from-indigo-500/60 to-transparent" />
                    </div>
                    {hasAmount && (
                        <div className="mt-1 px-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(0.25rem,0.75vw,0.375rem)] bg-indigo-600/20 border border-indigo-500/25 rounded-full animate-in fade-in zoom-in-90 duration-300">
                            <span className="text-[clamp(1rem,2.5vw,1.25rem)] font-bold text-white tabular-nums tracking-tight">
                                {currency === 'INR' ? '₹' : '$'}{fmt(amount)}
                            </span>
                        </div>
                    )}
                </div>

                {/* TO */}
                <div className={`w-full max-w-sm bg-[#0d1029] border rounded-2xl p-[clamp(0.625rem,2vw,1rem)] transition-all duration-500 ${hasTo ? 'border-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.08)]' : 'border-white/5 opacity-40'}`}>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-[clamp(0.375rem,1vw,0.5rem)]">To</p>
                    {hasTo ? (
                        <>
                            <div className="flex items-center gap-[clamp(0.375rem,1vw,0.5rem)] mb-[clamp(0.25rem,0.5vw,0.375rem)]">
                                <div className="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)] rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <User className="w-[clamp(0.625rem,1.5vw,0.75rem)] h-[clamp(0.625rem,1.5vw,0.75rem)] text-indigo-400" />
                                </div>
                                <p className="small-text font-medium text-gray-200">{toAcc.user?.name}</p>
                                <StatusBadge status={toAcc.status} variant="icon" />
                            </div>
                            <p className="text-[10px] text-gray-500">{toAcc.user?.email}</p>
                            <p className="text-[10px] font-mono text-gray-600 mt-0.5 truncate">{toAcc._id}</p>
                        </>
                    ) : (
                        <p className="small-text text-gray-600 italic">Select receiver account…</p>
                    )}
                </div>
            </div>

            {/* status overlays */}
            {status?.type === 'success' && (
                <div className="relative mt-[clamp(1rem,3vw,1.5rem)] flex flex-col items-center gap-[clamp(0.5rem,1.5vw,0.75rem)] animate-in fade-in zoom-in-90 duration-400">
                    <div className="w-[clamp(2.5rem,6vw,3.5rem)] h-[clamp(2.5rem,6vw,3.5rem)] rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle className="w-[clamp(1.25rem,3vw,1.75rem)] h-[clamp(1.25rem,3vw,1.75rem)] text-emerald-400" />
                    </div>
                    <p className="small-text text-emerald-300 font-medium">Transfer Complete</p>
                    <p className="text-[11px] text-emerald-200/60 text-center max-w-[200px]">{status.message}</p>
                </div>
            )}
            {status?.type === 'error' && (
                <div className="relative mt-[clamp(1rem,3vw,1.5rem)] flex flex-col items-center gap-[clamp(0.5rem,1.5vw,0.75rem)] animate-in fade-in zoom-in-90 duration-400">
                    <div className="w-[clamp(2.5rem,6vw,3.5rem)] h-[clamp(2.5rem,6vw,3.5rem)] rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                        <AlertCircle className="w-[clamp(1.25rem,3vw,1.75rem)] h-[clamp(1.25rem,3vw,1.75rem)] text-red-400" />
                    </div>
                    <p className="small-text text-red-300 font-medium">Transfer Failed</p>
                    <p className="text-[11px] text-red-200/60 text-center max-w-[200px]">{status.message}</p>
                </div>
            )}

            {/* idle footer badges */}
            {!status && (
                <div className="relative mt-[clamp(1rem,3vw,1.5rem)] flex items-center justify-center gap-[clamp(0.75rem,2vw,1rem)] flex-wrap">
                    {[{ icon: ShieldCheck, label: 'Secure' }, { icon: Zap, label: 'Instant' }].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                            <Icon className="w-3 h-3 text-indigo-500/60" />{label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────── TransferForm (main export) ─────────────────────── */
/**
 * Props:
 *   myAccounts         {array}         — user's own accounts (for "From" dropdown)
 *   allAccounts        {array}         — all accounts (for "To" search)
 *   allAccountsLoading {bool}
 *   fromBalance        {number|null}
 *   balanceLoading     {bool}
 *   status             {object|null}   — { type: 'success'|'error', message }
 *   isLoading          {bool}
 *   onSubmit           {fn(data,reset)} — called on form submit
 *   onFromChange       {fn(id)}         — called when "From" account changes (for live balance)
 *   onToChange         {fn(id)}         — called when "To" account changes
 */
export default function TransferForm({
    myAccounts,
    allAccounts,
    allAccountsLoading,
    fromBalance,
    balanceLoading,
    status,
    isLoading,
    onSubmit,
    onFromChange,
    onToChange,
}) {
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm();

    const selectedFromId = watch('from');
    const selectedToId = watch('to');
    const amountWatch = watch('amount');

    const fromAcc = myAccounts.find(a => a._id === selectedFromId) ?? null;
    const toAcc = allAccounts.find(a => a._id === selectedToId) ?? null;
    const currency = fromAcc?.currency ?? 'INR';

    /* forward From selection to parent so it can fetch live balance */
    useEffect(() => { onFromChange?.(selectedFromId ?? ''); }, [selectedFromId]);

    const handleSubmitInternal = (data) => { onSubmit(data, reset); };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* ═══ LEFT — Form ═══ */}
            <div className="flex flex-col z-10 lg:border-r min-h-[clamp(26rem,72vh,38rem)] border-white/5 pr-0 lg:pr-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(0.5rem,1.5vw,1rem)]">

                {/* header */}
                <div className="flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)] mb-[clamp(1rem,3vw,2rem)]">
                    <div className="w-[clamp(2rem,4vw,2.5rem)] h-[clamp(2rem,4vw,2.5rem)] rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <CreditCard className="w-[clamp(0.875rem,2vw,1.25rem)] h-[clamp(0.875rem,2vw,1.25rem)]" />
                    </div>
                    <div>
                        <h1 className="mid-text font-normal text-white leading-tight">Transfer Funds</h1>
                        <p className="small-text text-gray-500 mt-0.5">Send money securely via the Ledgify ledger.</p>
                    </div>
                </div>

                {/* status banners */}
                {status?.type === 'success' && (
                    <div className="flex items-start gap-[clamp(0.5rem,1.5vw,0.75rem)] bg-green-500/10 border border-green-500/20 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] mb-[clamp(0.75rem,2vw,1.25rem)] animate-in slide-in-from-top-2">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="small-text font-medium text-green-300">Success</p>
                            <p className="small-text text-green-200/80">{status.message}</p>
                        </div>
                    </div>
                )}
                {status?.type === 'error' && (
                    <div className="flex items-start gap-[clamp(0.5rem,1.5vw,0.75rem)] bg-red-500/10 border border-red-500/20 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] mb-[clamp(0.75rem,2vw,1.25rem)] animate-in slide-in-from-top-2">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="small-text text-red-200">{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(handleSubmitInternal)} className="flex flex-col flex-1 gap-[clamp(1rem,3vw,1.5rem)]">

                    {/* From Account */}
                    <div>
                        <FieldLabel>From Account (sender)</FieldLabel>
                        {myAccounts.length > 0 ? (
                            <select
                                style={{ background: 'rgba(99,102,241,0.05)' }}
                                className="w-full font-mono small-text text-indigo-300 border border-white/8 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer hover:border-indigo-500/30"
                                {...register('from', { required: 'Please select an account' })}>
                                <option value="" className="bg-[#0c0f23] text-gray-400">Select your account…</option>
                                {myAccounts.map(acc => (
                                    <option key={acc._id} value={acc._id} className="bg-[#0c0f23] text-indigo-300">
                                        {acc._id} - ({acc.status})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input type="text" placeholder="Enter source account ID"
                                className="w-full font-mono small-text text-indigo-300 bg-indigo-500/5 border border-white/8 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.625rem)] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all placeholder:text-gray-600"
                                {...register('from', { required: 'Sender Account ID is required' })} />
                        )}
                        {errors.from && <p className="small-text text-red-400 mt-1">{errors.from.message}</p>}
                        {selectedFromId && (
                            <div className="flex items-center font-mono small-text text-indigo-300 bg-indigo-500/5 border border-white/5 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.5rem)] mt-[clamp(0.375rem,1vw,0.5rem)] break-all">
                                <span className="flex-1 truncate">{selectedFromId}</span>
                                <CopyButton text={selectedFromId} />
                            </div>
                        )}
                        {selectedFromId && (
                            <div className="flex items-center gap-2 mt-[clamp(0.375rem,1vw,0.5rem)] px-1">
                                <span className="small-text text-gray-500">Live Balance:</span>
                                {balanceLoading ? (
                                    <div className="w-3 h-3 border border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
                                ) : fromBalance !== null ? (
                                    <span className="small-text font-semibold font-mono text-emerald-400">
                                        {fromAcc?.currency === 'INR' ? '₹' : '$'}{Number(fromBalance).toLocaleString('en-IN')}
                                    </span>
                                ) : (
                                    <span className="small-text text-gray-600 italic">unavailable</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* divider */}
                    <div className="flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)]">
                        <div className="flex-1 h-px bg-white/5" />
                        <div className="w-[clamp(1.5rem,3vw,1.75rem)] h-[clamp(1.5rem,3vw,1.75rem)] rounded-full bg-white/5 border border-white/8 flex items-center justify-center opacity-50">
                            <ArrowDown className="w-[clamp(0.75rem,2vw,0.875rem)] h-[clamp(0.75rem,2vw,0.875rem)] text-indigo-400" />
                        </div>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* To Account */}
                    <div>
                        <FieldLabel>To Account (receiver)</FieldLabel>
                        <input type="hidden" {...register('to', { required: 'Please select a receiver account' })} />
                        <ToAccountSelector
                            allAccounts={allAccounts}
                            loading={allAccountsLoading}
                            value={selectedToId}
                            excludeId={selectedFromId}
                            onChange={(id) => { setValue('to', id, { shouldValidate: true }); onToChange?.(id); }}
                        />
                        {errors.to && <p className="small-text text-red-400 mt-1">{errors.to.message}</p>}
                        {selectedToId && (
                            <div className="flex items-center font-mono small-text text-indigo-300 bg-indigo-500/5 border border-white/5 rounded-xl px-[clamp(0.625rem,2vw,1rem)] py-[clamp(0.375rem,1vw,0.5rem)] mt-[clamp(0.375rem,1vw,0.5rem)] break-all">
                                <span className="flex-1 truncate">{selectedToId}</span>
                                <CopyButton text={selectedToId} />
                            </div>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <FieldLabel>Amount</FieldLabel>
                        <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.5vw,0.75rem)]">
                            <div className="bg-[#0d1029] border border-white/8 rounded-2xl p-[clamp(0.625rem,2vw,1rem)]">
                                <p className="small-text text-gray-500 font-medium mb-[clamp(0.25rem,0.75vw,0.375rem)]">Enter value</p>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    placeholder="0"
                                    className="w-full bg-transparent mid-text font-bold text-white font-mono focus:outline-none placeholder:text-gray-700"
                                    onKeyDown={(e) => ['.', ',', 'e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                    {...register('amount', {
                                        required: 'Amount is required',
                                        min: { value: 1, message: 'Minimum amount is 1' },
                                        validate: v => Number.isInteger(Number(v)) || 'Only whole amounts allowed',
                                    })}
                                />
                            </div>
                            <div className="bg-[#0d1029] border border-white/8 rounded-2xl p-[clamp(0.625rem,2vw,1rem)]">
                                <p className="small-text text-gray-500 font-medium mb-[clamp(0.25rem,0.75vw,0.375rem)]">Currency</p>
                                <p className="mid-text font-bold text-white">{currency}</p>
                            </div>
                        </div>
                        {errors.amount && <p className="small-text text-red-400 mt-1">{errors.amount.message}</p>}
                    </div>

                    <div className="flex-1" />

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-[clamp(0.625rem,2vw,0.875rem)] rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/30 text-white small-text font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-[clamp(0.375rem,1vw,0.5rem)] shadow-[0_0_24px_rgba(99,102,241,0.25)] hover:shadow-[0_0_36px_rgba(99,102,241,0.4)]"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                Processing Ledger…
                            </>
                        ) : (
                            <>
                                <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Execute Transfer
                                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* ═══ RIGHT — Preview (desktop only) ═══ */}
            <div className="h-[clamp(26rem,72vh,38rem)] hidden lg:flex flex-col pl-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(0.5rem,1.5vw,1rem)] z-10">
                <PreviewPanel
                    fromAcc={fromAcc}
                    toAcc={toAcc}
                    amount={amountWatch}
                    status={status}
                    currency={currency}
                />
            </div>
        </div>
    );
}
