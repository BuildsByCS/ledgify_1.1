'use client';

import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '../components/lib/api';
import SystemAccountsTable from '../components/systemboard/SystemAccountsTable';
import { ShieldCheck } from 'lucide-react';


async function fetchAllAccounts() {
    const res = await api.get('/api/accounts/all');
    return res.data?.allAccounts ?? res.data ?? [];
}

export default function SystemBoardPage() {
    const { user } = useSelector((state) => state.auth);
    // isLoading is true while the /me query is in-flight on first load
    const { isLoading: isAuthLoading } = useQuery({ queryKey: ['auth', 'me'] });
    const router = useRouter();

    // redirect non-system users after auth is resolved
    useEffect(() => {
        if (!isAuthLoading && !user?.systemUser) {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    //  all accounts query (only runs for system users)
    const {
        data: accounts = [],
        isLoading: accountsLoading,
        error: accountsError,
    } = useQuery({
        queryKey: ['systemboard', 'all-accounts'],
        queryFn: fetchAllAccounts,
        enabled: !!user?.systemUser,
        staleTime: 30_000,
    });

    const loading = accountsLoading;
    const error = accountsError ? 'Failed to load system accounts.' : null;

    if (!user || (!user.systemUser && !isAuthLoading)) {
        return null; // redirecting
    }

    return (
        <div className="w-full pt-[clamp(6rem,10vw,12rem)] px-[clamp(1rem,3vw,2.5rem)] pb-[4rem] mx-auto space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-500 relative">
            <header className='mb-[clamp(1.4rem,3vw,2rem)] flex flex-col gap-2'>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="large-text leading-none font-regular bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        System Board
                    </h1>
                </div>
                <p className="small-text text-gray-400 pt-1">
                    Platform-wide account management and system controls. Total Accounts: <span className="font-bold text-white">{accounts.length}</span>
                </p>
            </header>

            <div className="mt-8">
                <SystemAccountsTable 
                    accounts={accounts}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
}
