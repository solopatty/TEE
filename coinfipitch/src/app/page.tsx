"use client"

import { useState } from "react"
import AnimatedGridBackground from "@/components/ui/animatedbackground"
import { motion } from "framer-motion"

export default function Page() {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  return (
    <div className="relative min-h-screen bg-[#111111] text-white p-8 overflow-hidden">
      {/* Animated Background */}
      <AnimatedGridBackground
        onAnimationComplete={() => setIsAnimationComplete(true)}
      />
      {isAnimationComplete && (
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0 }} // Start hidden
          animate={{ opacity: 1 }} // Fade-in effect
          transition={{ duration: 1.5, ease: "easeInOut" }} // Smooth transition
        ></motion.div>
      )}
    </div>
  )
}
