'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * TextReveal — scroll-triggered stagger reveal for letters OR words
 *
 * Props:
 *  - children        {string}   Text to animate
 *  - as              {string}   HTML tag to render           (default: 'p')
 *  - className       {string}   Classes applied to the tag
 *  - mode            {string}   'letters' | 'words'          (default: 'words')
 *  - start           {string}   ScrollTrigger start          (default: 'top 88%')
 *  - toggleActions   {string}   ScrollTrigger toggleActions  (default: 'play none none none')
 *  - stagger         {number}   Delay between each unit (s)  (default: auto per mode)
 *  - duration        {number}   Per-unit animation duration  (default: 0.75 words / 0.15 letters)
 *  - ease            {string}   GSAP easing                  (default: 'expo.out')
 *  - delay           {number}   Global delay before anim     (default: 0)
 *  - yOffset         {number}   Slide-up distance in %       (default: 105)
 *  - clipOverflow    {boolean}  Wrap each unit in overflow-hidden (default: true)
 */
export default function TextReveal({
    children,
    as: Tag = 'p',
    className = '',
    mode = 'words',
    start = 'top 88%',
    toggleActions = 'play none none none',
    stagger,
    duration,          // undefined → resolved per mode inside effect
    ease = 'power4.out',
    delay = 0,
    yOffset = 105,
    clipOverflow = true,
    fromOpacity = 0,   // starting opacity (0 = fully hidden before anim)
    markers = false,
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const rawText = container.textContent ?? '';

        // ── Split into units (letters or words) ───────────────────────────
        let units = [];

        if (mode === 'letters') {
            units = rawText.split('').map((ch) => ({
                html: ch === ' ' ? '&nbsp;' : ch,
                isSpace: ch === ' ',
            }));
        } else {
            // words — keep spaces as separate non-animated nodes
            units = rawText.split(' ').map((word, i, arr) => ({
                html: word,
                isSpace: false,
                addSpaceAfter: i < arr.length - 1,
            }));
        }

        // ── Render spans ──────────────────────────────────────────────────
        // Each animatable unit is wrapped in a clip div + inner span
        // Spaces in letter mode are plain text nodes (no animation needed)
        container.innerHTML = units
            .map(({ html, isSpace, addSpaceAfter }) => {
                if (mode === 'letters' && isSpace) {
                    // Non-breaking space between letters — no clip needed
                    return `<span style="display:inline-block">&nbsp;</span>`;
                }
                return `<span class="inline-block ${clipOverflow ? 'overflow-hidden' : ''} align-bottom leading-tight" style="vertical-align:bottom">` +
                    `<span class="unit inline-block" style="will-change:transform">${html}</span>` +
                    `</span>${addSpaceAfter ? '<span style="display:inline-block">&nbsp;</span>' : ''}`;
            })
            .join('');

        const units_els = container.querySelectorAll('.unit');

        // ── Defaults per mode ─────────────────────────────────────────────
        const staggerVal = stagger ?? (mode === 'letters' ? 0.025 : 0.1);
        const durationVal = duration ?? (mode === 'letters' ? 0.75 : 0.75);

        // ── Initial state ─────────────────────────────────────────────────
        gsap.set(units_els, { yPercent: yOffset, opacity: fromOpacity });

        // ── Build timeline inside matchMedia for responsive triggers ──────
        const mm = gsap.matchMedia();

        const createTimeline = (startValue) => {
            const tl = gsap.timeline({
                delay,
                scrollTrigger: {
                    trigger: container,
                    start: startValue,
                    toggleActions,
                    invalidateOnRefresh: true,
                    markers
                },
            });

            tl.to(units_els, {
                yPercent: 0,
                opacity: 1,   // always animate TO fully visible
                duration: durationVal,
                ease,
                stagger: staggerVal,
            });

            return tl;
        };

        if (typeof start === 'object') {
            // Responsive config passed: { "(min-width: 768px)": "top 88%", ... }
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
        ro.observe(container);

        // ── Isolated cleanup — only kills THIS instance's trigger ─────────
        return () => {
            ro.disconnect();
            mm.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Tag ref={containerRef} className={className}>
            {children}
        </Tag>
    );
}
