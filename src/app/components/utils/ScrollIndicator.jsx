'use client';

import { useRef } from 'react';
import { useLenis } from 'lenis/react';
import './ScrollIndicator.css';

export default function ScrollIndicator() {
    const leftFillRef = useRef(null);
    const rightFillRef = useRef(null);

    // Direct DOM write — no useState, no re-render, zero lag
    useLenis(({ progress }) => {
        const pct = `${progress * 100}%`;
        if (leftFillRef.current) leftFillRef.current.style.height = pct;
        if (rightFillRef.current) rightFillRef.current.style.height = pct;
    });

    return (
        <>
            {/* <div className="scroll-indicator scroll-indicator--left" aria-hidden="true">
                <div ref={leftFillRef} className="scroll-indicator__fill" />
            </div> */}
            <div className="scroll-indicator scroll-indicator--right" aria-hidden="true">
                <div ref={rightFillRef} className="scroll-indicator__fill" />
            </div>
        </>
    );
}
