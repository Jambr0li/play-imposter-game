# Imposter Game

A real-time multiplayer word guessing game where players try to find the imposter among them.

## How to Play

1. **Host creates a game** and receives a 6-digit code
2. **Players join** using the code and enter their names
3. **Everyone clicks "Ready"** when they're ready to start
4. **Game begins** when all players (minimum 3) are ready
5. **Each player sees a word** - but one random player sees "IMPOSTER" instead
6. **Players discuss** and try to figure out who the imposter is!

## Tech Stack

- **Next.js 15** - React framework
- **Convex** - Real-time database and backend
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component library (Radix UI + Tailwind)
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Convex:
```bash
npx convex dev
```
This will:
- Create a new Convex project (if needed)
- Generate your `.env.local` file with `NEXT_PUBLIC_CONVEX_URL`
- Start the Convex development server

3. In a separate terminal, start the Next.js development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page (Host or Join)
│   ├── host/page.tsx         # Host game page
│   ├── join/page.tsx         # Join game page
│   ├── game/[code]/page.tsx  # Main game room
│   ├── layout.tsx            # Root layout with ConvexProvider
│   └── ConvexClientProvider.tsx
├── convex/
│   ├── schema.ts             # Database schema
│   └── games.ts              # Game logic & queries
```

## Features

- ✅ Real-time player synchronization
- ✅ 6-digit unique game codes
- ✅ Support for 3-10 players
- ✅ Host migration if host leaves
- ✅ Ready check system
- ✅ Automatic game start when all ready
- ✅ Random imposter selection
- ✅ Mobile-responsive design
- ✅ Local storage for player persistence

## Game Flow

### 1. Home Page
- Choose to Host a Game or Join a Game

### 2. Host Flow
- Enter your name
- Game is created with a unique 6-digit code
- Redirects to waiting room

### 3. Join Flow
- Enter the 6-digit game code
- Enter your name
- Joins the game and redirects to waiting room

### 4. Waiting Room
- Shows all connected players
- Displays ready status for each player
- Shows "Ready" count (e.g., "2/5 ready")
- Each player can toggle their ready state
- Game automatically starts when all players are ready (minimum 3 players)

### 5. Playing Phase
- All players see the same word, except one random player
- The imposter sees "IMPOSTER" in red
- Players discuss and try to figure out who the imposter is

## Database Schema

### Games Table
- `code`: 6-digit unique game code
- `hostId`: ID of the player who created the game
- `status`: "waiting" | "playing" | "finished"
- `word`: The word shown to non-imposter players
- `imposterId`: ID of the player who is the imposter
- `createdAt`: Timestamp

### Players Table
- `gameCode`: The game they're in
- `playerId`: Unique player ID (stored in localStorage)
- `playerName`: Player's display name
- `isReady`: Whether player has clicked "Ready"
- `isHost`: Whether this player is the host
- `joinedAt`: Timestamp

## UI Components (ShadCN)

The app uses the following ShadCN UI components for a polished, accessible interface:

- **Button** - All interactive actions (Host, Join, Ready, Leave)
  - Variants: default, outline, ghost
  - Sizes: default, lg
  
- **Card** - Main containers for all pages
  - CardHeader, CardTitle, CardDescription
  - CardContent, CardFooter
  
- **Input** - Text input fields for names and game codes
  - Fully accessible with proper focus states
  
- **Label** - Form field labels with Radix UI primitives
  
- **Badge** - Status indicators
  - "Ready" status (green)
  - "Host" indicator (crown icon)
  - Player count badges
  
- **Separator** - Visual dividers between sections

- **Icons (Lucide React)**:
  - Crown (host indicator)
  - Users (player count)
  - Check (ready status)
  - Loader2 (loading spinner)
  - LogOut (leave game)
  - AlertCircle (errors/warnings)

### Adding More Components

To add additional ShadCN components:
```bash
npx shadcn@latest add [component-name]
```

All components are fully customizable and located in `components/ui/`.

## Development

### Run in development mode:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
npm start
```

### Type checking:
```bash
npx tsc --noEmit
```

## Deployment

1. Deploy the Next.js app to Vercel:
```bash
npx vercel
```

2. Deploy Convex functions:
```bash
npx convex deploy
```

3. Add your production Convex URL to Vercel environment variables:
   - Variable name: `NEXT_PUBLIC_CONVEX_URL`
   - Value: Your production Convex URL

## Troubleshooting

### "Game Not Found" error
- Make sure the game code is correct (case-insensitive)
- The game may have ended or been deleted

### Players not syncing
- Check that `npx convex dev` is running
- Verify `.env.local` has the correct `NEXT_PUBLIC_CONVEX_URL`
- Check browser console for errors

### Can't start game
- Need at least 3 players
- All players must click "Ready"

## Future Enhancements

- [ ] Add timer for discussions
- [ ] Add voting system
- [ ] Multiple rounds
- [ ] Custom word lists
- [ ] Game history/statistics
- [ ] Sound effects
- [ ] Animations for word reveal
- [ ] Chat system

## License

MIT
