'use client';

import { useState } from 'react';
import { Copy, Check, CheckCircle, XCircle, Snowflake } from 'lucide-react';

/* ─── Copy to clipboard button ─── */
export function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button
            type="button"
            onClick={copy}
            className="ml-2 text-gray-500 hover:text-indigo-400 transition-colors flex-shrink-0 cursor-pointer"
            title="Copy"
        >
            {copied
                ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" />
                : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
        </button>
    );
}

/* ─── Account status badge ─── */

/**
 * Two variants:
 *  - "dot"  (default) — small dot + text, used in the transactions page dropdowns
 *  - "icon"           — lucide icon + text, used in AccountDetailModal
 *
 * Pass variant="icon" to get the modal-style badge.
 */
export function StatusBadge({ status, variant = 'dot' }) {
    if (variant === 'icon') {
        const s = status?.toLowerCase() ?? 'active';
        const map = {
            active: { icon: <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, label: 'Active', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
            frozen: { icon: <Snowflake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, label: 'Frozen', cls: 'bg-blue-500/15  text-blue-400  border-blue-500/30' },
            closed: { icon: <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, label: 'Closed', cls: 'bg-red-500/15   text-red-400   border-red-500/30' },
        };
        const { icon, label, cls } = map[s] ?? map.active;
        return (
            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-[10px] font-medium ${cls}`}>
                {icon}{label}
            </span>
        );
    }

    // default "dot" variant
    const active = status?.toUpperCase() === 'ACTIVE';
    return (
        <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-[10px] font-medium ${active
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
            : 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
            <span className={`w-1 h-1 rounded-full ${active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
            {status}
        </span>
    );
}
