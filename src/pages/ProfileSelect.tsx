import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/contexts/ProfileContext";
import mickeyImg from "@/assets/mickey.png";
import elsaImg from "@/assets/elsa.png";
import annaImg from "@/assets/anna.png";
import arielImg from "@/assets/ariel.png";

const ProfileSelect = () => {
  const navigate = useNavigate();
  const { setCurrentProfile } = useProfile();

  // Fixed profiles for the kids
  const profiles = [
    { id: "emme", name: "Emme", age: 11, avatar_url: elsaImg },
    { id: "anna-claire", name: "Anna-Claire", age: 8, avatar_url: annaImg },
    { id: "mckenna", name: "Mckenna", age: 5, avatar_url: arielImg },
    { id: "ethan", name: "Ethan", age: 3, avatar_url: mickeyImg },
  ];

  const handleProfileSelect = (profile: any) => {
    setCurrentProfile(profile);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Who's Playing Today?
          </h1>
          <p className="text-xl text-muted-foreground">Choose your profile to start playing!</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary overflow-hidden"
              onClick={() => handleProfileSelect(profile)}
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20">
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">Age {profile.age}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSelect;
