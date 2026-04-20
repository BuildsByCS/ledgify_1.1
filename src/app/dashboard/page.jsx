'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import api from '../components/lib/api';
import '../components/dashboard/dashboard.css';

import TotalBalanceCard from '../components/dashboard/TotalBalanceCard';
import ActiveAccountsCard from '../components/dashboard/ActiveAccountsCard';
import PayTransferCard from '../components/dashboard/PayTransferCard';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import AccountsTable from '../components/dashboard/AccountsTable';
import TransactionHistory from '../components/dashboard/TransactionHistory';

// query functions 
async function fetchAccounts() {
    const res = await api.get('/api/accounts');
    return res.data?.accounts ?? res.data ?? [];
}

async function fetchTotalBalance() {
    const res = await api.get('/api/accounts/total-balance');
    return res.data?.totalBalance ?? 0;
}

async function fetchAccountBalance(accountId) {
    const res = await api.get(`/api/accounts/balance/${accountId}`);
    return res.data?.balance ?? 0;
}

async function fetchChartData(accountId) {
    const res = await api.get(`/api/accounts/ledger-chart/${accountId}`);
    const rawTransactions = res.data?.transactions ?? [];
    let running = 0;
    return rawTransactions
        .slice()
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((tx, idx) => {
            const type = tx.type?.toUpperCase();
            const amount = Number(tx.amount);
            if (type === 'CREDIT') running += amount;
            else if (type === 'DEBIT') running -= amount;

            const d = new Date(tx.createdAt);
            const label = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
            const dateLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

            return { index: idx, label, dateLabel, balance: running, amount, type };
        });
}


export default function DashboardOverview() {
    const { user } = useSelector((state) => state.auth);
    const [mounted, setMounted] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState('');

    // mark mounted so ResponsiveContainer can measure the DOM
    useEffect(() => { setMounted(true); }, []);

    //  accounts list & total balance (parallel) 
    const {
        data: accounts = [],
        isLoading: accountsLoading,
        error: accountsError,
    } = useQuery({
        queryKey: ['dashboard', 'accounts'],
        queryFn: fetchAccounts,
        staleTime: 30_000,
    });

    const { data: totalBalance = 0 } = useQuery({
        queryKey: ['dashboard', 'total-balance'],
        queryFn: fetchTotalBalance,
        staleTime: 30_000,
    });

    // auto-select the first account once the list arrives
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccount) {
            setSelectedAccount(accounts[0]._id);
        }
    }, [accounts, selectedAccount]);

    // per-account balance 
    const { data: accountBalance = null } = useQuery({
        queryKey: ['dashboard', 'account-balance', selectedAccount],
        queryFn: () => fetchAccountBalance(selectedAccount),
        enabled: !!selectedAccount,
        staleTime: 30_000,
        // keep showing the previous account's balance while the new one loads
        placeholderData: (prev) => prev,
    });

    //  chart data 
    const { data: chartData = [], isLoading: chartLoading } = useQuery({
        queryKey: ['dashboard', 'chart', selectedAccount],
        queryFn: () => fetchChartData(selectedAccount),
        enabled: !!selectedAccount,
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    const loading = accountsLoading;
    const error = accountsError ? 'Failed to load accounts. Are you logged in?' : null;

    const activeCount = accounts.filter(
        (a) => !a.status || a.status.toUpperCase() === 'ACTIVE'
    ).length;

    return (
        <div className="w-full pt-[clamp(6rem,10vw,12rem)] mx-auto space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-500 relative ">

            {/* page header */}
            <header className='mb-[clamp(1.4rem,3vw,2rem)]'>
                <h1 className="large-text leading-none font-regular bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Welcome, {user?.name}
                </h1>
                <p className="small-text text-gray-400 pt-1 md:pt-2">
                    Manage your accounts and track your balance.
                </p>
            </header>

            {/* stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(0.75rem,2vw,1.5rem)]">
                <TotalBalanceCard
                    totalBalance={totalBalance}
                    selectedAccount={selectedAccount}
                    accountBalance={accountBalance}
                />
                <ActiveAccountsCard activeCount={activeCount} />
                <PayTransferCard />
            </div>

            <div className='grid grid-cols-1 2xl:grid-cols-2 gap-[clamp(0.75rem,2vw,1.5rem)]'>
                {/* cash flow chart */}
                {!loading && !error && accounts.length > 0 && (
                    <CashFlowChart
                        chartData={chartData}
                        chartLoading={chartLoading}
                        mounted={mounted}
                        selectedAccount={selectedAccount}
                        accounts={accounts}
                        onAccountChange={setSelectedAccount}
                    />
                )}

                {/* accounts table */}
                <AccountsTable
                    accounts={accounts}
                    loading={loading}
                    error={error}
                />
            {/* transaction history */}
            <div className=" 2xl:col-span-2 p-[clamp(0.875rem,2vw,1.5rem)] rounded-3xl bg-[#05070e] border border-white/10 overflow-hidden ">
                <TransactionHistory myAccounts={accounts} />
            </div>
            </div>

        </div>
    );
}
