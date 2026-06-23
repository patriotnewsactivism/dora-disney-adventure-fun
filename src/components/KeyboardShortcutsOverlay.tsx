import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface KeyboardShortcutsOverlayProps {
  children: React.ReactNode;
}

const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getAvailableCommands } = useVoiceCommands();
  const [commands, setCommands] = useState<{ voice: string; action: string }[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCommands(getAvailableCommands());
    }
  }, [isOpen, getAvailableCommands]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts & Voice Commands</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Press '?'</div>
            <div>Toggle this overlay</div>
          </div>

          <h3 className="text-lg font-semibold mt-4">Voice Commands</h3>
          {commands.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {commands.map((cmd, index) => (
                <React.Fragment key={index}>
                  <div className="font-medium">'{cmd.voice}'</div>
                  <div>{cmd.action}</div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No voice commands registered yet.</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsOverlay;
