import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameProgress } from '../contexts/GameProgressContext';
import ProgressMap from '../components/ProgressMap';

// Dummy data for game positions and icons
const DUMMY_GAME_POSITIONS = {
  'memory-game': { x: 200, y: 300, icon: '/icons/memory.png' },
  'puzzle-slide': { x: 450, y: 200, icon: '/icons/puzzle.png' },
  'counting-game': { x: 700, y: 400, icon: '/icons/counting.png' },
  'shape-sorter': { x: 950, y: 300, icon: '/icons/shapes.png' },
  'tic-tac-toe': { x: 1200, y: 500, icon: '/icons/tictactoe.png' },
  'hangman': { x: 1450, y: 350, icon: '/icons/hangman.png' },
  'color-by-number': { x: 1700, y: 250, icon: '/icons/color.png' },
  // Add more games as needed
};

// Dummy character images and animations
const DUMMY_CHARACTER_IMAGE = '/characters/hero.png'; // Replace with actual character image
const DUMMY_CHARACTER_ANIMATIONS = {
  idle: 'animate-pulse', // Example Tailwind/CSS class for idle animation
  walking: 'animate-bounce', // Example Tailwind/CSS class for walking animation
  celebrate: 'animate-spin-slow', // Example Tailwind/CSS class for celebration
};

const Home: React.FC = () => {
  const { completedGames, achievements } = useGameProgress();

  const games = [
    { id: 'memory-game', name: 'Memory Game', description: 'Test your memory!', path: '/memory' },
    { id: 'puzzle-slide', name: 'Puzzle Slide', description: 'Solve the sliding puzzle!', path: '/puzzle-slide' },
    { id: 'counting-game', name: 'Counting Game', description: 'Learn to count!', path: '/counting-game' },
    { id: 'shape-sorter', name: 'Shape Sorter', description: 'Match the shapes!', path: '/shape-sorter' },
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', description: 'Classic game!', path: '/tic-tac-toe' },
    { id: 'hangman', name: 'Hangman', description: 'Guess the word!', path: '/hangman' },
    { id: 'color-by-number', name: 'Color by Number', description: 'Creative coloring!', path: '/color-by-number' },
    // Add more games here
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to the Learning Adventure!</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Your Progress Map</h2>
        <div className="relative w-full h-[600px] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
          <ProgressMap
            mapImage="/maps/adventure-map.jpg" // Replace with your actual map image
            gamePositions={DUMMY_GAME_POSITIONS}
            characterImage={DUMMY_CHARACTER_IMAGE}
            characterAnimations={DUMMY_CHARACTER_ANIMATIONS}
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {completedGames.includes(game.id) ? (
                  <Badge variant="success">Completed</Badge>
                ) : (
                  <Badge variant="outline">New Game</Badge>
                )}
              </CardContent>
              <CardFooter>
                <Link to={game.path} className="w-full">
                  <Button className="w-full">Play Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Your Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader>
                  <CardTitle>{achievement.name}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={achievement.unlocked ? 'success' : 'destructive'}>
                    {achievement.unlocked ? 'Unlocked' : 'Locked'}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">No achievements yet. Keep playing!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
