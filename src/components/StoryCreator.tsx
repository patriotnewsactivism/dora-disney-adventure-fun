import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Define types for story elements and scene objects
enum ItemTypes {
  ELEMENT = 'element',
}

interface StoryElement {
  id: string;
  type: 'character' | 'background' | 'prop';
  name: string;
  image: string;
}

interface SceneObject {
  id: string;
  elementId: string;
  type: 'character' | 'background' | 'prop';
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface Scene {
  id: string;
  name: string;
  objects: SceneObject[];
}

interface StoryState {
  scenes: Scene[];
  currentSceneIndex: number;
}

// Placeholder assets (will be moved to src/assets/story-elements later)
const storyElements: StoryElement[] = [
  { id: 'bg1', type: 'background', name: 'Forest', image: '/placeholders/forest.png' },
  { id: 'bg2', type: 'background', name: 'Castle', image: '/placeholders/castle.png' },
  { id: 'char1', type: 'character', name: 'Princess', image: '/placeholders/princess.png' },
  { id: 'char2', type: 'character', name: 'Knight', image: '/placeholders/knight.png' },
  { id: 'prop1', type: 'prop', name: 'Sword', image: '/placeholders/sword.png' },
  { id: 'prop2', type: 'prop', name: 'Tree', image: '/placeholders/tree.png' },
];

interface DraggableElementProps {
  element: StoryElement;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ element }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ELEMENT,
    item: { id: element.id, type: element.type, name: element.name, image: element.image },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="p-2 m-1 border rounded-lg cursor-grab bg-white shadow-sm flex flex-col items-center text-center"
    >
      <img src={element.image} alt={element.name} className="w-16 h-16 object-contain mb-1" />
      <span className="text-xs font-medium text-gray-700">{element.name}</span>
    </div>
  );
};

interface SceneObjectRendererProps {
  sceneObject: SceneObject;
  elementData: StoryElement;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateScale: (id: string, scale: number) => void;
  onUpdateRotation: (id: string, rotation: number) => void;
  onBringToFront: (id: string) => void;
}

const SceneObjectRenderer: React.FC<SceneObjectRendererProps> = React.memo(
  ({
    sceneObject,
    elementData,
    onSelect,
    isSelected,
    onUpdatePosition,
    onUpdateScale,
    onUpdateRotation,
    onBringToFront,
  }) => {
    const objectRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        onSelect(sceneObject.id);
        onBringToFront(sceneObject.id);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (objectRef.current) {
          const bbox = objectRef.current.getBoundingClientRect();
          setOffset({ x: clientX - bbox.left, y: clientY - bbox.top });
          setIsDragging(true);
        }
      },
      [onSelect, onBringToFront, sceneObject.id]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (objectRef.current) {
          const sceneRect = objectRef.current.parentElement?.getBoundingClientRect();
          if (!sceneRect) return;

          let newX = clientX - sceneRect.left - offset.x;
          let newY = clientY - sceneRect.top - offset.y;

          // Keep object within scene bounds
          newX = Math.max(0, Math.min(newX, sceneRect.width - objectRef.current.offsetWidth));
          newY = Math.max(0, Math.min(newY, sceneRect.height - objectRef.current.offsetHeight));

          onUpdatePosition(sceneObject.id, newX, newY);
        }
      },
      [isDragging, offset, onUpdatePosition, sceneObject.id]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove, { passive: false });
        window.addEventListener('touchend', handleMouseUp);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleScaleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(e.target.value);
        if (!isNaN(newScale)) {
          onUpdateScale(sceneObject.id, newScale);
        }
      },
      [onUpdateScale, sceneObject.id]
    );

    const handleRotationChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRotation = parseFloat(e.target.value);
        if (!isNaN(newRotation)) {
          onUpdateRotation(sceneObject.id, newRotation);
        }
      },
      [onUpdateRotation, sceneObject.id]
    );

    return (
      <div
        ref={objectRef}
        className={cn(
          'absolute cursor-move touch-none',
          isSelected && 'border-2 border-blue-500 ring-2 ring-blue-300'
        )}
        style={{
          left: sceneObject.x,
          top: sceneObject.y,
          zIndex: sceneObject.zIndex,
          transform: `scale(${sceneObject.scale}) rotate(${sceneObject.rotation}deg)`,
          transformOrigin: 'top left',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <img
          src={elementData.image}
          alt={elementData.name}
          className="max-w-full max-h-full object-contain pointer-events-none"
          style={{
            width: elementData.type === 'background' ? '100%' : 'auto',
            height: elementData.type === 'background' ? '100%' : 'auto',
            minWidth: elementData.type === 'background' ? '100%' : '50px',
            minHeight: elementData.type === 'background' ? '100%' : '50px',
          }}
        />
        {isSelected && ( // Render controls only if selected
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 bg-white p-1 rounded-md shadow-lg z-50">
            <Input
              type="number"
              value={sceneObject.scale}
              onChange={handleScaleChange}
              min="0.1"
              max="3"
              step="0.1"
              className="w-20 h-8 text-xs"
              aria-label="Scale"
            />
            <Input
              type="number"
              value={sceneObject.rotation}
              onChange={handleRotationChange}
              min="0"
              max="360"
              step="1"
              className="w-20 h-8 text-xs"
              aria-label="Rotation"
            />
          </div>
        )}
      </div>
    );
  }
);

const StoryCreator: React.FC = () => {
  const isMobile = useMobile();
  const DndBackend = isMobile ? TouchBackend : HTML5Backend;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { storyId: urlStoryId } = useParams<{ storyId?: string }>();

  const [storyState, setStoryState] = useState<StoryState>({
    scenes: [{ id: nanoid(), name: 'Scene 1', objects: [] }],
    currentSceneIndex: 0,
  });

  const [history, setHistory] = useState<StoryState[]>([storyState]);
  const [historyPointer, setHistoryPointer] = useState(0);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState<string>('My Awesome Story');
  const sceneRef = useRef<HTMLDivElement>(null);

  const currentScene = storyState.scenes[storyState.currentSceneIndex];

  const saveStateToHistory = useCallback(
    (newState: StoryState) => {
      const newHistory = history.slice(0, historyPointer + 1);
      newHistory.push(newState);
      setHistory(newHistory);
      setHistoryPointer(newHistory.length - 1);
    },
    [history, historyPointer]
  );

  const updateStoryState = useCallback(
    (updater: (prevState: StoryState) => StoryState) => {
      setStoryState((prevState) => {
        const newState = updater(prevState);
        saveStateToHistory(newState);
        return newState;
      });
    },
    [saveStateToHistory]
  );

  const handleDrop = useCallback(
    (item: StoryElement, monitor: any) => {
      if (!sceneRef.current) return;

      const sceneRect = sceneRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const x = clientOffset.x - sceneRect.left;
      const y = clientOffset.y - sceneRect.top;

      updateStoryState((prevState) => {
        const newObjects = [...currentScene.objects];
        const newZIndex = newObjects.length > 0 ? Math.max(...newObjects.map(obj => obj.zIndex)) + 1 : 1;

        newObjects.push({
          id: nanoid(),
          elementId: item.id,
          type: item.type,
          x: x - (item.type === 'background' ? 0 : 50), // Adjust initial drop position for non-backgrounds
          y: y - (item.type === 'background' ? 0 : 50),
          scale: 1,
          rotation: 0,
          zIndex: newZIndex,
        });

        if (item.type === 'background') {
          // Ensure background is at the bottom and covers the whole scene
          newObjects.sort((a, b) => {
            if (a.type === 'background') return -1;
            if (b.type === 'background') return 1;
            return a.zIndex - b.zIndex;
          });
          // Update background position to 0,0 and scale to cover
          const backgroundObject = newObjects.find(obj => obj.elementId === item.id);
          if (backgroundObject) {
            backgroundObject.x = 0;
            backgroundObject.y = 0;
            backgroundObject.scale = 1;
            backgroundObject.zIndex = 0; // Always lowest zIndex
          }
        }

        const newScenes = [...prevState.scenes];
        newScenes[prevState.currentSceneIndex] = { ...currentScene, objects: newObjects };
        return { ...prevState, scenes: newScenes };
      });
    },
    [currentScene, updateStoryState]
  );

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.ELEMENT,
    drop: handleDrop,
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  const handleUndo = useCallback(() => {
    if (historyPointer > 0) {
      setHistoryPointer((prev) => prev - 1);
      setStoryState(history[historyPointer - 1]);
    }
  }, [history, historyPointer]);

  const handleRedo = useCallback(() => {
    if (historyPointer < history.length - 1) {
      setHistoryPointer((prev) => prev + 1);
      setStoryState(history[historyPointer + 1]);
    }
  }, [history, historyPointer]);

  const handleUpdatePosition = useCallback(
    (id: string, x: number, y: number) => {
      updateStoryState((prevState) => {
        const newObjects = currentScene.objects.map((obj) =>
          obj.id === id ? { ...obj, x, y } : obj
        );
        const newScenes = [...prevState.scenes];
        newScenes[prevState.currentSceneIndex] = { ...currentScene, objects: newObjects };
        return { ...prevState, scenes: newScenes };
      });
    },
    [currentScene, updateStoryState]
  );

  const handleUpdateScale = useCallback(
    (id: string, scale: number) => {
      updateStoryState((prevState) => {
        const newObjects = currentScene.objects.map((obj) =>
          obj.id === id ? { ...obj, scale } : obj
        );
        const newScenes = [...prevState.scenes];
        newScenes[prevState.currentSceneIndex] = { ...currentScene, objects: newObjects };
        return { ...prevState, scenes: newScenes };
      });
    },
    [currentScene, updateStoryState]
  );

  const handleUpdateRotation = useCallback(
    (id: string, rotation: number) => {
      updateStoryState((prevState) => {
        const newObjects = currentScene.objects.map((obj) =>
          obj.id === id ? { ...obj, rotation } : obj
        );
        const newScenes = [...prevState.scenes];
        newScenes[prevState.currentSceneIndex] = { ...currentScene, objects: newObjects };
        return { ...prevState, scenes: newScenes };
      });
    },
    [currentScene, updateStoryState]
  );

  const handleBringToFront = useCallback(
    (id: string) => {
      updateStoryState((prevState) => {
        const objectToMove = currentScene.objects.find((obj) => obj.id === id);
        if (!objectToMove) return prevState;

        const otherObjects = currentScene.objects.filter((obj) => obj.id !== id);
        const maxZIndex = otherObjects.length > 0 ? Math.max(...otherObjects.map(obj => obj.zIndex)) : 0;

        const newObjects = [
          ...otherObjects,
          { ...objectToMove, zIndex: maxZIndex + 1 },
        ];

        const newScenes = [...prevState.scenes];
        newScenes[prevState.currentSceneIndex] = { ...currentScene, objects: newObjects };
        return { ...prevState, scenes: newScenes };
      });
    },
    [currentScene, updateStoryState]
  );

  const handleSceneClick = useCallback(() => {
    setSelectedObjectId(null);
  }, []);

  const handleSaveStory = useCallback(async () => {
    try {
      const storyData = {
        title: storyTitle,
        state: storyState,
      };

      let storyRecordId = urlStoryId;

      if (storyRecordId) {
        // Update existing story
        const { error } = await supabase
          .from('stories')
          .update({ title: storyTitle, state: storyState })
          .eq('id', storyRecordId);

        if (error) throw error;
        toast({
          title: 'Story Updated!',
          description: 'Your story has been successfully updated.',
        });
      } else {
        // Insert new story
        const { data, error } = await supabase
          .from('stories')
          .insert(storyData)
          .select('id')
          .single();

        if (error) throw error;
        storyRecordId = data.id;
        toast({
          title: 'Story Saved!',
          description: 'Your story has been successfully saved.',
        });
        navigate(`/story-creator/${storyRecordId}`, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: 'Error saving story',
        description: error.message || 'Could not save your story.',
        variant: 'destructive',
      });
      console.error('Error saving story:', error);
    }
  }, [storyTitle, storyState, urlStoryId, toast, navigate]);

  const handleShareStory = useCallback(() => {
    if (!urlStoryId) {
      toast({
        title: 'Story not saved',
        description: 'Please save your story before sharing.',
        variant: 'destructive',
      });
      return;
    }
    const shareUrl = `${window.location.origin}/story-creator/${urlStoryId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Shareable URL copied!',
      description: 'Anyone with the link can view your story.',
    });
  }, [urlStoryId, toast]);

  // Load story from URL on component mount
  useEffect(() => {
    const loadStory = async () => {
      if (urlStoryId) {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', urlStoryId)
          .single();

        if (error && error.code !== 'PGRST116') {
          toast({
            title: 'Error loading story',
            description: error.message || 'Could not load story.',
            variant: 'destructive',
          });
          console.error('Error loading story:', error);
          navigate('/story-creator', { replace: true }); // Redirect to new story if not found
          return;
        }

        if (data) {
          setStoryTitle(data.title);
          setStoryState(data.state as StoryState);
          setHistory([data.state as StoryState]);
          setHistoryPointer(0);
          toast({
            title: 'Story Loaded!',
            description: `Loaded "${data.title}" from URL.`, 
          });
        } else {
          toast({
            title: 'Story Not Found',
            description: 'No story found for this URL. Starting a new story.',
            variant: 'default',
          });
          navigate('/story-creator', { replace: true }); // Redirect to new story if not found
        }
      }
    };

    loadStory();
  }, [urlStoryId, navigate, toast]);

  // Reset history when storyState changes (not from undo/redo)
  useEffect(() => {
    if (history[historyPointer] !== storyState) {
      // This means storyState was updated directly, not via undo/redo
      // This case is handled by updateStoryState's saveStateToHistory
      // No need to do anything here unless we want to detect external changes
    }
  }, [storyState, history, historyPointer]);

  return (
    <DndProvider backend={DndBackend} options={isMobile ? { enableMouseEvents: true } : undefined}>
      <div className="flex flex-col lg:flex-row h-screen bg-gray-50 p-4 gap-4">
        {/* Left Sidebar: Story Elements */}
        <Card className="w-full lg:w-1/4 flex-shrink-0">
          <CardHeader>
            <CardTitle>Story Elements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[calc(100vh-150px)]">
            {storyElements.map((element) => (
              <DraggableElement key={element.id} element={element} />
            ))}
          </CardContent>
        </Card>

        {/* Main Content: Scene Editor */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Scene Editor</CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="story-title" className="sr-only">Story Title</Label>
                <Input
                  id="story-title"
                  placeholder="Story Title"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="w-48"
                />
                <Button onClick={handleUndo} disabled={historyPointer === 0}>Undo</Button>
                <Button onClick={handleRedo} disabled={historyPointer === history.length - 1}>Redo</Button>
                <Button onClick={handleSaveStory}>Save Story</Button>
                <Button onClick={handleShareStory} disabled={!urlStoryId}>Share</Button>
              </div>
            </CardHeader>
            <CardContent
              ref={(node) => { drop(node); sceneRef.current = node; }}
              className="relative w-full h-[calc(100vh-250px)] lg:h-[calc(100vh-180px)] border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden"
              onClick={handleSceneClick}
            >
              {currentScene.objects.map((obj) => {
                const elementData = storyElements.find((el) => el.id === obj.elementId);
                if (!elementData) return null;
                return (
                  <SceneObjectRenderer
                    key={obj.id}
                    sceneObject={obj}
                    elementData={elementData}
                    onSelect={setSelectedObjectId}
                    isSelected={selectedObjectId === obj.id}
                    onUpdatePosition={handleUpdatePosition}
                    onUpdateScale={handleUpdateScale}
                    onUpdateRotation={handleUpdateRotation}
                    onBringToFront={handleBringToFront}
                  />
                );
              })}
            </CardContent>
          </Card>

          {/* Scene Navigation (Future Enhancement) */}
          <Card>
            <CardHeader>
              <CardTitle>Scenes</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-2 overflow-x-auto pb-2">
              {storyState.scenes.map((scene, index) => (
                <Button
                  key={scene.id}
                  variant={index === storyState.currentSceneIndex ? 'default' : 'outline'}
                  onClick={() => updateStoryState(prevState => ({ ...prevState, currentSceneIndex: index }))}
                >
                  {scene.name}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  updateStoryState((prevState) => ({
                    ...prevState,
                    scenes: [...prevState.scenes, { id: nanoid(), name: `Scene ${prevState.scenes.length + 1}`, objects: [] }],
                    currentSceneIndex: prevState.scenes.length,
                  }))
                }
              >
                + Add Scene
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
};

export default StoryCreator;
