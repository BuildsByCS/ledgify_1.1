"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import TextReveal from "../utils/TextReveal";
import TextMaskReveal from "../utils/TextMaskReveal";
import AuthPage from "./AuthPage";

// ─── Timing: must match PageTransition.jsx OVERLAY_HOLD + OVERLAY_WIPE ───────
const OVERLAY_OFFSET = 0.5 + 0.85 + 0.05; // total delay before content reveals

// ─── Landing content delays (relative to page load, begin after overlay exits) ─
const D = {
    tag: OVERLAY_OFFSET,
    h1Line1: OVERLAY_OFFSET + 0.10,
    h1Line2: OVERLAY_OFFSET + 0.20,
    h1Line3: OVERLAY_OFFSET + 0.30,
    body: OVERLAY_OFFSET + 0.40,
    authCard: OVERLAY_OFFSET + 0.40,
};

export default function Landing() {
    const tagRef = useRef(null);
    const authRef = useRef(null);

    useGSAP(() => {
        // ── 1. Tag pill ────────────────────────────────────────────────────
        gsap.from(tagRef.current, {
            opacity: 0,
            y: 18,
            delay: D.tag,
            duration: 0.6,
            ease: "power3.out",
        });

        // ── 2. Auth card ───────────────────────────────────────────────────
        gsap.from(authRef.current, {
            opacity: 0,
            x: 44,
            delay: D.authCard,
            duration: 0.9,
            ease: "power3.out",
        });
    });

    return (
        <>
            {/* ── Landing content ─────────────────────────────────────────── */}
            <div className="landing-container relative z-[2] h-fit pt-50 flex flex-col gap-20 lg:gap-0 lg:flex-row item-center justify-center pb-[clamp(1rem,calc(0.8rem+3vw),4rem)]">

                <div className="landing-left md:w-[70%] h-full">

                    {/* Tag pill */}
                    <div className="py-4" ref={tagRef}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#6c63ff]/10 border border-[#6c63ff]/[0.22] rounded-full">
                            <div className="animate-pulse w-[6px] h-[6px] rounded-full bg-[#a7a2fe] shadow-[0_0_8px_#6c63ff]" />
                            <span className="landing-tag-text text-[var(--accent-light)]">
                                Ledger-Based Payment System
                            </span>
                        </div>
                    </div>

                    {/* Hero headline — line-by-line mask reveal */}
                    <h1 className="font-bold landing-hero-text leading-tight">
                        <TextMaskReveal
                            as="span"
                            className="block"
                            triggerMode="load"
                            delay={D.h1Line1}
                            duration={0.85}
                        >
                            One ledger.
                        </TextMaskReveal>

                        <TextMaskReveal
                            as="span"
                            mode="block"
                            className="block bg-gradient-to-br from-[#6c63ff] via-[#a78bfa] to-[#63b3ed] bg-clip-text text-transparent opacity-0"
                            triggerMode="load"
                            delay={D.h1Line2}
                            duration={0.85}
                        >
                            Every transaction.
                        </TextMaskReveal>

                        <TextMaskReveal
                            as="span"
                            className="block"
                            triggerMode="load"
                            delay={D.h1Line3}
                            duration={0.85}
                        >
                            Zero Surprises.
                        </TextMaskReveal>
                    </h1>

                    {/* Body paragraph */}
                    <TextReveal
                        className="landing-body-text md:w-[70%] w-[100%] leading-tight pt-4"
                        triggerMode="load"
                        delay={D.body}
                    >A ledger-driven banking system where balances aren't guessed,
                        they're calculated, verified, and recorded step by step.
                    </TextReveal>
                </div>

                {/* Auth card */}
                <div
                    ref={authRef}
                    id="auth-section"
                    className="landing-right w-full lg:w-[40%] self-center flex items-center justify-center sm:justify-end lg:justify-center"
                >
                    <AuthPage />
                </div>

            </div>
        </>
    );
}