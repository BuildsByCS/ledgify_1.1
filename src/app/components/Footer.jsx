'use client';

import CenterLetterStagger from './utils/CenterLetterStagger';
import TextReveal from './utils/TextReveal';

export default function Footer() {
    return (
        <div className="relative z-5 p-[clamp(1rem,calc(0.8rem+3vw),4rem)]">
            <div className="flex justify-between items-end">
                <div>
                    <CenterLetterStagger
                        as="p"
                        className="landing-hero-text font-thin w-fit"
                        start="top bottom"
                        toggleActions="play none none reset"
                    >
                        Ledgify
                    </CenterLetterStagger>

                    {/* word-by-word reveal, slight delay so it enters after the big heading */}
                    <TextReveal
                        as="p"
                        mode="letters"
                        className="small-text leading-none"
                        start="top bottom"
                        delay={0.1}
                        yOffset={0}
                        fromOpacity={0}
                    >
                        A ledger-driven banking system
                    </TextReveal>
                </div>

                {/* letter-by-letter reveal for the short copyright string */}
                <TextReveal
                    as="p"
                    mode="letters"
                    className="small-text leading-none"
                    start="top bottom"
                    stagger={0.06}
                    delay={0.15}
                    yOffset={0}
                    fromOpacity={0}
                >
                    © 2026
                </TextReveal>
            </div>
        </div>
    );
}