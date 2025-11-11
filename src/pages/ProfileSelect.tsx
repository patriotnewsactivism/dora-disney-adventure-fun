import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import all Disney character images
import doraImg from "@/assets/dora.png";
import mickeyImg from "@/assets/mickey.png";
import minnieImg from "@/assets/minnie.png";
import elsaImg from "@/assets/elsa.png";
import simbaImg from "@/assets/simba.png";
import moanaImg from "@/assets/moana.png";
import annaImg from "@/assets/anna.png";
import arielImg from "@/assets/ariel.png";
import belleImg from "@/assets/belle.png";
import rapunzelImg from "@/assets/rapunzel.png";
import buzzImg from "@/assets/buzz.png";
import bluesImg from "@/assets/blues.png";

const disneyCharacters = [
  { name: "Mickey", image: mickeyImg },
  { name: "Minnie", image: minnieImg },
  { name: "Elsa", image: elsaImg },
  { name: "Anna", image: annaImg },
  { name: "Ariel", image: arielImg },
  { name: "Belle", image: belleImg },
  { name: "Rapunzel", image: rapunzelImg },
  { name: "Moana", image: moanaImg },
  { name: "Simba", image: simbaImg },
  { name: "Buzz", image: buzzImg },
  { name: "Dora", image: doraImg },
  { name: "Blue", image: bluesImg },
];

const ProfileSelect = () => {
  const navigate = useNavigate();
  const { profiles, setCurrentProfile, loadProfiles } = useProfile();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileAge, setNewProfileAge] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");

  // Pre-defined profiles for the kids.
  //  1. Emme (age 11)    – Elsa avatar 👸
  //  2. Anna-Claire (age 8) – Anna avatar ❄️
  //  3. Mckenna (age 5)   – Ariel avatar 🧜‍♀️
  //  4. Ethan (age 3)     – Mickey avatar 🐭
  const defaultProfiles = [
    { id: "emme", name: "Emme", age: 11, avatar_url: elsaImg },
    { id: "anna-claire", name: "Anna-Claire", age: 8, avatar_url: annaImg },
    { id: "mckenna", name: "Mckenna", age: 5, avatar_url: arielImg },
    { id: "ethan", name: "Ethan", age: 3, avatar_url: mickeyImg },
  ];

  const handleProfileSelect = (profile: any) => {
    setCurrentProfile(profile);
    navigate('/home');
  };

  const handleCreateProfile = async () => {
    if (!newProfileName || !newProfileAge || !selectedCharacter) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a character!",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          name: newProfileName,
          age: parseInt(newProfileAge),
          avatar_url: selectedCharacter,
        });

      if (error) throw error;

      toast({
        title: "Profile Created!",
        description: `Welcome, ${newProfileName}!`,
      });

      await loadProfiles();
      setShowCreateDialog(false);
      setNewProfileName("");
      setNewProfileAge("");
      setSelectedCharacter("");
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again!",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-primary animate-bounce">
            ✨ Who's Playing? ✨
          </h1>
          <p className="text-2xl text-muted-foreground">
            Choose your profile to start the fun!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Show default profiles for the kids */}
          {defaultProfiles.map((profile) => (
            <Card
              key={profile.id}
              onClick={() => handleProfileSelect(profile)}
              className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer border-4 border-primary hover:shadow-2xl bg-white"
            >
              <div className="flex flex-col items-center gap-4">
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-lg text-muted-foreground">Age {profile.age}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Show database profiles if any exist */}
        {profiles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-6 text-muted-foreground">
              Other Players
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer border-4 border-border hover:shadow-2xl"
                >
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={profile.avatar_url || mickeyImg}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                      <p className="text-lg text-muted-foreground">Age {profile.age}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center">Create Your Profile! 🌟</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-xl">What's your name?</Label>
              <Input
                id="name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Enter your name"
                className="text-lg mt-2"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-xl">How old are you?</Label>
              <Input
                id="age"
                type="number"
                value={newProfileAge}
                onChange={(e) => setNewProfileAge(e.target.value)}
                placeholder="Enter your age"
                className="text-lg mt-2"
                min="1"
                max="100"
              />
            </div>

            <div>
              <Label className="text-xl">Choose your character!</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {disneyCharacters.map((char) => (
                  <Card
                    key={char.name}
                    onClick={() => setSelectedCharacter(char.image)}
                    className={`p-3 cursor-pointer transition-all duration-200 ${
                      selectedCharacter === char.image
                        ? "border-4 border-primary shadow-lg scale-110"
                        : "border-2 border-border hover:scale-105"
                    }`}
                  >
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-full h-24 object-contain mb-2"
                    />
                    <p className="text-center font-semibold text-sm">{char.name}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProfile} size="lg">
                Create Profile!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSelect;
