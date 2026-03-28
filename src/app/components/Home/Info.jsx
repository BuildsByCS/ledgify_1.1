import TextReveal from "../utils/TextReveal";

export default function Info() {
    return (
        <div className="relative z-[1] my-[clamp(4rem,10vw,12rem)] pt-[clamp(8rem,14vw,24rem)] pb-[clamp(4rem,8vw,12rem)] flex flex-col items-center justify-center">
            <p className="w-[100%] sm:w-[70%] md:w-[50%] lg:w-[40%] mid-text leading-tight text-center">
                Ledgify is a transaction engine designed around
                atomic transfers, immutable ledgers and
                idempotency, ensuring every financial operation
                is reliable, traceable, and consistent.
            </p>
        </div>
    );
}