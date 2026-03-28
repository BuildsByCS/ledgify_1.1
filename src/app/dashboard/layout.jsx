

export default function DashboardLayout({ children }) {
    return (
        <div className="flex bg-[#0c0f23] max-w-[1920px] mx-auto text-[#f0f2ff] overflow-hidden">
            <main className="flex-1 overflow-y-auto p-[clamp(1rem,4vw,2rem)] relative z-10 scrollbar-hide pb-20 w-full h-full ">
                {children}
            </main>
        </div>
    );
}
