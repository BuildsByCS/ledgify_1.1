'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import api from '../components/lib/api';
import TransferForm from '../components/dashboard/TransferForm';
import TransactionHistory from '../components/dashboard/TransactionHistory';

function TransactionsContent() {
    const { user } = useSelector((state) => state.auth);
    const searchParams = useSearchParams();
    const defaultTo = searchParams.get('to') || undefined;

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [myAccounts, setMyAccounts] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);
    const [allAccountsLoading, setAllAccountsLoading] = useState(true);
    const [fromBalance, setFromBalance] = useState(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [selectedFromId, setSelectedFromId] = useState('');

    /* fetch user's own accounts */
    useEffect(() => {
        api.get('/api/accounts')
            .then(r => setMyAccounts(r.data?.accounts || r.data || []))
            .catch(console.error);
    }, []);

    /* fetch all accounts for "To" search */
    useEffect(() => {
        setAllAccountsLoading(true);
        api.get('/api/accounts/all')
            .then(r => setAllAccounts(r.data?.allAccounts || r.data || []))
            .catch(console.error)
            .finally(() => setAllAccountsLoading(false));
    }, []);

    /* fetch live balance whenever "From" account changes */
    const fetchFromBalance = async (accountId) => {
        if (!accountId) { setFromBalance(null); return; }
        setBalanceLoading(true);
        try {
            const r = await api.get(`/api/accounts/balance/${accountId}`);
            setFromBalance(r.data?.balance ?? null);
        } catch {
            setFromBalance(null);
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => { fetchFromBalance(selectedFromId); }, [selectedFromId]);

    /* submit handler — called by TransferForm with (data, resetFn) */
    const handleTransfer = async (data, reset) => {
        setIsLoading(true);
        setStatus(null);
        try {
            if (user?.systemUser) {
                await api.post('/api/transactions/system/initial-funds', {
                    toAccount: data.to,
                    amount: Number(data.amount),
                    idempotencyKey: crypto.randomUUID(),
                });
            } else {
                await api.post('/api/transactions', {
                    fromAccount: data.from,
                    toAccount: data.to,
                    amount: Number(data.amount),
                    idempotencyKey: crypto.randomUUID(),
                });
            }
            setStatus({ type: 'success', message: 'Transfer successful! Ledger updated.' });
            reset({ to: defaultTo || '' });
            if (!user?.systemUser) fetchFromBalance(data.from);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Transaction failed. Check details and balance.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus(null), 6000);
        }
    };

    return (
        <div className="relative w-full bg-black/90 backdrop-blur-sm rounded-[clamp(2rem,4vw,6rem)] space-y-[clamp(4rem,6vw,6rem)] mt-[clamp(8rem,calc(7rem+8vw),10rem)] px-[clamp(0.875rem,3vw,2.5rem)] py-[clamp(1.5rem,3vw,4rem)] animate-in fade-in duration-300">

            {/* Go Back Button */}
            <div className="absolute -top-[clamp(2.5rem,4vw,3rem)]  left-0 sm:left-[clamp(0.875rem,2vw,1.5rem)] z-20">
                <Link
                    href="/dashboard"
                    className="group flex items-center gap-[0.375rem] px-3 py-1.5 rounded-full bg-[#05070e] hover:bg-[#05070e]/90 text-gray-400 hover:text-white transition-all border border-white/5 hover:border-white/10 small-text font-medium"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Go Back
                </Link>
            </div>

            <TransferForm
                isSystemUser={user?.systemUser}
                myAccounts={myAccounts}
                allAccounts={allAccounts}
                allAccountsLoading={allAccountsLoading}
                fromBalance={fromBalance}
                balanceLoading={balanceLoading}
                status={status}
                isLoading={isLoading}
                onSubmit={handleTransfer}
                onFromChange={setSelectedFromId}
                defaultTo={defaultTo}
            />

            <TransactionHistory myAccounts={myAccounts} />
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div className="mt-32 text-center text-white">Loading component...</div>}>
            <TransactionsContent />
        </Suspense>
    );
}
