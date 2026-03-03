'use client';

import { Send } from 'lucide-react';
import Link from 'next/link';


function Wallet() {
    // Wallet body perimeter ≈ 74 units → segment 18, gap 74
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

            {/* trace: glowing segment looping around wallet body */}
            <path
                d="M20 7H4C2.9 7 2 7.9 2 9v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"
                stroke="#818cf8" strokeWidth="2" fill="none"
                strokeDasharray="18 74"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                    animation: 'traceWalletLoop 2.2s linear infinite',
                    filter: 'drop-shadow(0 0 3px #818cf8)',
                }}
            />

        </svg>
    );
}


function Recipient() {
    // Head circle circumference ≈ 20 units, shoulder arc ≈ 22 units
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="overflow-visible">

            {/* ghost: faint head circle */}
            <circle cx="12" cy="8" r="3.2"
                stroke="rgba(74,222,128,0.2)" strokeWidth="1.5" fill="rgba(74,222,128,0.06)" />
            {/* ghost: faint shoulder arc */}
            <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7"
                stroke="rgba(74,222,128,0.2)" strokeWidth="1.5"
                strokeLinecap="round" fill="none" />

            {/* trace: segment sweeping around head circle */}
            <circle cx="12" cy="8" r="3.2"
                stroke="#4ade80" strokeWidth="2"
                fill="none"
                strokeDasharray="10 20"
                strokeLinecap="round"
                style={{
                    animation: 'traceHeadCircle 1.8s linear infinite',
                    filter: 'drop-shadow(0 0 3px #4ade80)',
                }}
            />

            {/* trace: segment sweeping along shoulder arc */}
            <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7"
                stroke="#4ade80" strokeWidth="2"
                fill="none" strokeLinecap="round"
                strokeDasharray="12 30"
                style={{
                    animation: 'traceShoulderArc 1.8s linear infinite 0.6s',
                    filter: 'drop-shadow(0 0 3px #4ade80)',
                }}
            />

        </svg>
    );
}


export default function PayTransferCard() {
    return (
        <div className="row-start-1 sm:col-span-2 lg:col-span-1 lg:col-start-3 bg-[#05070e] p-[clamp(0.875rem,2vw,1.5rem)] rounded-3xl border border-white/10 relative overflow-hidden group hover:border-blue-500/50 transition-all flex flex-col justify-center shadow-2xl cursor-pointer">
            {/* glow */}
            <div className="absolute top-0 right-0 w-[clamp(5rem,12vw,8rem)] h-[clamp(5rem,12vw,8rem)] bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20" />

            {/* animated transfer widget */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 w-full">

                {/* floating transaction chips */}
                <div className="relative w-full flex justify-center h-8">
                    <span
                        style={{ animation: 'floatChip1 3.5s ease-in-out infinite' }}
                        className="absolute text-[8px] sm:text-[10px] font-mono bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full left-[2%]"
                    >
                        −₹3000
                    </span>
                    <span
                        style={{ animation: 'floatChip2 3.2s ease-in-out infinite 0.4s' }}
                        className="absolute text-[8px] sm:text-[10px] font-mono bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full right-[2%]"
                    >
                        +₹3000
                    </span>
                    <span
                        style={{ animation: 'floatChip3 4s ease-in-out infinite' }}
                        className="absolute text-[8px] sm:text-[10px] font-mono bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full left-[30%]"
                    >
                        +₹5,000
                    </span>
                </div>

                {/* beam & node animation */}
                <div className="relative flex items-center justify-between w-full px-2">

                    {/* left wallet node */}
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            style={{ animation: 'nodePulse 2s ease-in-out infinite' }}
                            className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                        >
                            <Wallet />
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono">You</span>
                    </div>

                    {/* animated SVG beam */}
                    <div className="flex-1 mx-2 relative" style={{ height: '20px' }}>
                        <svg width="100%" height="20" className="overflow-visible">
                            {/* glowing track */}
                            <line
                                x1="0" y1="10" x2="100%" y2="10"
                                stroke="rgba(99,102,241,0.15)"
                                strokeWidth="2"
                                strokeDasharray="4 3"
                            />
                            {/* packets */}
                            <circle r="3" cy="10" fill="#818cf8" filter="url(#glow)" opacity="0.9">
                                <animateMotion dur="1.6s" repeatCount="indefinite" path="M0,0 L200,0" />
                                <animate attributeName="opacity" values="0;1;1;0" dur="1.6s" repeatCount="indefinite" />
                            </circle>
                            <circle r="2.5" cy="10" fill="#a5b4fc" filter="url(#glow)" opacity="0.7">
                                <animateMotion dur="1.6s" begin="0.55s" repeatCount="indefinite" path="M0,0 L200,0" />
                                <animate attributeName="opacity" values="0;0.8;0.8;0" dur="1.6s" begin="0.55s" repeatCount="indefinite" />
                            </circle>
                            <circle r="2" cy="10" fill="#c7d2fe" filter="url(#glow)" opacity="0.5">
                                <animateMotion dur="1.6s" begin="1.1s" repeatCount="indefinite" path="M0,0 L200,0" />
                                <animate attributeName="opacity" values="0;0.6;0.6;0" dur="1.6s" begin="1.1s" repeatCount="indefinite" />
                            </circle>
                            <defs>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                        </svg>
                    </div>

                    {/* right recipient node */}
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            style={{ animation: 'nodePulse 2s ease-in-out infinite 0.3s' }}
                            className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(74,222,128,0.25)]"
                        >
                            <Recipient />
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono">Recipient</span>
                    </div>
                </div>

                {/* CTA Button */}
                <Link
                    href="/dashboard/transactions"
                    className="w-full base-text font-medium flex items-center justify-center gap-2.5 bg-indigo-600/20 hover:bg-indigo-500/40 text-indigo-400 hover:text-white py-4 rounded-xl transition-all border border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] mt-1"
                >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    Pay
                </Link>
            </div>
        </div>
    );
}
