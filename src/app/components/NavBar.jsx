'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../lib/features/auth/authSlice';
import gsap from 'gsap';

export default function NavBar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef(null);
    const lastScrollY = useRef(0);

    const isVisibleRef = useRef(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        let isScrolling;

        // Ensure initial state is fully visible but allows bottom overflow
        gsap.set(navRef.current, { clipPath: 'inset(0% 0% -500% 0%)', yPercent: 0 });

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
    const logout = async () => {
        await dispatch(logoutUser());
    };
    const pathname = usePathname();

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
            className="fixed top-0 left-0 w-full z-[100] px-6 py-4 flex items-center justify-between bg-[#0c0f23]/20 backdrop-blur-md border-b border-white/5 text-white"
        >
            <div className=" pl-[5%] py-2">
                <Link href="/" className="text-lg sm:text-3xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-wide select-none cursor-pointer">
                    Ledgify
                </Link>
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={toggleDropdown}
                                className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden border-2 border-indigo-500/30 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${user?.name || 'User'}&backgroundColor=0c0f23`}
                                    alt="Profile"
                                    className="w-full h-full object-cover bg-white"
                                />
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="relative w-10 h-10 p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer group flex items-center justify-center"
                            >
                                <div className="relative w-6 h-[14px]">
                                    <span className={`absolute right-0 bg-gray-300 group-hover:bg-white block transition-all duration-300 ease-out h-[2px] rounded-full ${isMobileMenuOpen ? 'w-6 top-1/2 -translate-y-1/2 rotate-45' : 'w-6 top-0'}`}></span>
                                    <span className={`absolute right-0 top-1/2 -translate-y-1/2 bg-gray-300 group-hover:bg-white block transition-all duration-300 ease-out h-[2px] rounded-full ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-4 group-hover:w-6'}`}></span>
                                    <span className={`absolute right-0 bg-gray-300 group-hover:bg-white block transition-all duration-300 ease-out h-[2px] rounded-full ${isMobileMenuOpen ? 'w-6 top-1/2 -translate-y-1/2 -rotate-45' : 'w-5 bottom-0 group-hover:w-6'}`}></span>
                                </div>
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
                </div>
            )}
        </nav>
    );
}
