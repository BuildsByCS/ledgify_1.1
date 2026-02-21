'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './GridBackground.css';

/* Responsive cell size — recalculated on every build() call */
function getCellSize() {
    const w = window.innerWidth;
    if (w <= 500) return 30;
    if (w <= 768) return 40;
    return 60;
}

export default function GridBackground() {
    const containerRef = useRef(null);
    const cellsRef = useRef({});
    const cellSizeRef = useRef(60); // tracks current CELL size for onMove

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        /* ── Build grid cells — each cell IS a grid square (border) + trail target ── */
        const build = () => {
            const CELL = getCellSize();
            cellSizeRef.current = CELL; // keep onMove in sync
            container.innerHTML = '';
            cellsRef.current = {};

            const cols = Math.ceil(window.innerWidth / CELL) + 1;
            const rows = Math.ceil(window.innerHeight / CELL) + 1;

            container.style.width = `${cols * CELL}px`;
            container.style.height = `${rows * CELL}px`;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const div = document.createElement('div');
                    div.style.cssText = `
                        position: absolute;
                        left: ${c * CELL}px;
                        top:  ${r * CELL}px;
                        width: ${CELL}px;
                        height: ${CELL}px;
                        border-right:  1px solid rgba(130, 120, 255, 0.25);
                        border-bottom: 1px solid rgba(130, 120, 255, 0.25);
                        background: transparent;
                        pointer-events: none;
                    `;
                    container.appendChild(div);
                    cellsRef.current[`${c},${r}`] = div;
                }
            }
        };

        build();
        window.addEventListener('resize', build);

        /* ── Mouse trail — highlight cell under cursor then fade out ── */
        const onMove = (e) => {
            const CELL = cellSizeRef.current;
            const col = Math.floor(e.clientX / CELL);
            const row = Math.floor(e.clientY / CELL);
            const el = cellsRef.current[`${col},${row}`];
            if (!el) return;

            gsap.killTweensOf(el);
            gsap.timeline()
                .set(el, { background: 'rgba(108, 99, 255, 0.8)' })
                .to(el, { background: 'transparent', duration: 0.5, ease: 'power2.out', delay: 0.5 });
        };

        const onLeave = () => {
            Object.values(cellsRef.current).forEach(el => {
                gsap.to(el, { background: 'transparent', duration: 0.4, ease: 'power2.out' });
            });
        };

        window.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);

        return () => {
            window.removeEventListener('resize', build);
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <div className="grid-background">
            <div ref={containerRef} className="grid-background__cells" />
        </div>
    );
}
