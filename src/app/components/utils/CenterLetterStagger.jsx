'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * TextStagger — center-outward character stagger animation
 *
 * Props:
 *  - children        {string}   The text to animate
 *  - as              {string}   HTML tag to render  (default: 'p')
 *  - className       {string}   Classes for the text element
 *  - start           {string|object} ScrollTrigger start (default: 'top 75%'). Can be an object mapping media queries to start strings.
 *  - toggleActions   {string}   ScrollTrigger toggleActions
 *  - staggerDelay    {number}   Seconds between each group (default: 0.08)
 *  - duration        {number}   Per-char animation duration (default: 0.6)
 *  - ease            {string}   GSAP easing (default: 'power3.out')
 *  - from            {object}   Override initial "from" state
 *  - clipOverflow    {boolean}  Wrap in overflow-hidden div (default: true)
 */
export default function CenterLetterStagger({
    children,
    as: Tag = 'p',
    className = '',
    start = 'top 75%',
    toggleActions = 'play reverse play reverse',
    staggerDelay = 0.08,
    duration = 0.6,
    ease = 'power3.out',
    from = { yPercent: 110, opacity: 0 },
    clipOverflow = true,
    markers = false,
}) {
    const textRef = useRef(null);

    useEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const text = el.textContent;
        const chars = text.split('');
        const len = chars.length;

        // ── Wrap each char in a span ──────────────────────────────────────
        el.innerHTML = chars
            .map((ch, i) => `<span data-idx="${i}" style="display:inline-block">${ch === ' ' ? '&nbsp;' : ch}</span>`)
            .join('');

        const spans = el.querySelectorAll('span');

        // ── Build center-outward animation order ──────────────────────────
        // Odd  len=7 → [3, 2, 4, 1, 5, 0, 6]
        // Even len=6 → [2, 3, 1, 4, 0, 5]  (pairs share a step)
        const order = [];
        if (len % 2 === 1) {
            const mid = Math.floor(len / 2);
            order.push(mid);
            for (let d = 1; d <= mid; d++) order.push(mid - d, mid + d);
        } else {
            const midL = len / 2 - 1;
            const midR = len / 2;
            for (let d = 0; midL - d >= 0; d++) order.push(midL - d, midR + d);
        }

        // ── Set initial hidden state ──────────────────────────────────────
        gsap.set(spans, from);

        // ── Build timeline inside matchMedia for responsive triggers ──────
        const mm = gsap.matchMedia();

        const createTimeline = (startValue) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: startValue,
                    toggleActions,
                    markers,
                    invalidateOnRefresh: true,
                },
            });

            order.forEach((charIdx, step) => {
                const delay = len % 2 === 1
                    ? step * staggerDelay
                    : Math.floor(step / 2) * staggerDelay;

                tl.to(
                    spans[charIdx],
                    { yPercent: 0, opacity: 1, duration, ease },
                    delay
                );
            });
            return tl;
        };

        if (typeof start === 'object') {
            // Responsive config passed: { "(min-width: 768px)": "top 75%", ... }
            Object.entries(start).forEach(([query, startVal]) => {
                mm.add(query, () => {
                    createTimeline(startVal);
                });
            });
        } else {
            // Flat string config
            mm.add("all", () => {
                createTimeline(start);
            });
        }

        // ── Refresh ST when container size changes (fixes mobile spacing) ─
        const ro = new ResizeObserver(() => {
            ScrollTrigger.refresh();
        });
        ro.observe(el);

        return () => {
            ro.disconnect();
            mm.revert(); // Automatically kills all timelines and scrollTriggers created inside it
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const text = (
        <Tag ref={textRef} className={className}>
            {children}
        </Tag>
    );

    if (!clipOverflow) return text;

    return <div className="overflow-hidden">{text}</div>;
}
