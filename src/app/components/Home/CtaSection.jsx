'use client';

import TextReveal from "../utils/TextReveal";
import { useLenis } from 'lenis/react';

export default function CtaSection() {
    const lenis = useLenis();

    const scrollToAuth = () => {
        if (lenis) {
            lenis.scrollTo('#auth-section', {
                offset: -150,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            // Fallback if lenis is not ready or available
            const authSection = document.getElementById('auth-section');
            if (authSection) {
                authSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="relative z-[1] flex flex-col my-[6rem] lg:my-[4rem] pt-[clamp(8rem,14vw,24rem)] pb-[clamp(4rem,8vw,12rem)] items-center justify-end text-center">
            <h2 className="xl-text leading-[1.1] md:leading-tight mb-1 md:mb-0 font-medium tracking-tight">
                Get Started in Minutes
            </h2>
            <div className="pt-1 md:pt-1 pb-6 lg:pb-6">
                <p className="small-text text-center text-white/80 leading-tight">
                    Create an account, set up your wallet, and
                </p>
                <p className="small-text text-center text-white/80 leading-tight">
                    start managing transactions securely.
                </p>
            </div>
            <button
                onClick={scrollToAuth}
                className="bg-white rounded-full text-black font-medium cursor-pointer transition-all hover:scale-105 active:scale-95 duration-300 shadow-lg hover:shadow-xl"
                style={{
                    padding: 'clamp(0.65rem,calc(0.6rem + 0.8vw),0.9rem) clamp(1.25rem,calc(1.2rem + 1.6vw),2rem)',
                    fontSize: 'clamp(0.55rem, calc(0.5rem + 0.8vw), 0.9rem)',
                }}
            >
                Get Started
            </button>
        </div>
    );
}