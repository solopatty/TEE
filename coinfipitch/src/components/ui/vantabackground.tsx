"use client"

import { useEffect, useRef, useState } from "react"

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)

  useEffect(() => {
    const loadScripts = async () => {
      // Load Three.js first
      if (!document.querySelector("#three-js")) {
        const threeScript = document.createElement("script")
        threeScript.id = "three-js"
        threeScript.src =
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        threeScript.async = true
        document.body.appendChild(threeScript)

        threeScript.onload = () => {
          console.log("✅ THREE.js Loaded")
          // Load Vanta.js after Three.js
          const vantaScript = document.createElement("script")
          vantaScript.id = "vanta-js"
          vantaScript.src =
            "https://cdn.jsdelivr.net/gh/tengbao/vanta/dist/vanta.dots.min.js"
          vantaScript.async = true
          document.body.appendChild(vantaScript)

          vantaScript.onload = () => {
            console.log("✅ Vanta.js Loaded")
            if (window.VANTA && vantaRef.current) {
              const effect = window.VANTA.DOTS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.0,
                minWidth: 200.0,
                scale: 1.0,
                scaleMobile: 1.0,
                color: 0xffffff,
                backgroundColor: 0x15173c,
                size: 3.0,
                spacing: 20.0,
              })
              setVantaEffect(effect)
            }
          }
        }
      }
    }

    loadScripts()

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return (
    <div ref={vantaRef} className="absolute inset-0 w-full h-full z-[-1]" />
  )
}
