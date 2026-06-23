# Assets Needed for New Games

## Character Assets
The following character image assets should be added to `src/assets/`:

### Marvel Characters
- `spiderman.png` - Spider-Man character
- `spiderman-swinging.png` - Spider-Man in swinging pose (optional alternate)

### Vehicle Assets
- `monster-truck-red.png` - Red monster truck
- `monster-truck-blue.png` - Blue monster truck
- `monster-truck-green.png` - Green monster truck
- `big-wheel.png` - Big wheel tricycle

### Fairy Characters (for Pixie Hollow)
- `tinkerbell.png` - Tinker Bell
- `silvermist.png` - Silvermist
- `rosetta.png` - Rosetta
- `fawn.png` - Fawn

### Additional Characters (Optional)
- More princess variations
- Encanto characters (Mirabel, etc.)
- Zootopia characters (Judy, Nick, etc.)

## Temporary Workaround
Until these assets are added, games will use:
- Emoji representations (ð for trucks, ð·ï¸ for Spider-Man, etc.)
- Colored geometric shapes as placeholders
- Existing Disney character images where appropriate

## Adding New Assets
1. Save image files to `src/assets/` directory
2. Import in game component: `import assetName from "@/assets/filename.png";`
3. Replace emoji/placeholder with image reference
