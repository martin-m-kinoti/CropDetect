# Crop Detect AI — Frontend

A mobile-first React application that enables Kenyan farmers to detect crop diseases through photo capture and AI analysis.

## Tech Stack
- **Framework:** React (JSX)
- **Styling:** CSS-in-JS with custom design tokens
- **Fonts:** Google Fonts (Playfair Display, DM Sans)

## Features
- Email-based user authentication
- Camera integration for leaf photo capture
- Real-time AI disease prediction display
- Treatment recommendation rendering
- Detection history log
- Responsive mobile phone UI

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure
```
src/
├── components/
│   ├── Dashboard.jsx
│   ├── AIModel.jsx
│   ├── Admin.jsx
│   └── Doc.jsx
├── App.jsx
└── index.js
```

## Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Notes
- Designed for low-end Android smartphones common in rural Kenya
- Minimum supported resolution: 720p camera