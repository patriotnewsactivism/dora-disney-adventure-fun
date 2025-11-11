# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Disney-themed children's gaming platform built with React, TypeScript, Vite, and Supabase. The application includes 39 kid-friendly games spanning multiple categories including action games, educational games, creative activities, and role-playing adventures designed for children ages 3-11. Features include Marvel/Spider-Man content alongside Disney characters, an AI chat feature, and comprehensive profile management with Disney character avatars. The project uses Lovable for development and deployment.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development (includes component tagger)
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm preview
```

## Architecture

### Core Application Structure

- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **Routing**: React Router with BrowserRouter, all routes defined in App.tsx
- **State Management**: React Context API (`ProfileContext`) for user profile management
- **Data Layer**: Supabase client at `src/integrations/supabase/client.ts`
- **UI Components**: shadcn/ui components in `src/components/ui/`

### Key Application Features

#### Profile System
The app uses a profile-based system where users select a profile before accessing games:
- Profile data stored in Supabase `profiles` table (id, name, age, avatar_url)
- `ProfileContext` (src/contexts/ProfileContext.tsx) manages current profile state
- Games are filtered by `minAge` requirement based on current profile age
- Profile selection happens at root route `/`, then navigates to `/home`
- **NEW**: Disney character avatar selection - users choose from 12 Disney characters (Mickey, Minnie, Elsa, Anna, Ariel, Belle, Rapunzel, Moana, Simba, Buzz, Dora, Blue)
- Profile creation dialog with name, age, and character selection
- "Add Player" card for easy profile creation

#### Game Architecture
All games follow a consistent pattern:
- Wrapped in `GameLayout` component for consistent UI (title bar, home button)
- Use character images from `src/assets/` directory
- Include Disney-themed characters (Mickey, Minnie, Elsa, Dora, etc.)
- Support reset/new game functionality
- Some use `CharacterPopup` component for celebrations

#### Memory Game Multi-Round System
The Memory game (src/components/MemoryGame.tsx) implements a progressive difficulty system:
- 4 rounds with increasing difficulty (3, 4, 5, 5 pairs)
- Round state tracked with `currentRound` and `totalMoves`
- Characters randomly selected from pool of 16 Disney characters
- Confetti animation on round completion
- Separate tracking for round moves vs. total moves across all rounds

#### AI Chat Integration
The AI Chat feature (src/pages/AIChat.tsx) includes:
- Streaming chat responses from Supabase Edge Function
- Voice input via Web Audio API (`AudioRecorder` utility)
- Text-to-speech output using Web Speech API
- Speech-to-text conversion via `speech-to-text` Supabase function
- Kid-safe AI with system prompt enforcing age-appropriate content

### Supabase Integration

#### Edge Functions
Located in `supabase/functions/`:
- **kids-chat**: Streams AI chat responses from Lovable AI Gateway using Gemini 2.5 Flash model with kid-safe system prompt
- **speech-to-text**: Converts audio to text for voice chat

Both functions have `verify_jwt = false` in `supabase/config.toml` for easier access.

#### Environment Variables
Required in `.env`:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/public key
- `LOVABLE_API_KEY`: Set in Supabase dashboard for Edge Functions

#### Database Schema
Primary table: `profiles` with columns for user profiles (id, name, age, avatar_url)

### Styling and UI

- **Tailwind CSS**: Primary styling approach with custom theme configuration
- **shadcn/ui**: Component library providing base UI components
- **Path Alias**: `@` maps to `./src` (configured in vite.config.ts and tsconfig.json)
- **Theming**: Uses CSS custom properties for colors (primary, secondary, accent, etc.)
- **Responsive Design**: Games adapt to mobile and desktop with Tailwind breakpoints

### Asset Management

Character images stored in `src/assets/`:
- Disney characters: mickey.png, minnie.png, elsa.png, anna.png, ariel.png, belle.png, rapunzel.png, moana.png, simba.png, buzz.png
- Show characters: dora.png, blues.png
- Custom characters: cakepop-hunter1.png through cakepop-hunter4.png

**Note**: Additional character assets needed for new games (Spider-Man, Monster Trucks, etc.) - see ASSETS_NEEDED.md for details. Games currently use emoji placeholders where assets are not yet available.

## Complete Game List (39 Total)

The platform now includes 39 games organized by category:

### Original Games (6)
1. **Memory Match** (age 4+) - Multi-round progressive difficulty memory game
2. **Tic-Tac-Toe** (age 5+) - Mickey vs Minnie character-based game
3. **Hangman** (age 6+) - Disney-themed word guessing
4. **Checkers** (age 6+) - Full checkers with Simba vs Elsa
5. **Color by Number** (age 3+) - Grid-based coloring
6. **AI Chat** (age 3+) - Voice-enabled Disney AI chat with kid-safe filters

### Ethan's Games (Age 3) - Action Games
7. **Monster Truck Racing** - Tap-to-accelerate racing game with opponent AI
8. **Spider-Man Web Slinging** - 2D flying/swinging game with physics
9. **Big Wheels Stunt Course** - Keyboard/button controlled obstacle avoidance

### All Ages Games (6)
10. **Whack-a-Character** - Disney character whack-a-mole with timer
11. **Balloon Pop** - Floating balloon popping with score multipliers
12. **Simon Says** - Audio-enabled memory sequence game
13. **Puzzle Slide** - Sliding tile puzzle with 3x3, 4x4, 5x5 modes
14. **Drawing Pad** - Full-featured canvas drawing with brushes, colors, stamps
15. **Music Maker** - Web Audio API music creation with 4 instruments, 8 notes

### Educational Games (4)
16. **Counting Game** - Interactive counting with Disney characters
17. **Letter Tracing** - Coming Soon - Alphabet practice
18. **Shape Sorter** - Coming Soon - Drag and drop shape matching
19. **Interactive Storytime** - Coming Soon - Branching narrative stories

### Imagination & Role-Play (5)
20. **Princess Academy** - Coming Soon - Multi-challenge princess training
21. **Pixie Hollow Adventures** - Coming Soon - Fairy talent-based challenges
22. **Frozen Ice Quest** - Coming Soon - Snowflake scavenger hunt
23. **Encanto Mystery Doors** - Coming Soon - Gift guessing with puzzles
24. **Ariel's Treasure Hunt** - Coming Soon - Ocean treasure finding

### Creative & Craft (5)
25. **Build a Kingdom** - Coming Soon - Castle design and decoration
26. **Dress Designer** - Coming Soon - Character dress customization
27. **Zootopia Detective** - Coming Soon - Mystery solving with clues
28. **Magic Carpet Obstacle Course** - Coming Soon - Aladdin-themed relay
29. **Wish Star Workshop** - Coming Soon - Star decoration with wishes

### Musical & Performance (3)
30. **Sing-Along Storytime** - Coming Soon - Karaoke integrated stories
31. **Under the Sea Dance Party** - Coming Soon - Little Mermaid freeze dance
32. **Moana's Rhythm Island** - Coming Soon - Rhythm matching drums

### Digital/App-Based (4)
33. **Kingdom Builder Game** - Coming Soon - Kingdom design with point system
34. **Disney Emoji Quest** - Coming Soon - Match-3 with Disney emojis
35. **Frozen Ice Maze** - Coming Soon - Anna's maze rescue game
36. **Pixie Flight Simulator** - Coming Soon - 2D fairy flying game

### Cooperative/Educational (3)
37. **Storybook Builders** - Coming Soon - Collaborative story creation
38. **Kingdom Keepers Coding** - Coming Soon - Block-based coding puzzles
39. **Disney Bake-Off** - Coming Soon - Recipe following with character quests

### Game Status
- **10 Complete & Playable**: Monster Truck Racing, Spider-Man Web Swing, Big Wheels Stunt, Whack-a-Mole, Balloon Pop, Simon Says, Puzzle Slide, Drawing Pad, Music Maker, Counting Game
- **23 Coming Soon**: Have placeholder pages with feature descriptions and "Coming Soon" messaging
- All 33 new games are routed and appear in Home.tsx with proper age filtering

## Important Development Notes

### Adding New Games
1. Create game component in `src/pages/`
2. Add route to App.tsx Routes
3. Add game entry to `allGames` array in Home.tsx with appropriate `minAge`
4. Wrap in `GameLayout` for consistent UI
5. Import required character images

### Working with Profiles
- Always access current profile via `useProfile()` hook
- Filter content by `currentProfile.age` when appropriate
- Reload profiles after creating/updating with `loadProfiles()`

### AI Chat Safety
The kids-chat Edge Function enforces strict content filtering:
- Responses limited to 2-3 sentences
- Age-appropriate vocabulary only
- Redirects unsafe queries to fun topics
- Never modify the safety rules in the system prompt

### Route Structure
Custom routes MUST be added above the catch-all `*` route in App.tsx to avoid 404 errors.

### Lovable Integration
This project is managed by Lovable:
- Changes made in Lovable automatically commit to repo
- Component tagging enabled in development mode via `lovable-tagger`
- Deploy via Lovable dashboard (Share → Publish)

### Key Technical Patterns

**Canvas-based Games** (Drawing Pad example):
- Use `useRef<HTMLCanvasElement>` for canvas reference
- Set canvas width/height explicitly (not via CSS)
- Use `getContext("2d")` for 2D drawing
- Handle mouse events for drawing/interaction
- Implement save/download functionality

**Audio-based Games** (Music Maker, Simon Says examples):
- Use Web Audio API: `new AudioContext()`
- Create oscillators for sound generation
- Use different waveforms (sine, square, sawtooth, triangle) for instrument variety
- Implement gain nodes for volume control
- Add exponential ramps for natural sound decay

**Physics/Animation Games** (Spider-Man, Monster Truck, Big Wheels examples):
- Use `setInterval` or `requestAnimationFrame` for game loops
- Store refs for intervals to clean up properly
- Implement collision detection with bounding boxes
- Use CSS transforms for smooth visual updates
- Progressive difficulty with score-based level increases

**Coming Soon Component Pattern**:
- Reusable placeholder for incomplete games
- Shows game title, description, feature list
- Provides consistent UX across placeholder games
- Easy to replace with full implementation

### Theme Expansion
The platform now supports both Disney and Marvel/other themes:
- Spider-Man game included for variety
- Monster trucks use emoji placeholders
- Ready for additional character universes
- Maintains age-appropriate content across all themes
