import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TypographyProps {
  children: ReactNode
  className?: string
}

// Heading Components
export function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl font-sans",
      className
    )}>
      {children}
    </h1>
  )
}

export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "scroll-m-20 text-3xl font-semibold tracking-tight font-sans",
      className
    )}>
      {children}
    </h2>
  )
}

export function TypographyH3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "scroll-m-20 text-2xl font-semibold tracking-tight font-sans",
      className
    )}>
      {children}
    </h3>
  )
}

export function TypographyH4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(
      "scroll-m-20 text-xl font-semibold tracking-tight font-sans",
      className
    )}>
      {children}
    </h4>
  )
}

// Body Text
export function TypographyP({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "leading-7 [&:not(:first-child)]:mt-6 font-sans",
      className
    )}>
      {children}
    </p>
  )
}

// Large Text for Hero Sections
export function TypographyLarge({ children, className }: TypographyProps) {
  return (
    <div className={cn(
      "text-lg font-semibold font-sans",
      className
    )}>
      {children}
    </div>
  )
}

// Small Text for Captions
export function TypographySmall({ children, className }: TypographyProps) {
  return (
    <small className={cn(
      "text-sm font-medium leading-none font-sans",
      className
    )}>
      {children}
    </small>
  )
}

// Muted Text
export function TypographyMuted({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm text-muted-foreground font-sans",
      className
    )}>
      {children}
    </p>
  )
}

// Code/Monospace Text
export function TypographyCode({ children, className }: TypographyProps) {
  return (
    <code className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-mono font-semibold",
      className
    )}>
      {children}
    </code>
  )
}

// Inline Code
export function TypographyInlineCode({ children, className }: TypographyProps) {
  return (
    <code className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-mono",
      className
    )}>
      {children}
    </code>
  )
}

// Lead Text for Introductions
export function TypographyLead({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-xl text-muted-foreground font-sans font-light",
      className
    )}>
      {children}
    </p>
  )
}

// Blockquotes
export function TypographyBlockquote({ children, className }: TypographyProps) {
  return (
    <blockquote className={cn(
      "mt-6 border-l-2 pl-6 italic font-sans",
      className
    )}>
      {children}
    </blockquote>
  )
}

// Lists
export function TypographyList({ children, className }: TypographyProps) {
  return (
    <ul className={cn(
      "my-6 ml-6 list-disc [&>li]:mt-2 font-sans",
      className
    )}>
      {children}
    </ul>
  )
}

export function TypographyOrderedList({ children, className }: TypographyProps) {
  return (
    <ol className={cn(
      "my-6 ml-6 list-decimal [&>li]:mt-2 font-sans",
      className
    )}>
      {children}
    </ol>
  )
}

// Barber App Specific Typography
export function BrandTitle({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "text-3xl md:text-4xl font-bold tracking-tight font-sans text-blue-600",
      className
    )}>
      {children}
    </h1>
  )
}

export function SectionTitle({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "text-2xl font-semibold tracking-tight mb-4 font-sans",
      className
    )}>
      {children}
    </h2>
  )
}

export function ServiceTitle({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "text-lg font-semibold font-sans",
      className
    )}>
      {children}
    </h3>
  )
}

export function AppointmentTime({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-lg font-mono font-semibold tracking-wider",
      className
    )}>
      {children}
    </span>
  )
}

export function PriceText({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-xl font-bold font-mono text-green-600",
      className
    )}>
      {children}
    </span>
  )
}