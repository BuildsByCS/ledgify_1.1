'use client';

import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';


/*  Recharts sub-component  */

function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const d = payload[0]?.payload;
        if (!d) return null;
        const isCredit = d.type === 'CREDIT';
        return (
            <div className="bg-[#0d1230]/95 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl min-w-[160px]">
                <div className="flex items-center gap-2 mb-3">
                    <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isCredit ? '#4ade80' : '#f87171' }}
                    />
                    <span className="small-text font-bold tracking-widest uppercase"
                        style={{ color: isCredit ? '#4ade80' : '#f87171' }}>
                        {d.type}
                    </span>
                </div>
                <p className="text-white font-mono font-bold mid-text">
                    {isCredit ? '+' : '-'}₹{d.amount.toLocaleString()}
                </p>
                <p className="text-gray-400 small-text mt-1">
                    Balance: <span className="text-gray-200 font-mono">₹{d.balance.toLocaleString()}</span>
                </p>
                <p className="text-gray-500 small-text mt-0.5">{d.dateLabel} · {d.label}</p>
            </div>
        );
    }
    return null;
}

function CustomDot({ cx, cy, payload }) {
    if (cx == null || cy == null) return null;
    const isCredit = payload?.type === 'CREDIT';
    const color = isCredit ? '#4ade80' : '#f87171';
    const glow = isCredit ? '#4ade8066' : '#f8717166';
    return (
        <g key={`dot-${payload?.index}`} cursor="pointer">
            <circle cx={cx} cy={cy} r={9} fill={glow} />
            <circle cx={cx} cy={cy} r={5} fill={color} stroke="#0d1230" strokeWidth={2} />
        </g>
    );
}

function CustomActiveDot({ cx, cy, payload }) {
    if (cx == null || cy == null) return null;
    const isCredit = payload?.type === 'CREDIT';
    const color = isCredit ? '#4ade80' : '#f87171';
    const glow = isCredit ? '#4ade8088' : '#f8717188';
    return (
        <g cursor="pointer">
            <circle cx={cx} cy={cy} r={13} fill={glow} />
            <circle cx={cx} cy={cy} r={7} fill={color} stroke="#0d1230" strokeWidth={2} />
        </g>
    );
}

/*  Main component  */

/**
 * CashFlowChart
 * Props:
 *   chartData       {Array}   — processed series from page.jsx
 *   chartLoading    {boolean}
 *   mounted         {boolean}
 *   selectedAccount {string}
 *   accounts        {Array}
 *   onAccountChange {fn}      — called with new account ID
 */
export default function CashFlowChart({
    chartData,
    chartLoading,
    mounted,
    selectedAccount,
    accounts,
    onAccountChange,
}) {
    return (
        <div className=" bg-[#05070e] rounded-3xl border border-white/10 hover:border-white/40 overflow-hidden p-[clamp(0.5rem,2vw,1.5rem)] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 relative shadow-2xl">
            {/* header row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-[clamp(1rem,3vw,1.5rem)]">
                <div className='py-2 px-4 sm:p-0'>
                    <h2 className="mid-text font-medium">Cash Flow</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 small-text text-gray-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                            Credit
                        </span>
                        <span className="flex items-center gap-1.5 small-text text-gray-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                            Debit
                        </span>
                        <span className="flex items-center gap-1.5 small-text text-gray-400">
                            <span className="w-8 h-0.5 bg-indigo-400 inline-block" />
                            Balance
                        </span>
                    </div>
                </div>

                {/* account selector */}
                <div className="relative self-end">
                    <select
                        value={selectedAccount}
                        onChange={(e) => onAccountChange(e.target.value)}
                        className="small-text appearance-none bg-[#0c0f23] border border-white/10 text-gray-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer font-medium transition-all hover:bg-[#0c0f23]/80"
                    >
                        {accounts.map(acc => (
                            <option className='cursor-pointer' key={acc._id} value={acc._id}>
                                Account: ...{acc._id.slice(-6)}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* chart area */}
            <div className="w-full h-[clamp(200px,35vw,420px)] mt-4 relative">
                {chartLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#05070e]/70 backdrop-blur-sm z-10 rounded-2xl">
                        <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin" />
                    </div>
                )}

                {mounted && !chartLoading && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" >
                        <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                            <defs>
                                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />

                            <XAxis
                                dataKey="index"
                                type="number"
                                domain={[0, chartData.length - 1]}
                                tickCount={Math.min(chartData.length, 8)}
                                stroke="rgba(255,255,255,0.0)"
                                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                tickFormatter={(idx) => chartData[idx]?.label ?? ''}
                            />

                            <YAxis
                                stroke="rgba(255,255,255,0.0)"
                                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `₹${v.toLocaleString()}`}
                                width={50}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />

                            <Line
                                type="monotone"
                                dataKey="balance"
                                stroke="#818cf8"
                                strokeWidth={2.5}
                                dot={<CustomDot />}
                                activeDot={<CustomActiveDot />}
                                animationDuration={900}
                                animationEasing="ease-out"
                                isAnimationActive={true}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : !chartLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                        <p>No transaction history for this account.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
