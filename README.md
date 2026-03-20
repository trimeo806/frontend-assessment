# SkyBook

A full-stack flight booking application built with Next.js and the Duffel Flights API.

## Live Demo

https://sky-book.vercel.app

## Features

- Airport search with real-time auto-suggestions
- One-way and round-trip flight search
- Real-time flight results with advanced filters (stops, airline, time, price)
- Flexible sorting (price, duration, departure time)
- Passenger details form with validation
- Booking confirmation via Duffel API
- Animated UI with smooth transitions
- Multi-language support (English, Malay, Chinese)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| State | Zustand |
| Animations | Framer Motion (motion/react v12) |
| i18n | next-intl |
| API | Duffel Flights API |
| Deployment | Vercel |

## Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- Free Duffel account (get one at https://app.duffel.com)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd easyGDS/assessments/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Duffel test API key to `.env.local`:
   ```
   DUFFEL_API_KEY=your_test_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser.

## Documentation

See `ARCHITECTURE.md` for architectural decisions, competitor analysis, and AI tool usage.
