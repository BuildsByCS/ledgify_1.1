'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import './AuthStyles.css';

function Toast({ toast, onDismiss }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(
            ref.current,
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.6)' }
        );
        const timer = setTimeout(() => {
            gsap.to(ref.current, {
                opacity: 0, y: 8, scale: 0.95, duration: 0.3, ease: 'power2.in',
                onComplete: onDismiss,
            });
        }, 3500);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div ref={ref} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
                </svg>
            )}
            {toast.message}
        </div>
    );
}

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState('register');
    const [toast, setToast] = useState(null);
    const [formKey, setFormKey] = useState(0);
    const pillRef = useRef(null);
    const cardRef = useRef(null);
    const formAreaRef = useRef(null);

    // Pill animation on tab change
    useEffect(() => {
        if (!pillRef.current) return;
        const toLogin = activeTab === 'login';
        gsap.to(pillRef.current, {
            x: toLogin ? '100%' : '0%',
            duration: 0.45,
            ease: 'expo.out',
        });
    }, [activeTab]);

    // Animate form area when tab changes
    const switchTab = useCallback(
        (tab) => {
            if (tab === activeTab) return;
            if (!formAreaRef.current) {
                setActiveTab(tab);
                return;
            }
            gsap.to(formAreaRef.current, {
                opacity: 0,
                x: tab === 'login' ? -20 : 20,
                duration: 0.22,
                ease: 'power2.in',
                onComplete: () => {
                    setActiveTab(tab);
                    setFormKey(k => k + 1);
                    gsap.fromTo(
                        formAreaRef.current,
                        { opacity: 0, x: tab === 'login' ? 20 : -20 },
                        { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }
                    );
                },
            });
        },
        [activeTab]
    );

    const handleRegisterSuccess = useCallback(() => {
        switchTab('login');
    }, [switchTab]);

    const handleToast = useCallback((t) => setToast(t), []);
    const dismissToast = useCallback(() => setToast(null), []);

    return (
        <>
            <div
                ref={cardRef}
                className="glass-card w-full max-w-[90vw] sm:max-w-[400px] px-5 py-6 sm:px-7 sm:pt-[26px] sm:pb-[30px] relative z-10 bg-[#06091a]"
            >
                {/* Header */}
                <div className="mb-4 sm:mb-5 text-center">
                    <h2 className="text-[1.1rem] sm:text-[1.2rem] md:text-[1.35rem] font-bold bg-gradient-to-br from-[#6c63ff] via-[#a78bfa] to-[#63b3ed] bg-clip-text text-transparent tracking-[-0.02em]">
                        {activeTab === 'register' ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="text-[0.75rem] sm:text-[0.78rem] md:text-[0.85rem] text-[var(--text-secondary)]">
                        {activeTab === 'register'
                            ? 'Join thousands managing smarter payments'
                            : 'Sign in to access your ledger'}
                    </p>
                </div>

                {/* Toggle */}
                <div className="toggle-container mb-4 sm:mb-5">
                    <div
                        ref={pillRef}
                        className="toggle-pill"
                        style={{ transform: activeTab === 'login' ? 'translateX(calc(100% + 5px))' : 'translateX(0)' }}
                    />
                    <button
                        className={`toggle-btn py-1.5 px-3 sm:py-2 sm:px-4 text-[0.75rem] sm:text-[0.82rem] md:text-[0.88rem] ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => switchTab('register')}
                    >
                        Register
                    </button>
                    <button
                        className={`toggle-btn py-1.5 px-3 sm:py-2 sm:px-4 text-[0.75rem] sm:text-[0.82rem] md:text-[0.88rem] ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => switchTab('login')}
                    >
                        Login
                    </button>
                </div>

                {/* Divider */}
                <div className="h-[1px] mb-4 sm:mb-5 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

                {/* Form area */}
                <div ref={formAreaRef} key={formKey} className="form-panel">
                    {activeTab === 'register' ? (
                        <RegisterForm onSuccess={handleRegisterSuccess} onToast={handleToast} />
                    ) : (
                        <LoginForm onToast={handleToast} />
                    )}
                </div>

                {/* Footer note */}
                <p className="text-center text-[0.7rem] sm:text-[0.74rem] md:text-[0.8rem] text-[var(--text-muted)] mt-5">
                    {activeTab === 'register' ? (
                        <>Already have an account?{' '}
                            <button
                                onClick={() => switchTab('login')}
                                className="bg-transparent border-none text-[var(--accent-light)] cursor-pointer font-inherit font-semibold text-inherit"
                            >
                                Sign in
                            </button>
                        </>
                    ) : (
                        <>Don&apos;t have an account?{' '}
                            <button
                                onClick={() => switchTab('register')}
                                className="bg-transparent border-none text-[var(--accent-light)] cursor-pointer font-inherit font-semibold text-inherit"
                            >
                                Register
                            </button>
                        </>
                    )}
                </p>
            </div>

            {/* Toast */}
            {toast && <Toast toast={toast} onDismiss={dismissToast} />}
        </>
    );
}
