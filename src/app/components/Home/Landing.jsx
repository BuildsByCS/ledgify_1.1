import AuthPage from "./AuthPage";

export default function Landing() {
    return (
        <div className="landing-container relative z-[2] pt-50 flex flex-col gap-20 lg:gap-0 lg:flex-row item-center justify-center p-[5%] min-h-[70vh]">

            <div className="landing-left md:w-[60%]">

                {/* Tag */}
                <div className="py-6">
                    <div className="inline-flex items-center gap-2 px-4 py-[7px] bg-[#6c63ff]/10 border border-[#6c63ff]/[0.22] rounded-full">
                        <div className="animate-pulse w-[6px] h-[6px] rounded-full bg-[#a7a2fe] shadow-[0_0_8px_#6c63ff]" />
                        <span className="text-[2.7vw] xs:text-[2vw] sm:text-[1.5vw] md:text-[1.2vw] lg:text-[1vw] text-[var(--accent-light)]">
                            Ledger-Based Payment System
                        </span>
                    </div>
                </div>


                <h1 className="font-bold text-[9vw] xs:text-[8vw] sm:text-[7vw] md:text-[6vw] lg:text-[5vw] leading-none">
                    One ledger.
                    <br />
                    <span className="bg-gradient-to-br from-[#6c63ff] via-[#a78bfa] to-[#63b3ed] bg-clip-text text-transparent">
                        Every transaction.
                    </span>
                    <br />
                    Zero Surprises.
                </h1>


                <p className="text-[3.6vw] xs:text-[2.8vw] sm:text-[2vw] md:text-[1.5vw] lg:text-[1.1vw] md:w-[70%] w-[100%] leading-tight pt-4">A ledger-driven banking system where balances aren’t guessed, they’re calculated, verified, and recorded step by step.</p>
            </div>

            <div id="auth-section" className="landing-right w-full lg:w-[40%] self-center flex items-center justify-center sm:justify-end lg:justify-center">
                <AuthPage />
            </div>

        </div>
    );
}