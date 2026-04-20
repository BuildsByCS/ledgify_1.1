'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { forceLogout } from '../../lib/features/auth/authSlice';
import api from '../components/lib/api';
import gsap from 'gsap';

export default function NavBar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navRef = useRef(null);
    const lastScrollY = useRef(0);

    const isVisibleRef = useRef(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        let isScrolling;

        const OVERLAY_OFFSET = 0.5 + 0.85;
        gsap.set(navRef.current, { clipPath: 'inset(0% 0% 100% 0%)'});
        gsap.to(navRef.current, {
            clipPath: 'inset(0% 0% -500% 0%)',
            delay: OVERLAY_OFFSET,
            duration: 1,
            ease: 'power2.inOut',
        });

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50 && currentScrollY > lastScrollY.current) {
                // Scrolling down - hide navbar
                if (isVisibleRef.current) {
                    isVisibleRef.current = false;
                    gsap.killTweensOf(navRef.current);

                    gsap.to(navRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'power2.inOut' })
                    setIsDropdownOpen(false); // Close dropdown on scroll
                }
            } else {
                // Scrolling up - show navbar
                if (!isVisibleRef.current) {
                    isVisibleRef.current = true;
                    gsap.killTweensOf(navRef.current);

                    gsap.to(navRef.current, { clipPath: 'inset(0% 0% -500% 0%)', duration: 1, ease: 'power2.inOut' });
                }
            }

            lastScrollY.current = currentScrollY;

            // Detect scroll stop to show NavBar again
            if (isScrolling) clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                // User stopped scrolling, show nav
                if (window.scrollY > 50 && !isVisibleRef.current) {
                    isVisibleRef.current = true;
                    gsap.killTweensOf(navRef.current);

                    gsap.to(navRef.current, { clipPath: 'inset(0% 0% -500% 0%)', duration: 1, ease: 'power2.inOut' });
                }
            }, 400); // 400ms after scrolling stops
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (isScrolling) clearTimeout(isScrolling);
        };
    }, []);

    // Also close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const router = useRouter();

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (_) {
            // proceed with local logout even if server call fails
        }
        // Wipe the entire query cache so no user-specific data
        // (balances, accounts, transactions) can leak to the next login
        queryClient.clear();
        dispatch(forceLogout());
        router.push('/');
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        if (isDropdownOpen) {
            // Animate out
            if (dropdownRef.current) {
                gsap.to(dropdownRef.current, {
                    x: 20,
                    opacity: 0,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => setIsDropdownOpen(false)
                });
            } else {
                setIsDropdownOpen(false);
            }
        } else {
            // Animate in
            setIsDropdownOpen(true);
        }
    };

    // Animate in via effect after DOM mounts it
    useEffect(() => {
        if (isDropdownOpen && dropdownRef.current) {
            gsap.fromTo(dropdownRef.current,
                { x: 20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
            );
        }
    }, [isDropdownOpen]);

    const handleDashboardClick = () => {
        if (dropdownRef.current) {
            gsap.to(dropdownRef.current, {
                x: 20,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => setIsDropdownOpen(false)
            });
        } else {
            setIsDropdownOpen(false);
        }
    };

    const handleLogout = async () => {
        if (dropdownRef.current) {
            gsap.to(dropdownRef.current, {
                x: 20,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: async () => {
                    setIsDropdownOpen(false);
                    await logout();
                }
            });
        } else {
            setIsDropdownOpen(false);
            await logout();
        }
    };


    return (
        <nav
            ref={navRef}
            className="fixed top-0 left-0 w-full z-[100] px-[5%] md:px-10 py-4 flex items-center justify-between bg-[#0c0f23]/20 backdrop-blur-md border-b border-white/5 text-white"
        >
            <div className=" py-2">
                <Link href="/" className="text-lg sm:text-3xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-wide select-none cursor-pointer">
                    Ledgify
                </Link>
            </div>

            {/* Profile Menu Area - Reserved space to prevent hydration layout shift */}
            {user ? (
                <div className="relative animate-in fade-in duration-[600ms] fill-mode-both">
                    <div className='flex items-center justify-end gap-2'>
                        <button
                            onClick={toggleDropdown}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full overflow-hidden border-2 border-indigo-500/30 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                        >
                            <img
                                src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user?.name || 'User'}&backgroundColor=0c0f23`}
                                alt="Profile"
                                className="w-full h-full object-cover bg-white"
                            />
                        </button>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full flex flex-col right-0 mt-3 w-56 bg-[#0d1230] border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-md z-[200]"
                            style={{ opacity: 0 }} // Start invisible for fromTo
                        >
                            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email || 'No email'}</p>
                            </div>
                            <div className="py-2 flex flex-col gap-1">
                                <Link
                                    href="/dashboard"
                                    onClick={handleDashboardClick}
                                    className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-indigo-500/10 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center justify-center p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <LayoutDashboard size={16} />
                                    </div>
                                    <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors">Dashboard</span>
                                </Link>
                                {user?.systemUser && (
                                    <Link
                                        href="/systemboard"
                                        onClick={handleDashboardClick}
                                        className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-indigo-500/10 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-center p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                            <Shield size={16} />
                                        </div>
                                        <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors">SystemBoard</span>
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-red-500/10 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center justify-center p-1.5 rounded-md bg-red-400/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <LogOut size={16} />
                                    </div>
                                    <span className="font-medium text-sm text-gray-300 group-hover:text-red-400 transition-colors">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 pointer-events-none opacity-0"></div>
            )}
        </nav>
    );
}
