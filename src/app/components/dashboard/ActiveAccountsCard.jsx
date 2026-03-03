'use client';


function TrendingIcon() {
    // trace sweeps bottom-left → top-right (upward direction)
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="overflow-visible">

            {/* ghost: faint full trending line */}
            <polyline
                points="2,18 9.5,10.5 13.5,14.5 22,7"
                stroke="rgba(74,222,128,0.2)" strokeWidth="1.6"
                fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* ghost: faint arrow head */}
            <polyline
                points="22,13 22,7 16,7"
                stroke="rgba(74,222,128,0.2)" strokeWidth="1.6"
                fill="none" strokeLinecap="round" strokeLinejoin="round"
            />

            {/* trace: segment sweeping bottom-to-top along trend line */}
            <polyline
                points="2,18 9.5,10.5 13.5,14.5 22,7"
                stroke="#4ade80" strokeWidth="2.2"
                fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="12 40"
                style={{
                    animation: 'traceTrendLine 1.8s linear infinite',
                    filter: 'drop-shadow(0 0 3px #4ade80)',
                }}
            />

            {/* trace: segment sweeping along arrow */}
            <polyline
                points="22,13 22,7 16,7"
                stroke="#4ade80" strokeWidth="2.2"
                fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="8 24"
                style={{
                    animation: 'traceTrendArrow 1.8s linear infinite 0.5s',
                    filter: 'drop-shadow(0 0 3px #4ade80)',
                }}
            />

        </svg>
    );
}

const PARTICLES = [
    { left: '10%', delay: '0s', dur: '4s', size: 3, opacity: 0.5 },
    { left: '28%', delay: '1.2s', dur: '5s', size: 2, opacity: 0.3 },
    { left: '48%', delay: '0.5s', dur: '3.5s', size: 2, opacity: 0.4 },
    { left: '65%', delay: '2s', dur: '4.5s', size: 3, opacity: 0.35 },
    { left: '80%', delay: '0.8s', dur: '3.8s', size: 2, opacity: 0.45 },
    { left: '91%', delay: '1.6s', dur: '4.2s', size: 2, opacity: 0.3 },
];

const CURRENCY_SYMBOLS = [
    { top: '60%', left: '7%', delay: '0s', dur: '5s', size: '10px' },
    { top: '50%', left: '72%', delay: '1.5s', dur: '6s', size: '20px' },
    { top: '75%', left: '88%', delay: '0.7s', dur: '4.5s', size: '15px' },
];

/**
 * ActiveAccountsCard
 * Props:
 *   activeCount {number}
 */
export default function ActiveAccountsCard({ activeCount }) {
    return (
        <div className="bg-[#05070e] p-[clamp(0.875rem,2vw,1.5rem)] rounded-3xl border border-white/10 relative overflow-hidden group hover:border-green-500/50 transition-all shadow-2xl cursor-pointer">

            {/* ghost trending-chart */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 300 130"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="chartLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(74,222,128,0)" />
                        <stop offset="40%" stopColor="rgba(74,222,128,0.18)" />
                        <stop offset="100%" stopColor="rgba(74,222,128,0.06)" />
                    </linearGradient>
                    <linearGradient id="chartFillGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(74,222,128,0.08)" />
                        <stop offset="100%" stopColor="rgba(74,222,128,0)" />
                    </linearGradient>
                </defs>

                {/* area fill */}
                <path
                    d="M0,110 L40,95 L80,100 L110,80 L145,70 L175,55 L210,45 L250,30 L300,18 L300,130 L0,130 Z"
                    fill="url(#chartFillGrad)"
                />

                {/* chart line with draw-on animation */}
                <path
                    d="M0,110 L40,95 L80,100 L110,80 L145,70 L175,55 L210,45 L250,30 L300,18"
                    fill="none"
                    stroke="url(#chartLineGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        strokeDasharray: 600,
                        animation: 'chartDraw 3s ease-out forwards, chartPulse 4s ease-in-out 3s infinite',
                    }}
                />

                {/* glowing dot at chart tip */}
                <circle cx="300" cy="18" r="4" fill="rgba(74,222,128,0.5)"
                    style={{ animation: 'tipPulse 1.8s ease-in-out infinite' }} />
                <circle cx="300" cy="18" r="7" fill="rgba(74,222,128,0.12)"
                    style={{ animation: 'tipPulse 1.8s ease-in-out infinite 0.3s' }} />
            </svg>

            {/* upward-drifting green particles */}
            {PARTICLES.map((p, i) => (
                <div
                    key={i}
                    className="absolute bottom-0 rounded-full pointer-events-none"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        background: `rgba(74,222,128,${p.opacity})`,
                        boxShadow: `0 0 ${p.size * 2}px rgba(74,222,128,0.6)`,
                        animation: `particleRise ${p.dur} ease-in infinite ${p.delay}`,
                    }}
                />
            ))}

            {/* floating ₹ currency symbols */}
            {CURRENCY_SYMBOLS.map((r, i) => (
                <span
                    key={i}
                    className="absolute pointer-events-none font-mono font-bold select-none"
                    style={{
                        top: r.top,
                        left: r.left,
                        fontSize: r.size,
                        color: 'rgba(74,222,128,0.35)',
                        animation: `floatSymbol ${r.dur} ease-in-out infinite ${r.delay}`,
                    }}
                >₹</span>
            ))}

            {/* glow */}
            <div className="absolute top-0 right-0 w-[clamp(5rem,12vw,8rem)] h-[clamp(5rem,12vw,8rem)] bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-green-500/20" />

            {/* content */}
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <TrendingIcon />
                </div>
                <div>
                    <p className="text-gray-400 small-text font-medium">
                        Active Accounts
                    </p>
                    <h3 className="mid-text font-medium">
                        {activeCount}
                    </h3>
                </div>
            </div>
        </div>
    );
}
