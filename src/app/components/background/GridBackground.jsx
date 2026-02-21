'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './GridBackground.css';

const DESKTOP_BREAKPOINT = 768;

/* Responsive cell size */
function getCellSize() {
    const w = window.innerWidth;
    if (w <= 500) return 30;
    if (w <= 768) return 40;
    return 60;
}

/* Direction movement vectors */
const DIR_VECTORS = {
    right: { dc: 1, dr: 0 },
    left: { dc: -1, dr: 0 },
    down: { dc: 0, dr: 1 },
    up: { dc: 0, dr: -1 },
};

/* Weighted turns — heavily biased toward straight, rare 90° turns, no U-turns */
const TURN_OPTIONS = {
    right: ['right', 'right', 'right', 'right', 'right', 'down', 'up'],
    left: ['left', 'left', 'left', 'left', 'left', 'down', 'up'],
    down: ['down', 'down', 'down', 'down', 'down', 'right', 'left'],
    up: ['up', 'up', 'up', 'up', 'up', 'right', 'left'],
};

/* Pick a random cell on a screen edge with the inward-facing direction */
function randomEdgeStart(cols, rows) {
    const edge = Math.floor(Math.random() * 4); // 0=top 1=bottom 2=left 3=right
    if (edge === 0) return { c: Math.floor(Math.random() * cols), r: 0, dir: 'down' };
    if (edge === 1) return { c: Math.floor(Math.random() * cols), r: rows - 1, dir: 'up' };
    if (edge === 2) return { c: 0, r: Math.floor(Math.random() * rows), dir: 'right' };
    return { c: cols - 1, r: Math.floor(Math.random() * rows), dir: 'left' };
}

export default function GridBackground() {
    const containerRef = useRef(null);
    const cellsRef = useRef({});
    const cellSizeRef = useRef(60);
    const colsRef = useRef(0);
    const rowsRef = useRef(0);
    const activeStartsRef = useRef(new Set()); // active trail start positions
    const activeCellsRef = useRef(new Set()); // currently glowing cells (for cheap onLeave)

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        /* ── Build grid cells ── */
        const build = () => {
            const CELL = getCellSize();
            cellSizeRef.current = CELL;
            container.innerHTML = '';
            cellsRef.current = {};

            const cols = Math.ceil(window.innerWidth / CELL) + 1;
            const rows = Math.ceil(window.innerHeight / CELL) + 1;
            colsRef.current = cols;
            rowsRef.current = rows;

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
                        border-right:  1px solid rgba(130, 120, 255, 0.18);
                        border-bottom: 1px solid rgba(130, 120, 255, 0.18);
                        background: transparent;
                        pointer-events: none;
                    `;
                    container.appendChild(div);
                    cellsRef.current[`${c},${r}`] = div;
                }
            }
        };

        /* ── Flash a single cell — tracks active state for cheap onLeave ── */
        const flashCell = (col, row) => {
            const el = cellsRef.current[`${col},${row}`];
            if (!el) return;
            gsap.killTweensOf(el);
            activeCellsRef.current.add(el);
            gsap.timeline()
                .set(el, { background: 'rgba(108, 99, 255, 0.4)' })
                .to(el, {
                    background: 'transparent',
                    duration: 1.2,
                    ease: 'power2.out',
                    delay: 0.35,
                    onComplete: () => activeCellsRef.current.delete(el), // untrack when fully faded
                });
        };

        /* ──────────────────────────────────────────────────────────
           SNAKE TRAIL
           - Starts at any screen edge, walks cell by cell inward
           - Occasionally turns 90° but mostly goes straight
           - Stops naturally when it exits the opposite edge
           - Calls onDone() when complete for the loop to respawn
        ─────────────────────────────────────────────────────────── */
        const runSnakeTrail = (onDone) => {
            const cols = colsRef.current;
            const rows = rowsRef.current;
            if (!cols || !rows) { onDone?.(); return () => { }; }

            // Try up to 6 times to find a start not too close to existing trails
            let start = randomEdgeStart(cols, rows);
            for (let attempt = 0; attempt < 6; attempt++) {
                const candidate = randomEdgeStart(cols, rows);
                let tooClose = false;
                for (const key of activeStartsRef.current) {
                    const [ac, ar] = key.split(',').map(Number);
                    if (Math.abs(ac - candidate.c) < 5 && Math.abs(ar - candidate.r) < 5) {
                        tooClose = true;
                        break;
                    }
                }
                if (!tooClose) { start = candidate; break; }
            }

            let { c, r, dir } = start;
            const startKey = `${c},${r}`;
            activeStartsRef.current.add(startKey);

            // 180–320ms between each cell step → full crossing ~3–6s
            const stepMs = Math.floor(Math.random() * 140) + 180;
            let timerId = null;
            let stopped = false;

            const walk = () => {
                if (stopped) return;

                flashCell(c, r);

                // Choose next direction (weighted toward straight)
                dir = TURN_OPTIONS[dir][Math.floor(Math.random() * TURN_OPTIONS[dir].length)];
                const { dc, dr } = DIR_VECTORS[dir];
                c += dc;
                r += dr;

                // Exited the grid → trail complete
                if (c < 0 || c >= cols || r < 0 || r >= rows) {
                    activeStartsRef.current.delete(startKey);
                    onDone?.();
                    return;
                }

                timerId = setTimeout(walk, stepMs);
            };

            timerId = setTimeout(walk, 0);

            return () => {
                stopped = true;
                clearTimeout(timerId);
                activeStartsRef.current.delete(startKey);
            };
        };

        /* ──────────────────────────────────────────────────────────
           TRAIL LOOP
           Chains snake trails end-to-end with a short gap between.
        ─────────────────────────────────────────────────────────── */
        const makeTrailLoop = (initialDelay = 0) => {
            let alive = true;
            let stopCurrentTrail = null;
            let gapTimer = null;

            const spawnNext = () => {
                if (!alive) return;
                stopCurrentTrail = runSnakeTrail(() => {
                    if (!alive) return;
                    // Random gap: 0.4–1.6s before next trail starts
                    gapTimer = setTimeout(spawnNext, Math.random() * 1200 + 400);
                });
            };

            gapTimer = setTimeout(spawnNext, initialDelay);

            return () => {
                alive = false;
                clearTimeout(gapTimer);
                stopCurrentTrail?.();
            };
        };

        /* ── Mouse trail (desktop only) ── */
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
            // Only animate the cells that are actually glowing — not all 600+
            activeCellsRef.current.forEach(el => {
                gsap.killTweensOf(el);
                gsap.to(el, {
                    background: 'transparent',
                    duration: 0.4,
                    ease: 'power2.out',
                    onComplete: () => activeCellsRef.current.delete(el),
                });
            });
        };

        /* ── State holders for teardown ── */
        let activeLoopStops = [];
        let idleLoopStops = [];
        let idleTimer = null;

        const teardown = () => {
            activeLoopStops.forEach(fn => fn()); activeLoopStops = [];
            idleLoopStops.forEach(fn => fn()); idleLoopStops = [];
            clearTimeout(idleTimer);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousemove', onMouseActivity);
            document.removeEventListener('mouseleave', onLeave);
            activeStartsRef.current.clear();
        };

        /* Idle detection for desktop: 3s no mouse → 2 auto-trails */
        const onMouseActivity = () => {
            idleLoopStops.forEach(fn => fn()); idleLoopStops = [];
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                idleLoopStops = [
                    makeTrailLoop(0),
                    makeTrailLoop(Math.random() * 1000 + 600),
                ];
            }, 3000);
        };

        /* ── Mode setup ── */
        const setup = () => {
            teardown();
            const isDesktop = window.innerWidth > DESKTOP_BREAKPOINT;

            if (isDesktop) {
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mousemove', onMouseActivity);
                document.addEventListener('mouseleave', onLeave);
                // Start idle trails on load (fires after 3s if no mouse movement)
                idleTimer = setTimeout(() => {
                    idleLoopStops = [
                        makeTrailLoop(0),
                        makeTrailLoop(Math.random() * 1000 + 600),
                    ];
                }, 3000);
            } else {
                // Mobile ≤500px: 4 trails  |  Tablet 501–768px: 5 trails
                const count = window.innerWidth <= 500 ? 4 : 5;
                for (let i = 0; i < count; i++) {
                    activeLoopStops.push(makeTrailLoop(i * (Math.random() * 600 + 300)));
                }
            }
        };

        build();
        setup();

        const handleResize = () => { build(); setup(); };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            teardown();
        };
    }, []);

    return (
        <div className="grid-background">
            <div ref={containerRef} className="grid-background__cells" />
        </div>
    );
}
