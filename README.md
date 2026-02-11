# Alex Zheng Personal Website

Interactive personal site built with Astro + React, centered around a space-themed panorama and an explorable solar-system home scene.

## Tech Stack

- Astro 4 (`output: static`)
- React 18 (`@astrojs/react`)
- Tailwind CSS 3 (`@astrojs/tailwind`)
- Three.js + React Three Fiber + Drei (home solar system)
- Framer Motion (UI animation + motion interactions)
- TypeScript

## Local Development

Prerequisites:
- Node.js 18+ (Node 20 used in CI)
- npm

Install and run:

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev` / `npm start`: start Astro dev server
- `npm run build`: production build to `dist/`
- `npm run preview`: serve built output

## Site Architecture

This app uses a single persistent layout and client-side panorama navigation:

- `src/layouts/Layout.astro`
  - mounts global star/panorama background
  - mounts top planet nav and panorama carousel
  - provides hidden slot (`#page-slot`) used as the source DOM for page hydration into panorama panes
- `src/components/PanoramaCarousel.tsx`
  - defines page order and horizontal pane navigation
  - supports keyboard arrows, swipe, nav events, and left/right buttons
  - lazy-loads page content into panes via fetch + DOM parsing
- `src/components/PlanetNav.tsx`
  - fixed top planetary nav
  - emits `panorama-navigate` events to control the carousel

## Home Scene

`src/pages/index.astro` renders:
- `SolarSystem` (Three.js scene with Sun, planets, asteroid belt, Kuiper belt, satellite)
- `UFOCursor` (custom cursor + hover beam behavior)
- `TimeDisplay` (America/New_York clock)
- `NameDisplay`, `HomepageNameCard`, `MoveAroundHint`
- `ParallaxBackground` background motion logic

## Routes

- `/` home solar system
- `/gallery` cursor-stamped gallery interactions
- `/timeline` timeline page scaffold
- `/projects` project cards
- `/research` research cards
- `/education` interactive asteroid-course field
- `/experience` clickable Saturn-like rings with experience detail panel
- `/saturn` dedicated Saturn visual page
- `/honors` clickable rings with honors detail panel
- `/hobbies` animated hobby objects (Rubik's cube, Tetris block, Set card)
- `/skills` interactive comet-skill field
- `/contacts` social/contact cards

## Key Source Paths

- `src/pages/*` page routes
- `src/components/SolarSystem.tsx` 3D scene logic
- `src/components/PanoramaCarousel.tsx` panoramic page system
- `src/components/PlanetNav.tsx` top navigation
- `src/components/ExperienceRings.tsx` / `src/components/HonorsRings.tsx` ring UIs
- `src/components/GalleryMouseStamps.tsx` gallery effect
- `src/styles/global.css` shared global styling/animations

## Styling

- Tailwind for utility styling
- substantial custom CSS in `src/styles/global.css` for:
  - magical hover/text effects
  - asteroid/comet systems
  - Saturn/Mars scenes
  - ring panels/interactions
  - panorama and transition behavior

## Deployment

GitHub Actions workflow: `.github/workflows/deploy.yml`

Behavior:
- triggers on pushes to `main` (and manual dispatch)
- installs dependencies with `npm ci`
- builds with:
  - `SITE` from `secrets.SITE` (fallback `https://zhalex414.com`)
  - `BASE_PATH` from `secrets.BASE_PATH` (fallback `/`)
- deploys `dist/` to GitHub Pages

## Notes

- panorama navigation is event-driven (`panorama-navigate` / `carousel-navigate`)
- page title updates are handled client-side in the carousel based on the active route
- `.npmrc` uses `legacy-peer-deps=true`
