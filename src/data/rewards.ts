export type RewardItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'character_customization';
  category: 'hats' | 'accessories' | 'outfits';
  image: string;
  previewImage?: string; // Optional image to show how it looks on a character
  unlocks?: string; // What character or item this unlocks/applies to
};

export const REWARD_ITEMS: RewardItem[] = [
  {
    id: 'hat_wizard', 
    name: 'Wizard Hat',
    description: 'A magical hat for aspiring sorcerers.',
    cost: 50,
    type: 'character_customization',
    category: 'hats',
    image: '/rewards/hat_wizard.png',
    previewImage: '/rewards/preview_wizard_hat.png'
  },
  {
    id: 'accessory_sparkle', 
    name: 'Sparkle Aura',
    description: 'Adds a shimmering glow around your character.',
    cost: 75,
    type: 'character_customization',
    category: 'accessories',
    image: '/rewards/accessory_sparkle.png',
    previewImage: '/rewards/preview_sparkle_aura.png'
  },
  {
    id: 'outfit_superhero', 
    name: 'Superhero Cape',
    description: 'Unleash your inner hero with this vibrant cape.',
    cost: 100,
    type: 'character_customization',
    category: 'outfits',
    image: '/rewards/outfit_superhero.png',
    previewImage: '/rewards/preview_superhero_cape.png'
  },
  {
    id: 'hat_crown', 
    name: 'Golden Crown',
    description: 'Rule your kingdom with this majestic crown.',
    cost: 120,
    type: 'character_customization',
    category: 'hats',
    image: '/rewards/hat_crown.png',
    previewImage: '/rewards/preview_crown.png'
  },
  {
    id: 'accessory_glasses', 
    name: 'Cool Shades',
    description: 'Look effortlessly cool with these stylish shades.',
    cost: 60,
    type: 'character_customization',
    category: 'accessories',
    image: '/rewards/accessory_glasses.png',
    previewImage: '/rewards/preview_glasses.png'
  },
  {
    id: 'outfit_astronaut', 
    name: 'Astronaut Suit',
    description: 'Explore the cosmos in this futuristic suit.',
    cost: 150,
    type: 'character_customization',
    category: 'outfits',
    image: '/rewards/outfit_astronaut.png',
    previewImage: '/rewards/preview_astronaut_suit.png'
  }
];
