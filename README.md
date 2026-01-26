# Alex Zheng's Personal Website

A high-end personal website featuring an interactive 3D solar system with real-time planet tracking.

## Features

- **Interactive 3D Solar System**: Real-time planet tracking with accurate orbital mechanics
- **EST Time Display**: Live clock showing Eastern Standard Time
- **Smooth Navigation**: Click planets to navigate to different pages
- **Modern UI**: High-end, polished interface with smooth animations
- **Responsive Design**: Works beautifully on all devices

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:4321`

### Build

```bash
npm run build
```

The built site will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the main branch.

### GitHub Pages Setup

1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The workflow will automatically build and deploy on push to `main`

### Domain Configuration

To change the domain name:

1. **For local development**: Update the `site` field in `astro.config.mjs`
2. **For GitHub Pages**: 
   - Add a secret named `SITE` in your repository settings (Settings → Secrets and variables → Actions)
   - Set the value to your domain (e.g., `https://yourdomain.com`)
   - If using a subdirectory, also add a `BASE_PATH` secret (e.g., `/repo-name`)

The default placeholder domain is `zhalex414.com` and can be easily changed at any time.

## Project Structure

```
/
├── .github/workflows/    # GitHub Actions deployment workflow
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── components/       # React components (SolarSystem, Navigation, etc.)
│   ├── layouts/          # Astro layouts
│   ├── pages/            # Route pages
│   └── styles/           # Global styles
├── astro.config.mjs      # Astro configuration
├── package.json          # Dependencies
└── tailwind.config.mjs   # Tailwind CSS configuration
```

## Technologies Used

- **Astro**: Static site framework
- **React**: UI components
- **Three.js**: 3D graphics and solar system visualization
- **React Three Fiber**: React renderer for Three.js
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety

## Pages

- **Home** (`/`): Interactive solar system
- **Projects** (`/projects`): Project showcase (to be filled)
- **Timeline** (`/timeline`): Personal timeline (to be filled)
- **Socials** (`/socials`): Social media links (to be filled)
- **Resume** (`/resume`): Resume/CV (to be filled)
- **Personal** (`/personal`): Personal information (to be filled)

## Notes

- The solar system uses simplified orbital mechanics for visualization
- Planet positions are calculated based on real orbital periods (scaled for visualization)
- All UI elements are custom-styled (no browser-native elements)
- The site is optimized for performance with high-quality graphics
