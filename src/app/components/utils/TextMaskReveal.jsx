"use client"
import React, { useRef } from 'react'
import gsap from 'gsap'
import SplitText from "gsap/SplitText";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, ScrollTrigger);

/**
 * TextMaskReveal
 *
 * mode="lines" (default) — SplitText line-mask reveal. Best for plain text.
 * mode="block"           — Slides the whole element up inside an overflow-hidden
 *                          wrapper. Use this for gradient text or complex markup
 *                          where SplitText transforms break background-clip:text.
 */
const TextMaskReveal = ({
    text,
    children,
    as: Tag = "p",
    className = "",
    delay = 0,
    mode = "lines",      // "lines" | "block"
    triggerMode = "scroll", // "scroll" | "load"
    duration = 0.9,
    start = "top bottom",
    markers = false
}) => {

    const maskTextContainer = useRef(null);
    const wrapperRef = useRef(null);

    useGSAP(() => {
        const el = maskTextContainer.current;
        const isLoad = triggerMode === "load";

        // ── BLOCK MODE ──────────────────────────────────────────────────────
        // Animate the element itself (no SplitText). Gradient-safe.
        if (mode === "block") {
            gsap.set(el, { yPercent: 100 });

            const animProps = {
                yPercent: 0,
                opacity: 1,
                delay,
                duration,
                ease: "power3.out",
            };

            if (!isLoad) {
                animProps.scrollTrigger = {
                    trigger: wrapperRef.current,
                    start,
                    markers,
                };
            }

            const animation = gsap.to(el, animProps);
            return () => animation.kill();
        }

        // ── LINES MODE (default) ─────────────────────────────────────────────
        let split;
        let animation;

        gsap.set(el, { opacity: 1 });

        document.fonts.ready.then(() => {
            split = SplitText.create(el, {
                type: "words, lines",
                mask: "lines",
                autoSplit: true,
                onSplit: (self) => {
                    const lineProps = {
                        yPercent: 100,
                        delay,
                        stagger: 0.12,
                        duration,
                        ease: "power3.out",
                    };

                    if (!isLoad) {
                        lineProps.scrollTrigger = {
                            trigger: el,
                            start,
                            onComplete: () => self.revert(),
                            markers,
                        };
                    } else {
                        // For load mode, revert after animation completes
                        lineProps.onComplete = () => self.revert();
                    }

                    animation = gsap.from(self.lines, lineProps);
                    return animation;
                },
            });
        });

        return () => {
            if (split) split.revert();
            if (animation) animation.kill();
        };

    }, { scope: mode === "block" ? wrapperRef : maskTextContainer });

    // Block mode needs an overflow-hidden wrapper so the slide-up clips correctly
    if (mode === "block") {
        return (
            <div ref={wrapperRef} className="overflow-hidden">
                <Tag ref={maskTextContainer} className={className}>
                    {children ?? text}
                </Tag>
            </div>
        );
    }

    return (
        <Tag ref={maskTextContainer} className={`text-reveal ${className}`.trim()}>
            {children ?? text}
        </Tag>
    );
}

export default TextMaskReveal