import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChefHat } from "lucide-react";
import Confetti from "@/components/Confetti";

const DisneyBakeOff = () => {
  const recipes = [
    { name: "Mickey Cookies", ingredients: ["🍪", "🧈", "🥚", "🍫"], emoji: "🍪" },
    { name: "Elsa's Ice Cream", ingredients: ["🥛", "❄️", "🍓", "🍦"], emoji: "🍦" },
    { name: "Belle's Cupcakes", ingredients: ["🧁", "🎂", "🌹", "✨"], emoji: "🧁" },
  ];

  const [currentRecipe, setCurrentRecipe] = useState(0);
  const [collected, setCollected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const recipe = recipes[currentRecipe];

  const addIngredient = (ingredient: string) => {
    if (!collected.includes(ingredient) && recipe.ingredients.includes(ingredient)) {
      setCollected([...collected, ingredient]);

      if (collected.length + 1 === recipe.ingredients.length) {
        setScore(prev => prev + 1);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setCurrentRecipe((currentRecipe + 1) % recipes.length);
          setCollected([]);
        }, 2500);
      }
    }
  };

  return (
    <GameLayout title="Disney Bake-Off! 🧁">
      {showConfetti && <Confetti />}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <ChefHat className="h-16 w-16 mx-auto mb-4 text-orange-600" />
          <h2 className="text-4xl font-bold">Bake {recipe.name}!</h2>
          <p className="text-2xl mt-2">Recipes Completed: {score}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl border-4 border-orange-400 p-8 mb-6">
          <h3 className="text-3xl font-bold mb-4">Recipe:</h3>
          <div className="flex justify-center gap-4 text-7xl mb-6">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className={collected.includes(ing) ? "opacity-100" : "opacity-30"}>
                {ing}
              </div>
            ))}
          </div>

          <div className="text-center text-8xl mb-4">{recipe.emoji}</div>
        </div>

        <div className="bg-white rounded-3xl border-4 border-orange-300 p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4">Available Ingredients:</h3>
          <div className="grid grid-cols-4 gap-4">
            {["🍪", "🧈", "🥚", "🍫", "🥛", "❄️", "🍓", "🍦", "🧁", "🎂", "🌹", "✨"].map(ing => (
              <button
                key={ing}
                onClick={() => addIngredient(ing)}
                disabled={collected.includes(ing)}
                className={`text-6xl p-6 rounded-2xl border-4 transition-all ${
                  collected.includes(ing)
                    ? "bg-gray-200 border-gray-300 opacity-50"
                    : "bg-gradient-to-br from-orange-200 to-yellow-200 border-orange-400 hover:scale-110"
                }`}
              >
                {ing}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button onClick={() => { setCollected([]); setScore(0); setCurrentRecipe(0); }} variant="outline" size="lg">
            <RotateCcw className="mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    </GameLayout>
  );
};

export default DisneyBakeOff;
