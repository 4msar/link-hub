"use client"

import * as React from "react"
import type { Transition, Variants } from "framer-motion"

/**
 * Radix dialogs unmount immediately on close, which cuts off exit animations.
 * The Root wrappers track `open` here so Content can drive AnimatePresence
 * and keep itself mounted (forceMount) until the exit animation finishes.
 */
export const DialogOpenContext = React.createContext(false)

export function useControllableOpen({
  open: openProp,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  )
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return [open, setOpen] as const
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
}

const enterSpring: Transition = { type: "spring", duration: 0.4, bounce: 0.18 }

export const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: enterSpring },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 6,
    transition: { duration: 0.15, ease: "easeIn" },
  },
}

export const pressable = {
  whileHover: { scale: 1.08 },
  whileTap: { scale: 0.9 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
} as const
