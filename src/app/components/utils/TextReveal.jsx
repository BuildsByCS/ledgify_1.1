"use client"
import React, { useRef } from 'react'
import gsap from 'gsap'
import SplitText from "gsap/SplitText";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, ScrollTrigger);

const TextMaskReveal = ({
    text,
    children,
    as: Tag = "p",
    className = "",
    delay = 0,
    triggerMode = "scroll", // "scroll" | "load"
}) => {

    const textContainer = useRef(null);

    useGSAP(() => {
        let split;
        let animation;
        const isLoad = triggerMode === "load";

        gsap.set(textContainer.current, {
            opacity: 1,
        });

        document.fonts.ready.then(() => {

            split = SplitText.create(textContainer.current, {
                type: "chars, words, lines",
                autoSplit: true,
                onSplit: (self) => {
                    const wordProps = {
                        opacity: 0,
                        delay,
                        stagger: {
                            each: 0.060,
                            // amount:0.85,
                            from: "random",
                        },
                        duration: 0.6,
                        ease: "power2.out",
                    };

                    if (!isLoad) {
                        // Scroll mode: revert fires when user has scrolled past the
                        // element, so the DOM snap happens off-screen — no visible shift.
                        wordProps.scrollTrigger = {
                            trigger: textContainer.current,
                            start: "top bottom",
                            onComplete: () => self.revert()
                        };
                    }
                    // Load mode: intentionally NO self.revert().
                    // This is a one-shot animation that never replays, so the SplitText
                    // word spans can safely stay in the DOM at full opacity.
                    // Calling revert() here would cause a visible layout shift because
                    // the element is prominently on-screen when onComplete fires.

                    animation = gsap.from(self.words, wordProps);
                    return animation;
                }
            });

        });

        return () => {
            if (split) split.revert();
            if (animation) animation.kill();
        };

    }, { scope: textContainer });

    return (
        <Tag ref={textContainer} className={`text-reveal ${className}`.trim()}>
            {children ?? text}
        </Tag>
    )
}

export default TextMaskReveal