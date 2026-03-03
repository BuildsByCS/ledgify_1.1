'use client';


function WalletIcon() {
    // Wallet body path perimeter ≈ 74 units → trace segment 18, gap 74
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="overflow-visible">
            {/* ghost: faint full wallet outline */}
            <path
                d="M20 7H4C2.9 7 2 7.9 2 9v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"
                stroke="rgba(129,140,248,0.2)" strokeWidth="1.5" fill="rgba(99,102,241,0.08)"
                strokeLinecap="round" strokeLinejoin="round"
            />
            <path d="M2 11h20" stroke="rgba(129,140,248,0.15)" strokeWidth="1.2" />
            <path d="M7 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"
                stroke="rgba(129,140,248,0.15)" strokeWidth="1.2" strokeLinecap="round" />

            {/* trace: glowing segment traveling around wallet body */}
            <path
                d="M20 7H4C2.9 7 2 7.9 2 9v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"
                stroke="#818cf8" strokeWidth="2" fill="none"
                strokeDasharray="18 74"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                    animation: 'traceWalletLoop 2.4s linear infinite',
                    filter: 'drop-shadow(0 0 3px #818cf8)',
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

/**
 * TotalBalanceCard
 * Props:
 *   totalBalance      {number}
 *   selectedAccount   {string}
 *   accountBalance    {number|null}
 */
export default function TotalBalanceCard({ totalBalance, selectedAccount, accountBalance }) {
    return (
        // row-start-2 sm:row-start-1
        <div className=" bg-[#05070e] p-[clamp(0.875rem,2vw,1.5rem)] rounded-3xl border border-white/10 relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-2xl cursor-pointer">
            {/* glow */}
            <div className="absolute top-0 right-0 w-[clamp(5rem,12vw,8rem)] h-[clamp(5rem,12vw,8rem)] bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />

            {/* content */}
            <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <WalletIcon />
                </div>
                <div>
                    <p className="text-gray-400 small-text font-medium">
                        Total Balance (All Accounts)
                    </p>
                    <h3 className="mid-text font-medium">
                        ₹{totalBalance.toFixed(2)}
                    </h3>
                </div>
            </div>

            {/* selected account balance */}
            {selectedAccount && accountBalance !== null && (
                <div className="mt-2 pt-3 border-t border-white/5 relative z-10">
                    <p className="small-text text-gray-500 font-medium">
                        Selected Account Balance
                    </p>
                    <p className="mid-text font-medium font-bold text-indigo-300 font-mono">
                        ₹{accountBalance.toFixed(2)}
                    </p>
                    <p className="small-text text-gray-600 font-mono">
                        ...{selectedAccount.slice(-6)}
                    </p>
                </div>
            )}

            {/* rising particles */}
            {PARTICLES.map((p, i) => (
                <div
                    key={i}
                    className="absolute bottom-0 rounded-full pointer-events-none"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        background: `rgba(74, 81, 222, ${p.opacity})`,
                        boxShadow: `0 0 ${p.size * 2}px rgba(74, 81, 222, 1)`,
                        animation: `particleRise ${p.dur} ease-in infinite ${p.delay}`,
                    }}
                />
            ))}
        </div>
    );
}
