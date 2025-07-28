# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Turkish barber appointment management system** built as a Next.js application. The system enables customers to book appointments online and provides barbers (salon owners) with a management interface to handle bookings, schedules, and availability.

### Key Business Rules
- **Working hours**: 09:30 - 21:30 daily
- **Appointment duration**: Fixed 45 minutes for all services
- **Closed day**: Sundays (no appointments)
- **Booking window**: Customers can book up to 7 days in advance
- **Cancellation policy**: Customers can cancel up to 2 hours before appointment time

## Tech Stack & Architecture

- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **UI Components**: shadcn/ui with Radix UI primitives

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components/ui` - shadcn/ui components
- `/lib` - Utility functions and configurations
  - `/lib/supabase` - Supabase client configurations (browser, server, middleware)
  - `/lib/auth.ts` - Authentication functions
- `/prisma` - Database schema and migrations
- `/docs/prd.md` - Product Requirements Document (in Turkish)

## Database Setup

The project uses Prisma with PostgreSQL. Database schema is defined in `/prisma/schema.prisma`. The project integrates with Supabase for authentication and potentially as the database provider.

## Authentication Flow

Authentication is handled through Supabase with separate client configurations for:
- Browser-side operations (`lib/supabase/client.ts`)
- Server-side operations (`lib/supabase/server.ts`) 
- Middleware operations (`lib/supabase/middleware.ts`)

## User Roles

1. **Customer**: Can register, book appointments, view their bookings, and cancel appointments
2. **Barber (Admin)**: Has management panel access for viewing calendar, managing appointments, blocking time slots, and creating manual bookings

## Component Architecture

Uses shadcn/ui component system with:
- TypeScript path aliases (`@/*` points to root)
- Class variance authority for component variants
- Tailwind CSS for styling with CSS variables
- Lucide React for icons

When developing new features, follow the existing patterns in the codebase and refer to the Turkish PRD document for business requirements.