import { clsx } from "clsx" // If you are using clsx as a utility

export function cn(...args: string[]) {
  return clsx(args) // Combines class names
}
