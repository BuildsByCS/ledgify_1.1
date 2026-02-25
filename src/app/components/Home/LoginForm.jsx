'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import api from '../lib/api';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../lib/features/auth/authSlice';

function EyeIcon({ open }) {
    return open ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function ErrorMsg({ message }) {
    if (!message) return null;
    return (
        <p className="error-msg text-[0.65rem] sm:text-[0.72rem] mt-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            {message}
        </p>
    );
}

function SuccessScreen({ email }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        gsap.fromTo(ref.current.children,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, stagger: 0.12, duration: 0.5, ease: 'back.out(1.6)' }
        );
    }, []);
    return (
        <div ref={ref} className="success-screen px-4 py-6 sm:px-5 sm:py-7 gap-3 sm:gap-4">
            <div className="success-ring w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] flex items-center justify-center rounded-full border border-green-400/20 bg-green-400/10">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <div>
                <h3 className="text-[0.95rem] sm:text-base font-bold text-[#4ade80] mb-1">You&apos;re logged in!</h3>
                <p className="text-[0.75rem] sm:text-[0.8rem] text-[var(--text-secondary)]">
                    Welcome back, <strong className="text-[var(--text-primary)]">{email}</strong>
                </p>
            </div>
            <div className="text-[0.7rem] sm:text-[0.74rem] text-[var(--text-muted)] flex items-center gap-1.5">
                <div className="w-[6px] h-[6px] rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                Session active · Redirecting…
            </div>
        </div>
    );
}


export default function LoginForm({ onToast }) {
    const router = useRouter();
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const formRef = useRef(null);
    const btnRef = useRef(null);
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onTouched' });


    useEffect(() => {
        if (!formRef.current) return;
        const fields = formRef.current.querySelectorAll('.field-row');
        gsap.fromTo(fields,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, stagger: 0.09, duration: 0.5, ease: 'power3.out', delay: 0.12 }
        );
    }, []);


    const shake = () =>
        gsap.fromTo(formRef.current, { x: 0 }, {
            keyframes: { x: [0, -10, 10, -8, 8, -4, 0] }, duration: 0.5, ease: 'power2.inOut',
        });


    const onSubmit = async (data) => {
        setIsLoading(true);
        gsap.to(btnRef.current, { scale: 0.97, duration: 0.1 });

        try {
            // withCredentials:true → browser stores any Set-Cookie the backend sends
            const res = await api.post('/api/auth/login', {
                email: data.email,
                password: data.password,
            });

            gsap.to(btnRef.current, { scale: 1, duration: 0.2 });
            onToast({ type: 'success', message: 'Logged in successfully!' });
            setSuccess(data.email);

            // Update auth context with full backend response
            const userData = res.data?.user || res.data;
            dispatch(loginSuccess(userData));

            // Redirect after 2 seconds to let the success animation play
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        } catch (err) {
            gsap.to(btnRef.current, { scale: 1, duration: 0.2 });
            const msg = err.response?.data?.message
                || err.response?.data?.error
                || 'Invalid credentials.';
            onToast({ type: 'error', message: msg });
            shake();
        } finally {
            setIsLoading(false);
        }
    };

    if (success) return <SuccessScreen email={success} />;

    return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate
            className="flex flex-col gap-3 sm:gap-[14px]">

            {/* Email */}
            <div className="field-row flex flex-col gap-1 sm:gap-[5px]">
                <label className="text-[0.65rem] sm:text-[0.72rem] font-semibold text-[var(--text-secondary)] tracking-[0.04em] uppercase">Email Address</label>
                <input className={`auth-input px-3 py-2.5 sm:px-[13px] sm:py-[10px] text-[0.75rem] sm:text-[0.82rem] ${errors.email ? 'error' : ''}`}
                    type="email" placeholder="john@example.com" autoComplete="email"
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                    })}
                />
                <ErrorMsg message={errors.email?.message} />
            </div>

            {/* Password */}
            <div className="field-row flex flex-col gap-1 sm:gap-[5px]">
                <div className="flex justify-between items-center">
                    <label className="text-[0.65rem] sm:text-[0.72rem] font-semibold text-[var(--text-secondary)] tracking-[0.04em] uppercase">Password</label>
                    <button type="button" className="text-[0.65rem] sm:text-[0.72rem] text-[var(--accent-light)] bg-transparent border-none cursor-pointer font-inherit font-medium">
                        Forgot password?
                    </button>
                </div>
                <div className="input-wrapper">
                    <input className={`auth-input input-with-icon pl-3 pr-9 py-2.5 sm:pl-[13px] sm:pr-[36px] sm:py-[10px] text-[0.75rem] sm:text-[0.82rem] ${errors.password ? 'error' : ''}`}
                        type={showPw ? 'text' : 'password'}
                        placeholder="Enter your password" autoComplete="current-password"
                        {...register('password', { required: 'Password is required' })}
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                        <EyeIcon open={showPw} />
                    </button>
                </div>
                <ErrorMsg message={errors.password?.message} />
            </div>

            {/* Submit */}
            <div className="field-row mt-1 sm:mt-2">
                <button ref={btnRef} type="submit" className="btn-primary px-4 py-2.5 sm:px-5 sm:py-[11px] text-[0.8rem] sm:text-[0.85rem]" disabled={isLoading}>
                    {isLoading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="spinner w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" /> Signing in…
                        </span>
                        : 'Sign In'}
                </button>
            </div>
        </form>
    );
}
