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
    triggerMode = "scroll", // "scroll" | "load"
    duration = 0.9,
    start = "top bottom",
    markers = false
}) => {

    const maskTextContainer = useRef(null);

    useGSAP(() => {
        const el = maskTextContainer.current;
        const isLoad = triggerMode === "load";

        let split;
        let animation;

        gsap.set(el, { opacity: 1 });

        document.fonts.ready.then(() => {
            split = SplitText.create(el, {
                type: "lines",
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

    }, { scope: maskTextContainer });


    return (
        <Tag ref={maskTextContainer} className={`text-reveal ${className}`.trim()}>
            {children ?? text}
        </Tag>
    );
}

export default TextMaskReveal