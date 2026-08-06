# VehicleVerse E/E Architecture Explorer

Interactive Automotive Electrical & Electronic Architecture Explorer — visualize vehicle communication, AUTOSAR stacks, and feature signal flows.

## Tech Stack

- **Next.js 16** with App Router
- **React 19** + TypeScript
- **TailwindCSS 4** — dark engineering theme with glassmorphism
- **Framer Motion** — UI animations and transitions
- **React Flow (@xyflow/react)** — interactive ECU architecture graph
- **Zustand** — state management
- **GSAP / D3.js** — available for advanced animations

## Features

- **Full-screen dashboard** with left sidebar, center architecture view, right inspector, and bottom communication monitor
- **29 ECUs** across body, powertrain, chassis, ADAS, comfort, infotainment, and safety domains
- **5 vehicle networks** — CAN HS, CAN LS, LIN, Ethernet, FlexRay with animated connections
- **AUTOSAR Explorer** — clickable 9-layer software stack with detailed inspector
- **18 feature simulations** — Power Window, Headlamp, ABS, Adaptive Cruise, Airbag, and more
- **Live communication monitor** — animated CAN/LIN/Ethernet message trace
- **Search** — highlights ECUs, networks, and features across the UI
- **JSON-driven data** — all ECUs, signals, networks, features, and AUTOSAR layers in `/src/data/`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # UI components
│   ├── ui/                 # Reusable primitives (GlassPanel, Badges)
│   ├── ArchitectureView.tsx
│   ├── AutosarExplorer.tsx
│   ├── CommunicationMonitor.tsx
│   ├── ECUNode.tsx
│   ├── FeatureSimulation.tsx
│   ├── InspectorPanel.tsx
│   └── Sidebar.tsx
├── data/                   # JSON datasets
│   ├── ecus.json
│   ├── networks.json
│   ├── features.json
│   ├── autosar.json
│   ├── sidebar.json
│   └── communications.json
├── lib/                    # Store, data loaders, utilities
└── types/                  # TypeScript definitions
```

## Future Integration Points

Architecture supports future modules without rewrites:

- 3D Digital Twin
- ISO 26262 Academy
- AUTOSAR Academy
- AI Copilot
- CAN Trace Viewer / UDS Analyzer
- DoIP / SOME/IP
- OTA updates
