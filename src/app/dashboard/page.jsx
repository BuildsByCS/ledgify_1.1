'use client';

import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../components/lib/api';
import '../components/dashboard/dashboard.css';

import TotalBalanceCard from '../components/dashboard/TotalBalanceCard';
import ActiveAccountsCard from '../components/dashboard/ActiveAccountsCard';
import PayTransferCard from '../components/dashboard/PayTransferCard';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import AccountsTable from '../components/dashboard/AccountsTable';
import TransactionHistory from '../components/dashboard/TransactionHistory';

export default function DashboardOverview() {
    const { user } = useSelector((state) => state.auth);

    const [mounted, setMounted] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [chartData, setChartData] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [accountBalance, setAccountBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const prevAccountRef = useRef('');

    const handleRefresh = () => setRefreshCount(r => r + 1);

    // mark mounted so ResponsiveContainer can measure the DOM
    useEffect(() => { setMounted(true); }, []);

    // initial load: accounts list with total balance
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [accountsRes, totalRes] = await Promise.all([
                    api.get('/api/accounts'),
                    api.get('/api/accounts/total-balance'),
                ]);
                const loadedAccounts = accountsRes.data?.accounts || accountsRes.data || [];
                setAccounts(loadedAccounts);
                setTotalBalance(totalRes.data?.totalBalance ?? 0);
                if (loadedAccounts.length > 0) {
                    setSelectedAccount(prev => prev || loadedAccounts[0]._id);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load accounts. Are you logged in?');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [refreshCount]);

    // when selected account changes: fetch its balance & chart data
    useEffect(() => {
        const fetchAccountData = async () => {
            if (!selectedAccount) return;
            setChartLoading(true);

            // only clear out the existing balance if we are actively switching to a DIFFERENT account
            // this prevents the UI from "flashing" to empty when merely refreshing data (e.g. after get-bonus)
            if (prevAccountRef.current !== selectedAccount) {
                setAccountBalance(null);
                prevAccountRef.current = selectedAccount;
            }
            try {
                const [balanceRes, chartRes] = await Promise.all([
                    api.get(`/api/accounts/balance/${selectedAccount}`),
                    api.get(`/api/accounts/ledger-chart/${selectedAccount}`),
                ]);

                setAccountBalance(balanceRes.data?.balance ?? 0);

                const rawTransactions = chartRes.data?.transactions || [];
                let running = 0;
                const series = rawTransactions
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

                setChartData(series);
            } catch (err) {
                console.error('Failed to load account data', err);
            } finally {
                setChartLoading(false);
            }
        };
        fetchAccountData();
    }, [selectedAccount, refreshCount]);

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
                    onRefresh={handleRefresh}
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
                <div className="p-[clamp(0.875rem,2vw,1.5rem)] rounded-3xl bg-[#05070e] border border-white/10 overflow-hidden ">
                <TransactionHistory myAccounts={accounts} />
            </div>
            </div>

        </div>
    );
}
