import AuthPage from "./AuthPage";

export default function Landing() {
    return (
        <div className="landing-container relative z-[2] h-fit pt-50 flex flex-col gap-20 lg:gap-0 lg:flex-row item-center justify-center pb-[clamp(1rem,calc(0.8rem+3vw),4rem)] ">

            <div className="landing-left md:w-[70%] h-full">

                {/* Tag */}
                <div className="py-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#6c63ff]/10 border border-[#6c63ff]/[0.22] rounded-full">
                        <div className="animate-pulse w-[6px] h-[6px] rounded-full bg-[#a7a2fe] shadow-[0_0_8px_#6c63ff]" />
                        <span className="landing-tag-text text-[var(--accent-light)]">
                            Ledger-Based Payment System
                        </span>
                    </div>
                </div>


                <h1 className="font-bold landing-hero-text leading-none">
                    One ledger.
                    <br />
                    <span className="bg-gradient-to-br from-[#6c63ff] via-[#a78bfa] to-[#63b3ed] bg-clip-text text-transparent">
                        Every transaction.
                    </span>
                    <br />
                    Zero Surprises.
                </h1>


                <p className="landing-body-text md:w-[70%] w-[100%] leading-tight pt-4">A ledger-driven banking system where balances aren't guessed, they're calculated, verified, and recorded step by step.</p>
            </div>

            <div id="auth-section" className="landing-right w-full lg:w-[40%] self-center flex items-center justify-center sm:justify-end lg:justify-center">
                <AuthPage />
            </div>

        </div>
    );
}