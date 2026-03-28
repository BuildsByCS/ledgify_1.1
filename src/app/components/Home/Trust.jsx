import TextReveal from "../utils/TextReveal";

export default function Trust() {
    return (
        <div className="relative z-[1] flex flex-col py-[clamp(4rem,10vw,12rem)]  my-[clamp(4rem,10vw,12rem)] items-center justify-end text-start">
            <h2 className="w-full text-start large-text leading-tight">
                A System Designed Around Trust
            </h2>
            <div className="w-full pt-2 md:pt-2 pb-10 lg:pb-12">
                <p className="w-full sm:w-[70%] md:w-[55%] lg:w-[40%] base-text text-white/80 leading-tight">
                    In financial systems, trust is built through transparency and consistency.
                    Ledgify focuses on building that trust through a ledger-based architecture
                    where every financial operation is traceable, verifiable, and reliable.
                </p>
            </div>
        </div>
    );
}