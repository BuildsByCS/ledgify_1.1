'use client';

import CenterLetterStagger from './utils/CenterLetterStagger';
import TextReveal from './utils/TextReveal';

export default function Footer() {
    return (
        <div className="relative z-[10] w-[100vw] p-[5%]">
            <div className="flex justify-between items-end">
                <div>
                    <CenterLetterStagger
                        as="p"
                        className="text-[17vw] xs:text-[12vw] sm:text-[12vw] lg:text-[12vw] font-thin w-fit"
                        start="top bottom"
                        toggleActions="play none none reset"
                    >
                        Ledgify
                    </CenterLetterStagger>

                    {/* word-by-word reveal, slight delay so it enters after the big heading */}
                    <TextReveal
                        as="p"
                        mode="letters"
                        className="text-[3vw] xs:text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] lg:text-[1.2vw] leading-none"
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
                    className="text-[3vw] xs:text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] lg:text-[1vw] leading-none"
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