'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Wallet,
    ArrowRightLeft,
    PlusCircle,
    Send
} from 'lucide-react';

// The system user is identified by a specific email set on the backend.
// This keeps the "Initial Deposit" route hidden from regular users.
const SYSTEM_USER_EMAIL = 'system@ledgify.com';

export default function Sidebar() {
    const pathname = usePathname();
    const user = useSelector((state) => state.auth.user);

    const isSystemUser = user?.email === SYSTEM_USER_EMAIL;

    const navLinks = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Create Account', href: '/dashboard/create-account', icon: Wallet },
        { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowRightLeft },
        // initial deposit only visible to the system user account
        ...(isSystemUser
            ? [{ name: 'Initial Deposit', href: '/dashboard/deposit', icon: PlusCircle }]
            : []),
    ];

    return (
        <aside className="absolute right-0 pt-30 w-64 border-r border-white/5 bg-[#0c0f23]/40 backdrop-blur-md flex-col justify-between hidden md:flex z-20 shadow-2xl h-fit pb-4">
            <div>

                <div className="px-4 mb-6">
                    <Link href="/dashboard/transactions" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_20px_rgba(79,70,229,0.6)]">
                        <Send className="w-4 h-4" />
                        <span>Pay</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                                <span className="font-medium text-sm">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

        </aside>
    );
}
