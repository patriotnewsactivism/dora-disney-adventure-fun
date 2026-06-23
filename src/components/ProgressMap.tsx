import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameProgress } from '../contexts/GameProgressContext';
import { cn } from '../lib/utils';

interface GameMapProps {
  mapImage: string;
  gamePositions: { [key: string]: { x: number; y: number; icon: string } };
  characterImage: string;
  characterAnimations: { [key: string]: string }; // e.g., 'idle': 'idle-animation-class'
}

const MAP_WIDTH = 2000; // Original map image width
const MAP_HEIGHT = 1200; // Original map image height
const MIN_ZOOM = 0.5; // Minimum zoom level
const MAX_ZOOM = 2.0; // Maximum zoom level
const ZOOM_STEP = 0.1; // How much zoom changes per step

const ProgressMap: React.FC<GameMapProps> = ({
  mapImage,
  gamePositions,
  characterImage,
  characterAnimations,
}) => {
  const { completedGames, achievements } = useGameProgress();
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });

  // Calculate the current character position based on completed games
  const characterCurrentPosition = useMemo(() => {
    if (completedGames.length === 0) {
      // If no games completed, place character at a starting point or first game
      const firstGameKey = Object.keys(gamePositions)[0];
      return firstGameKey ? gamePositions[firstGameKey] : { x: 50, y: 50, icon: '' };
    }
    // For simplicity, let's say the character is at the last completed game's position
    const lastCompletedGame = completedGames[completedGames.length - 1];
    return gamePositions[lastCompletedGame] || { x: 50, y: 50, icon: '' };
  }, [completedGames, gamePositions]);

  // Determine character animation based on progress/achievements
  const characterAnimationClass = useMemo(() => {
    // Example: if a specific achievement is unlocked, trigger a special animation
    const hasAchievement = achievements.some(ach => ach.unlocked && ach.name === 'First Quest Master');
    if (hasAchievement && characterAnimations['celebrate']) {
      return characterAnimations['celebrate'];
    } else if (completedGames.length > 0 && characterAnimations['walking']) {
      return characterAnimations['walking'];
    } else if (characterAnimations['idle']) {
      return characterAnimations['idle'];
    }
    return '';
  }, [completedGames, achievements, characterAnimations]);

  const applyBoundaryConstraints = useCallback((newOffset: { x: number; y: number }) => {
    if (!mapRef.current) return newOffset;

    const containerWidth = mapRef.current.offsetWidth;
    const containerHeight = mapRef.current.offsetHeight;

    const scaledMapWidth = MAP_WIDTH * scale;
    const scaledMapHeight = MAP_HEIGHT * scale;

    // Calculate max possible offset (map edge aligns with container edge)
    const maxX = Math.max(0, scaledMapWidth - containerWidth) / 2;
    const maxY = Math.max(0, scaledMapHeight - containerHeight) / 2;

    // Calculate min possible offset (map edge aligns with container edge, but negative)
    const minX = -maxX;
    const minY = -maxY;

    // Adjust offset to keep map within boundaries
    const boundedX = Math.max(minX, Math.min(maxX, newOffset.x));
    const boundedY = Math.max(minY, Math.min(maxY, newOffset.y));

    return { x: boundedX, y: boundedY };
  }, [scale]);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const scaleAmount = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale(prevScale => {
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevScale + scaleAmount));
      if (newScale === prevScale) return prevScale;

      // Adjust offset to zoom towards the mouse cursor
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const currentMapX = (mouseX - offset.x) / prevScale;
        const currentMapY = (mouseY - offset.y) / prevScale;

        const newOffsetX = mouseX - currentMapX * newScale;
        const newOffsetY = mouseY - currentMapY * newScale;

        setOffset(applyBoundaryConstraints({ x: newOffsetX, y: newOffsetY }));
      }
      return newScale;
    });
  }, [offset, applyBoundaryConstraints]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPos({ x: event.clientX - offset.x, y: event.clientY - offset.y });
  }, [offset]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffsetX = event.clientX - startDragPos.x;
    const newOffsetY = event.clientY - startDragPos.y;
    setOffset(applyBoundaryConstraints({ x: newOffsetX, y: newOffsetY }));
  }, [isDragging, startDragPos, applyBoundaryConstraints]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        mapElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Recalculate boundaries when window resizes or scale changes
  useEffect(() => {
    setOffset(prevOffset => applyBoundaryConstraints(prevOffset));
  }, [scale, applyBoundaryConstraints]);

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="absolute origin-top-left"
        style={{
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          backgroundImage: `url(${mapImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        {/* Game Icons */}
        {Object.entries(gamePositions).map(([gameId, pos]) => {
          const isCompleted = completedGames.includes(gameId);
          return (
            <div
              key={gameId}
              className={cn(
                'absolute w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                isCompleted ? 'bg-green-500 border-green-700' : 'bg-gray-400 border-gray-600 opacity-70',
                'hover:scale-110 cursor-pointer'
              )}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              title={gameId.replace(/-/g, ' ').toUpperCase()}
            >
              <img src={pos.icon} alt={gameId} className="w-8 h-8 object-contain" />
            </div>
          );
        })}

        {/* Character */} 
        <motion.div
          className={cn(
            'absolute w-24 h-24',
            characterAnimationClass // Apply animation class
          )}
          style={{
            left: `${characterCurrentPosition.x}px`,
            top: `${characterCurrentPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ x: characterCurrentPosition.x, y: characterCurrentPosition.y }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <img src={characterImage} alt="Character" className="w-full h-full object-contain" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProgressMap;
