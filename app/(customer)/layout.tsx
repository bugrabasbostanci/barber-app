import { ReactNode } from 'react'

interface CustomerLayoutProps {
  children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <>
      {/* Customer-specific layout wrapper */}
      {/* İleride customer-specific header, navigation veya sidebar eklenebilir */}
      <div className="customer-layout">
        {children}
      </div>
      
      {/* Customer-specific scripts, analytics, vs. buraya eklenebilir */}
    </>
  )
}