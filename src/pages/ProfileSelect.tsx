import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";
import { User } from "lucide-react";

const ProfileSelect = () => {
  const navigate = useNavigate();
  const { profiles, setCurrentProfile } = useProfile();

  const handleProfileSelect = (profile: any) => {
    setCurrentProfile(profile);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-primary animate-bounce">
            🌟 Who's Playing? 🌟
          </h1>
          <p className="text-2xl text-muted-foreground">
            Choose your profile to start!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              onClick={() => handleProfileSelect(profile)}
              className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer border-4 border-border hover:shadow-2xl"
            >
              <div className="flex flex-col items-center gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-primary">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-lg text-muted-foreground">Age {profile.age}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-xl text-muted-foreground mb-4">No profiles yet! Ask a parent to add you.</p>
            <Button onClick={() => navigate('/home')} size="lg">
              Continue as Guest
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelect;
