'use client';

import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);

/**
 * Easing function: custom quintic ease-out.
 *
 * @param {number} t  – progress [0, 1]
 * @returns {number}
 */
function lenisEasing(t) {
    // Quint ease-out: t^5 inverted — dramatic drop-off, silky landing
    return 1 - Math.pow(1 - t, 5);
}

export default function SmoothScroll({ children }) {
    const lenisRef = useRef(null);
    const pathname = usePathname();

    useEffect(() => {
        /**
         * Official GSAP ↔ Lenis integration (from lenis/react README):
         * - autoRaf: false  → hand off RAF control entirely to GSAP ticker
         * - gsap.ticker provides time in SECONDS; Lenis.raf() expects MILLISECONDS
         * - lagSmoothing(0) → GSAP never skips frames, keeping scroll perfectly smooth
         */
        function update(time) {
            lenisRef.current?.lenis?.raf(time * 1000);
        }

        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(update);
        };
    }, []);

    useEffect(() => {
        // Refresh ScrollTrigger calculations after a route change
        const timeoutId = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return (
        <ReactLenis
            root
            ref={lenisRef}
            options={{
                autoRaf: false,      // GSAP ticker drives RAF — never double-tick
                duration: 1.4,       // total scroll travel time (seconds)
                easing: lenisEasing, // custom quintic ease-out
                smoothWheel: true,   // smooth mouse-wheel scroll
                wheelMultiplier: 1,  // 1 = natural feel, increase for faster wheel
                touchMultiplier: 2,  // slightly amplified for touch momentum
                infinite: false,     // standard bounded scroll
            }}
        >
            {children}
        </ReactLenis>
    );
}
