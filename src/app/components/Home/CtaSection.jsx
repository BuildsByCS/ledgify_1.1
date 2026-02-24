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
        <div className="relative z-[1] flex flex-col px-6 py-20 md:py-24 lg:p-[5%] items-center justify-end text-center">
            <TextReveal as="h2" mode="words" yOffset={0} className="text-[8vw] xs:text-[6vw] sm:text-[5vw] md:text-[4.5vw] lg:text-[4vw] xl:text-[3vw] leading-[1.1] md:leading-tight mb-2 md:mb-0 font-medium tracking-tight">
                Experience ledger-based banking
            </TextReveal>
            <div className="pt-2 md:pt-2 pb-10 lg:pb-12">
                <TextReveal as="p" mode="letters" yOffset={0} className="text-[3.6vw] xs:text-[3vw] sm:text-[2.5vw] md:text-[1.8vw] lg:text-[1.25vw] xl:text-[1vw]  text-center text-white/80 leading-tight">
                    Sign up, create an account, and see how every
                </TextReveal>
                <TextReveal as="p" mode="letters" yOffset={0} className="text-[3.6vw] xs:text-[3vw] sm:text-[2.5vw] md:text-[1.8vw] lg:text-[1.25vw] xl:text-[1vw]  text-center text-white/80 leading-tight">
                    transaction is recorded, calculated, and verified
                </TextReveal>
                <TextReveal as="p" mode="letters" yOffset={0} className="text-[3.6vw] xs:text-[3vw] sm:text-[2.5vw] md:text-[1.8vw] lg:text-[1.25vw] xl:text-[1vw]  text-center text-white/80 leading-tight">
                    in real time.
                </TextReveal>
            </div>
            <button
                onClick={scrollToAuth}
                className="py-3 px-6 text-sm md:py-4 md:px-8 md:text-[15px] lg:py-5 lg:px-8 lg:text-base bg-white rounded-full text-black font-medium cursor-pointer transition-all hover:scale-105 active:scale-95 duration-300 shadow-lg hover:shadow-xl"
            >
                Get Started
            </button>
        </div>
    );
}