'use client';

import { useState, useEffect } from 'react';
import api from '../../components/lib/api';
import TransferForm from '../../components/dashboard/TransferForm';
import TransactionHistory from '../../components/dashboard/TransactionHistory';

export default function TransactionsPage() {
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
            await api.post('/api/transactions', {
                fromAccount: data.from,
                toAccount: data.to,
                amount: Number(data.amount),
                idempotencyKey: crypto.randomUUID(),
            });
            setStatus({ type: 'success', message: 'Transfer successful! Ledger updated.' });
            reset();
            fetchFromBalance(data.from);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Transaction failed. Check details and balance.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus(null), 6000);
        }
    };

    return (
        <div className="relative w-full pt-[clamp(6.5rem,8vw,10rem)] sm:px-[clamp(0.875rem,2vw,1.5rem)] animate-in fade-in duration-300">

            <div className="absolute inset-0 -mx-[clamp(1rem,4vw,2rem)] bg-black/90 backdrop-blur-sm rounded-b-[clamp(2rem,4vw,6rem)]" />

            <TransferForm
                myAccounts={myAccounts}
                allAccounts={allAccounts}
                allAccountsLoading={allAccountsLoading}
                fromBalance={fromBalance}
                balanceLoading={balanceLoading}
                status={status}
                isLoading={isLoading}
                onSubmit={handleTransfer}
                onFromChange={setSelectedFromId}
            />

            <TransactionHistory myAccounts={myAccounts} />
        </div>
    );
}
