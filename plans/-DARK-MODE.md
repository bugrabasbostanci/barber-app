🌙 Dark Mode Implementation Plan - Shadcn UI

📋 1. SHADCN UI DARK MODE ARCHİTECTURE

Current Tailwind + Shadcn Setup

// Mevcut durum analizi:
// ✅ Tailwind CSS v4 configured
// ✅ Shadcn/ui components installed  
 // ✅ CSS variables system ready
// ❌ Theme provider missing
// ❌ Dark mode toggle missing

Theme Implementation Strategy

// 1. Next.js + next-themes integration
// 2. CSS variables for color tokens
// 3. Tailwind dark: variants
// 4. Component-level theme support

🎨 2. THEME PROVIDER ARCHITECTURE

Core Dependencies Needed

{
"next-themes": "^0.2.1", // Theme management
"@types/next-themes": "^0.2.0"
}

Provider Structure

// providers/ThemeProvider.tsx
interface ThemeConfig {
defaultTheme: 'light' | 'dark' | 'system'
enableSystem: boolean
disableTransitionOnChange: boolean
storageKey: string
themes: string[]
}

// Layout integration:
// app/layout.tsx → ThemeProvider → QueryProvider → children

🎯 3. CSS VARIABLES & DESIGN TOKENS

Color System Extension

/_ globals.css - Light theme variables _/
:root {
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--primary-foreground: 210 40% 98%;
/_ ... existing tokens _/

    /* Dark mode specific */
    --card-dark: 222.2 84% 4.9%;
    --background-dark: 222.2 84% 4.9%;

}

/_ Dark theme variables _/
.dark {
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 217.2 91.2% 59.8%;
--primary-foreground: 222.2 84% 4.9%;
/_ ... dark variants _/
}

Barber Shop Brand Colors

/_ Brand-specific dark mode colors _/
.dark {
--barber-primary: 45 93% 58%; /_ Gold accent _/
--barber-secondary: 215 28% 17%; /_ Dark blue-gray _/
--barber-accent: 36 100% 53%; /_ Warm orange _/
--barber-neutral: 215 14% 34%; /_ Medium gray _/
}

🔧 4. COMPONENT IMPLEMENTATIONS

Dark Mode Toggle Component

// components/ui/theme-toggle.tsx
interface ThemeToggleProps {
variant?: 'icon' | 'switch' | 'dropdown'
size?: 'sm' | 'md' | 'lg'
position?: 'fixed' | 'relative'
}

// Variants:
// 1. Icon toggle (Sun/Moon)
// 2. Switch toggle
// 3. Dropdown (Light/Dark/System)

Theme-Aware Components

// components/ui/theme-aware-card.tsx
// Automatically adapts shadows, borders, backgrounds

// components/theme/barber-brand.tsx
// Brand-specific dark mode adaptations

📱 5. USER PREFERENCE MANAGEMENT

Storage Strategy

// Theme persistence:
// 1. localStorage for client preference
// 2. Cookie for SSR hydration
// 3. System preference detection
// 4. User profile integration (optional)

interface UserThemePrefs {
theme: 'light' | 'dark' | 'system'
autoSwitch: boolean
scheduleStart?: string // "20:00"
scheduleEnd?: string // "08:00"
}

Profile Integration

// contexts/theme-context.tsx
// Integrate with existing ProfileContext
// Save theme preference to user profile

🎨 6. COMPONENT ADAPTATIONS NEEDED

Existing Components to Update

// High Priority - Visual Impact:
// 1. Navigation/Header - Brand colors
// 2. Cards (Appointment, Profile) - Contrast
// 3. Buttons - Hover states
// 4. Forms - Input styling
// 5. Calendar - Date picker theming

// Medium Priority - UX:
// 6. Modals/Dialogs - Backdrop
// 7. Tabs - Active states
// 8. Badges - Status colors
// 9. Skeletons - Loading states

// Low Priority - Polish:
// 10. Icons - Theme variants
// 11. Shadows - Depth adjustment
// 12. Borders - Contrast

Brand-Specific Adaptations

// Barber shop specific theming:
// 1. Appointment cards - Dark elegance
// 2. Staff selection - Professional look
// 3. Time slots - Clear visibility
// 4. Calendar - Dark mode friendly
// 5. Profile page - Consistent branding

🚀 7. IMPLEMENTATION PHASES

Phase 1: Foundation (1-2 hours)

// 1. Install next-themes
// 2. Create ThemeProvider
// 3. Update layout.tsx
// 4. Basic CSS variables
// 5. Simple toggle component

Phase 2: Core Components (2-3 hours)

// 1. Update primary components
// 2. Brand color integration
// 3. Card/Button adaptations
// 4. Form styling updates
// 5. Navigation theming

Phase 3: Advanced Features (1-2 hours)

// 1. User preference persistence
// 2. System theme detection
// 3. Advanced toggle variants
// 4. Profile integration
// 5. Auto-switching (optional)

Phase 4: Polish & Testing (1 hour)

// 1. Component testing
// 2. Contrast validation
// 3. Accessibility check
// 4. Performance optimization
// 5. Animation polish

📍 8. INTEGRATION POINTS

Layout Structure

// app/layout.tsx
export default function RootLayout({ children }) {
return (
<html lang="tr" suppressHydrationWarning>
<body className={`${geistSans.variable} ${geistMono.variable}`}>
<ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="barber-app-theme"
          >
<QueryProvider>
{children}
</QueryProvider>
</ThemeProvider>
</body>
</html>
)
}

Header Integration

// components/layouts/header.tsx
// Add theme toggle to navigation
// Position: Right side, next to user menu

User Experience Flow

// 1. System detection on first visit
// 2. Toggle in header for quick access
// 3. Preference in user profile settings
// 4. Smooth transitions between themes
// 5. Persist across sessions

🎯 9. SUCCESS CRITERIA

Functionality Requirements

- ✅ Light/Dark/System theme support
- ✅ User preference persistence
- ✅ Smooth theme transitions
- ✅ SSR hydration compatibility
- ✅ Mobile responsive toggle

Design Requirements

- ✅ Brand consistency in both themes
- ✅ Proper contrast ratios (WCAG AA)
- ✅ Professional barber shop aesthetic
- ✅ Component visual harmony
- ✅ Loading state theming

Performance Requirements

- ✅ No layout shift during theme change
- ✅ Fast theme switching (<100ms)
- ✅ Minimal bundle size impact
- ✅ Efficient CSS variables usage

🔄 10. MAINTENANCE CONSIDERATIONS

Future-Proofing

// 1. Custom theme variants (seasonal?)
// 2. Brand theme customization
// 3. Component theme variants
// 4. Advanced scheduling options
// 5. Accessibility improvements

---

📊 ESTIMATED EFFORT: 6-8 hours total

Priority Order:

1. Phase 1 (Foundation) - Critical for basic functionality
2. Phase 2 (Core Components) - Essential for user experience
3. Phase 3 (Advanced Features) - Nice-to-have features
4. Phase 4 (Polish) - Quality improvements

Risk Mitigation:

- Test hydration issues early
- Validate contrast ratios
- Check existing component compatibility
- Ensure mobile responsiveness

Bu plan Shadcn UI'nin built-in dark mode desteğini kullanarak professional bir dark mode implementation  
 sağlayacak. Barber shop brand'ine uygun, kullanıcı dostu ve performant bir çözüm olacak.
