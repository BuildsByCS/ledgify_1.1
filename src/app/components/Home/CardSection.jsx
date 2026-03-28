"use client"

import React from 'react'
import Card from './Card'
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const cardDetails = [
    {
        title: "Ledger First",
        para: "Balances are computed based on ledger entries. No manual balance mutation. Ever."
    },
    {
        title: "Verified Transfered",
        para: "Users & their accounts validity, availability and balance are checked before a transaction even begins."
    },
    {
        title: "Atomic Transactions",
        para: "Transfers execute in controlled steps, ensuring consistency, even if something fails midway your amount is never deducted."
    }
];

const CardSection = () => {

    const containerRef = useRef(null);
    const cardRefs = useRef([]);
    useGSAP(() => {
        const cards = cardRefs.current;
        let mm = gsap.matchMedia();

        mm.add({
            isSmallScreen: "(max-width: 768px)",
            // isTablet: "(min-width: 601px) and (max-width: 850px)",
            isLargeScreen: "(min-width: 769px)"
        }, (context) => {
            const { isSmallScreen, isLargeScreen } = context.conditions;

            if(isSmallScreen){
                // flipping the cards on trigger
                cards.forEach((card, index) => {
                    const frontEl = card.querySelector(".card-front");
                    const backEl = card.querySelector(".card-back");

                    gsap.set(frontEl, { rotateY: 0 });
                    gsap.set(backEl, { rotateY: 180 });

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: card,
                            start: "top 60%",
                            end: "top 55%",
                            scrub: 1,
                            id: `rotate-flip-${index}`,
                        }
                    });

                    tl.to(frontEl, { rotateY: 180, ease: "none" }, 0)
                      .to(backEl, { rotateY: 360, ease: "none" }, 0);
                })
            }

            if (isLargeScreen) {
                const totalScrollHeight = window.innerHeight * 3;
                const positions = [22, 50, 78];
                const rotations = [-15, 0, 15];

                // pinning the cards for 300vh
                ScrollTrigger.create({
                    trigger: containerRef.current.querySelector(".cards"),
                    start: "center center",
                    end: () => `+=${totalScrollHeight}`,
                    pin: true,
                    pinSpacing: true,
                });


                // positioning & rotation the card
                cards.forEach((card, index) => {
                    const frontEl = card.querySelector(".card-front");
                    const backEl = card.querySelector(".card-back");

                    gsap.set(card, {
                        xPercent: -50,
                        yPercent: -50,
                        x: 0,
                        y: 0,
                        rotate: `${rotations[index]}`,
                    })

                    // hand over the rotateY to gsap immediately so that there's no snap on first update
                    gsap.set(frontEl, { rotateY: 0 });
                    gsap.set(backEl, { rotateY: 180 });

                    gsap.to(card, {
                        left: `${positions[index]}%`,
                        ease: "none",
                        immediateRender: false,
                        scrollTrigger: {
                            trigger: containerRef.current.querySelector(".cards"),
                            start: "center center",
                            end: () => `+=${totalScrollHeight}`,
                            scrub: 0.5,
                            id: `spread-${index}`
                        },
                    })
                })


                // flipping the card in staggering effect
                cards.forEach((card, index) => {
                    const frontEl = card.querySelector(".card-front");
                    const backEl = card.querySelector(".card-back");

                    const staggerOffset = index * 0.05;
                    const startOffset = 1 / 3 + staggerOffset;
                    const endOffset = 2 / 3 + staggerOffset;

                    ScrollTrigger.create({
                        trigger: containerRef.current.querySelector(".cards"),
                        start: "center center",
                        end: () => `+=${totalScrollHeight}`,
                        scrub: 1,
                        id: `rotate-flip-${index}`,
                        onUpdate: (self) => {
                            const progress = self.progress;

                            if (progress >= startOffset && progress <= endOffset) {
                                const animationProgress = (progress - startOffset) / (1 / 3);
                                const frontRotation = 180 * animationProgress;
                                const backRotation = 180 + 180 * animationProgress;
                                const cardRotation = rotations[index] * (1 - animationProgress);

                                gsap.to(frontEl, { rotateY: frontRotation, ease: "power.out" });
                                gsap.to(backEl, { rotateY: backRotation, ease: "power1.out" });
                                gsap.to(card, {
                                    xPercent: -50,
                                    yPercent: -50,
                                    x: 0,
                                    y: 0,
                                    rotate: cardRotation,
                                    ease: "power1.out",
                                    transformStyle: "preserve-3d",
                                })
                            }
                        }
                    })
                })

            }

            return () => {
                cards.forEach(card => {
                    const frontEl = card.querySelector(".card-front");
                    const backEl = card.querySelector(".card-back");
                    const targets = [card, frontEl, backEl].filter(Boolean);
                    gsap.killTweensOf(targets);
                    gsap.set(targets, { clearProps: "all" });
                });
            };
        })
    }, { scope: containerRef });



    return (
        <section ref={containerRef} className="card-page-container">
            <div className="cards">
                {
                    cardDetails.map((card, index) => (
                        <Card
                            key={index}
                            id={`card-${index + 1}`}
                            count={`0${index + 1}`}
                            frontSrc="/legidy-card-front.png"
                            frontAlt="Card Image"
                            title={card.title}
                            para={card.para}
                            ref={(el) => (cardRefs.current[index] = el)}
                        />
                    ))
                }
            </div>
        </section>
    )
}

export default CardSection