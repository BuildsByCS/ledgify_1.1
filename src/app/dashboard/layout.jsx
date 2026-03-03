

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#0c0f23] text-[#f0f2ff] overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scrollbar-hide pb-20 w-full max-w-[1800px] mx-auto ">
                {children}
            </main>
        </div>
    );
}
