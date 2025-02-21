import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const GRID_SIZE = 25
const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789абвгдеёжзийклмнопрстуфхцчшщъыьэюя汉字かなカナ한글العربيةहिन्दीবাংলাதமிழ்ไทยမြန်မာ".split(
    ""
  )
const COLORS = [
  "text-yellow-400",
  "text-red-400",
  "text-green-400",
  "text-blue-400",
]
const GLOW_CLASSES = [
  "shadow-yellow-500",
  "shadow-red-500",
  "shadow-green-500",
  "shadow-blue-500",
]

const generateGrid = () => {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    return {
      char: "",
      color: "",
      glow: "",
      appeared: false,
      processed: false,
      delay: (Math.floor(i / GRID_SIZE) + (i % GRID_SIZE)) * 0.03,
    }
  })
}

export default function AnimatedGridBackground({ onAnimationComplete }) {
  const [grid, setGrid] = useState(() => generateGrid())
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    let row = 0
    const interval = setInterval(() => {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((cell, i) => {
          const currentRow = Math.floor(i / GRID_SIZE)
          if (
            currentRow === row &&
            Math.random() < 0.2 &&
            !cell.appeared &&
            !cell.processed
          ) {
            const colorIndex = Math.floor(Math.random() * COLORS.length)
            return {
              ...cell,
              char: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)],
              color: COLORS[colorIndex],
              glow: GLOW_CLASSES[colorIndex],
              appeared: true,
              processed: true,
            }
          }
          return cell
        })
        row++
        if (row >= GRID_SIZE) {
          clearInterval(interval)
          setTimeout(() => {
            setIsAnimating(false)
            if (onAnimationComplete) onAnimationComplete()
          }, 1250)
        }
        return newGrid
      })
    }, 50)
  }, [onAnimationComplete])

  return (
    <motion.div
      className="fixed inset-0 w-full h-full overflow-hidden z-0"
      initial={{ backgroundColor: "#1e1e1e" }}
      animate={{ backgroundColor: isAnimating ? "#1e1e1e" : "#0b1a2d" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Ensure grid covers the full page including header height */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full grid gap-1 p-4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(3vw, 1fr))`,
          gridTemplateRows: `repeat(${GRID_SIZE}, minmax(3vw, 1fr))`,
          minHeight: "100vh", // Ensure it takes full viewport height
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        {grid.map((cell, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-center bg-gray-800 rounded-sm"
            style={{ width: "100%", height: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isAnimating ? 1 : 0 }}
            transition={{ duration: 0.4, delay: cell.delay }}
          >
            {cell.char && cell.appeared && (
              <motion.span
                className={cn(
                  "text-lg font-bold",
                  cell.color,
                  cell.glow,
                  "drop-shadow-lg animate-pulse"
                )}
                initial={{ opacity: 0, scale: 1 }}
                animate={{
                  opacity: 1,
                  scale: 1.2,
                  textShadow: "0px 0px 8px currentColor",
                }}
                exit={{
                  opacity: 0,
                  scale: 1.5,
                  textShadow: "0px 0px 12px currentColor",
                }}
                transition={{ duration: 0.6, dexslay: cell.delay }}
                onAnimationComplete={() => {
                  setGrid((prevGrid) => {
                    const updatedGrid = [...prevGrid]
                    updatedGrid[i].char = ""
                    updatedGrid[i].color = ""
                    updatedGrid[i].glow = ""
                    return updatedGrid
                  })
                }}
              >
                {cell.char}
              </motion.span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
