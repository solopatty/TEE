"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import AnimatedGridBackground from "@/components/ui/animatedbackground"
import { FlipWords } from "@/components/ui/flip-words"
import CoinLogo from "@/lib/icons/coinlogo"
import VantaBackground from "@/components/ui/vantabackground"

export default function Page() {
  const { scrollYProgress } = useScroll()

  // Define target heights for each section
  const sectionHeights = [
    window.innerHeight, // Height of the hero section
    window.innerHeight * 2, // Height of the first section
    window.innerHeight * 3, // Height of the second section
  ]

  // Function to scroll to a specific height
  const scrollToSection = (height: number) => {
    window.scrollTo({
      top: height,
      behavior: "smooth", // Smooth scrolling
    })
  }

  // Effect to handle keydown events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        // Get the current scroll position
        const currentScroll = window.scrollY

        // Determine the next section to scroll to
        const nextSectionIndex = sectionHeights.findIndex(
          (height) => height > currentScroll
        )
        if (nextSectionIndex !== -1) {
          scrollToSection(sectionHeights[nextSectionIndex])
        }
      }
    }

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <motion.div className="relative min-h-screen overflow-hidden" tabIndex={0}>
      {/* Hero Section with Vanta Background */}
      <div className="relative h-screen flex justify-center items-center px-4">
        {/* Vanta.js Background (Only for hero section) */}
        <VantaBackground />

        {/* Content */}
        <div className="relative z-10 grid grid-cols-2 gap-4 items-center ml-10">
          <div className="flex justify-center items-center mr-20">
            <CoinLogo />
          </div>
          <div className="ml-64">
            <div className="text-4xl font-normal text-neutral-500 dark:text-white text-center leading-snug">
              <span className="block">The most</span>
              <span className="block relative min-w-[12rem]">
                <FlipWords
                  words={["Trustworthy", "Secure", "User-Friendly"]}
                  duration={2500}
                />
              </span>
              <span className="block">experience in crypto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Change on Scroll */}
      <motion.div className="absolute inset-0 w-full h-full z-[-1]" />

      {/* Section 1 */}
      <motion.section
        className="h-screen flex flex-col items-center justify-center bg-black text-white p-10"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1.2 }}
      >
        <h2 className="text-5xl font-semibold">Unparalleled Security</h2>
        <p className="max-w-2xl text-center mt-4">
          Our system ensures that your transactions are not only seamless but
          also protected by the most advanced cryptographic measures.
        </p>
      </motion.section>

      {/* Section 2 */}
      <motion.section
        className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-10"
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 1.5 }}
      >
        <h2 className="text-5xl font-semibold">Fast & Reliable Transactions</h2>
        <motion.p
          className="max-w-2xl text-center mt-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Experience transactions at the speed of light with our optimized
          blockchain infrastructure.
        </motion.p>
      </motion.section>
    </motion.div>
  )
}
