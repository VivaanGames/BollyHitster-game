# 🎬 BollyHitster

A mobile-first Bollywood music timeline game inspired by HITSTER. Test your knowledge of Hindi film music across 7 decades!

![BollyHitster](https://img.shields.io/badge/Bollywood-Music%20Game-gold)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

## 🎮 Game Modes

### Quick Play
- Listen to a random Bollywood song
- Guess the release year using the slider
- Score points based on accuracy:
  - **Exact year**: 100 points
  - **Within 2 years**: 50 points
  - **Within 5 years**: 25 points
- Build your streak!

### Timeline Mode
- Build a chronological timeline of songs
- Place each new song before or after existing songs
- Challenge yourself to build the longest correct timeline

### QR Mode
- Each song has a unique URL (`/song/[id]`)
- Share URLs or generate QR codes for party games
- Perfect for group play!

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone or download the project
cd bolly-hitster

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/bolly-hitster)

### Option 2: Manual Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/bolly-hitster.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

### Option 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📁 Project Structure

```
bolly-hitster/
├── app/
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.js             # Root layout
│   ├── page.js               # Main game component
│   └── song/
│       └── [id]/
│           ├── page.js       # Server component (static params)
│           └── SongClient.js # Client component for QR mode
├── data/
│   └── songs.json            # Song database (100 songs)
├── public/
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── package.json
```

## 🎵 Song Database

The game includes **100 Bollywood songs** spanning from 1949 to 2023, organized into packs:

| Pack | Description |
|------|-------------|
| SRK Essentials | Shah Rukh Khan's iconic songs |
| Amitabh & Legends | Big B and classic legends |
| Rajesh Khanna & Golden Legends | 60s-70s classics |
| Kishore-Lata Evergreen | Duet masterpieces |
| 90s Romance | 90s romantic hits |
| Sonu Nigam & 2000s | Modern classics |
| A.R. Rahman Special | Rahman's best works |
| Arijit Era | Recent romantic ballads |

### Adding More Songs

Edit `data/songs.json`:

```json
{
  "id": 101,
  "song_name": "Song Name",
  "artist": "Artist Name",
  "year": 2020,
  "movie": "Movie Name",
  "pack": "Pack Name",
  "era": "2020s",
  "mood": "romance",
  "spotify_url": "https://open.spotify.com/search/Song%20Name"
}
```

## 🎯 QR Code Generation

Each song has a unique URL for QR codes:

```
https://your-domain.com/song/1
https://your-domain.com/song/2
...
https://your-domain.com/song/100
```

To generate QR codes:
1. Use any QR code generator
2. Input the song URL
3. Print and use for party games!

**Recommended QR Generators:**
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## 🛠 Customization

### Colors (tailwind.config.js)

```javascript
colors: {
  bollywood: {
    dark: '#0a0a0f',      // Background
    card: '#141420',       // Card background
    accent: '#ff6b35',     // Orange accent
    gold: '#ffd700',       // Gold primary
    purple: '#9333ea',     // Purple accent
  }
}
```

### Year Range (app/page.js)

```javascript
const MIN_YEAR = 1950
const MAX_YEAR = 2024
```

## 📱 Mobile Optimization

- Touch-friendly large buttons (48px+ touch targets)
- Swipeable timeline
- Mobile-first responsive design
- No external dependencies for offline play

## 🎉 Party Game Ideas

1. **Speed Round**: First to guess within 5 years wins
2. **Team Battle**: Teams take turns, most points wins
3. **Era Challenge**: Only songs from a specific decade
4. **Movie Mode**: Guess the movie, not the year
5. **QR Hunt**: Hide QR codes around the venue

## 📄 License

MIT License - feel free to use and modify!

---

Made with ❤️ for Bollywood music lovers

🎬 *Lights, Camera, Music!*
