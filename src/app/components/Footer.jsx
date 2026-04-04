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

                    <TextReveal as="p" className="small-text leading-none">
                        A ledger-driven banking system
                    </TextReveal>
                </div>

                <TextReveal as="p" className="small-text leading-none">
                    © 2026
                </TextReveal>
            </div>
        </div>
    );
}