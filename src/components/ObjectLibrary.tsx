import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ChefHat, 
  Bath, 
  Sofa, 
  Hammer, 
  Home, 
  Lightbulb,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export interface ObjectDefinition {
  id: string;
  name: string;
  category: string;
  dimensions: [number, number, number];
  color: string;
  position?: [number, number, number];
}

const objectLibrary: Record<string, ObjectDefinition[]> = {
  kitchen: [
    { id: "cabinet-base", name: "Base Cabinet", category: "kitchen", dimensions: [2, 0.9, 0.6], color: "#8B4513" },
    { id: "cabinet-wall", name: "Wall Cabinet", category: "kitchen", dimensions: [2, 0.7, 0.3], color: "#8B4513" },
    { id: "refrigerator", name: "Refrigerator", category: "kitchen", dimensions: [0.7, 1.8, 0.7], color: "#C0C0C0" },
    { id: "stove", name: "Stove", category: "kitchen", dimensions: [0.8, 0.9, 0.6], color: "#2F4F4F" },
    { id: "dishwasher", name: "Dishwasher", category: "kitchen", dimensions: [0.6, 0.85, 0.6], color: "#C0C0C0" },
    { id: "island", name: "Kitchen Island", category: "kitchen", dimensions: [2.5, 0.9, 1.2], color: "#8B4513" },
    { id: "countertop", name: "Countertop", category: "kitchen", dimensions: [3, 0.05, 0.6], color: "#696969" },
  ],
  bathroom: [
    { id: "toilet", name: "Toilet", category: "bathroom", dimensions: [0.4, 0.8, 0.7], color: "#FFFFFF" },
    { id: "vanity", name: "Vanity", category: "bathroom", dimensions: [1.2, 0.85, 0.5], color: "#8B4513" },
    { id: "bathtub", name: "Bathtub", category: "bathroom", dimensions: [1.7, 0.6, 0.8], color: "#FFFFFF" },
    { id: "shower", name: "Shower Stall", category: "bathroom", dimensions: [1, 2, 1], color: "#E6E6FA" },
    { id: "sink", name: "Pedestal Sink", category: "bathroom", dimensions: [0.6, 0.85, 0.5], color: "#FFFFFF" },
    { id: "mirror", name: "Mirror", category: "bathroom", dimensions: [0.02, 0.8, 1], color: "#C0C0C0" },
  ],
  living: [
    { id: "sofa", name: "Sofa", category: "living", dimensions: [2.2, 0.8, 0.9], color: "#8B7355" },
    { id: "coffee-table", name: "Coffee Table", category: "living", dimensions: [1.2, 0.4, 0.6], color: "#654321" },
    { id: "tv-stand", name: "TV Stand", category: "living", dimensions: [1.5, 0.5, 0.4], color: "#2F4F4F" },
    { id: "armchair", name: "Armchair", category: "living", dimensions: [0.8, 0.8, 0.8], color: "#8B7355" },
    { id: "bookshelf", name: "Bookshelf", category: "living", dimensions: [0.3, 2, 0.8], color: "#654321" },
    { id: "side-table", name: "Side Table", category: "living", dimensions: [0.5, 0.6, 0.5], color: "#654321" },
  ],
  framing: [
    { id: "stud-2x4", name: "2x4 Stud", category: "framing", dimensions: [0.1, 2.4, 0.04], color: "#DEB887" },
    { id: "beam-2x8", name: "2x8 Beam", category: "framing", dimensions: [0.2, 0.05, 3], color: "#DEB887" },
    { id: "joist", name: "Floor Joist", category: "framing", dimensions: [0.05, 0.25, 4], color: "#DEB887" },
    { id: "header", name: "Door Header", category: "framing", dimensions: [1.2, 0.2, 0.1], color: "#DEB887" },
    { id: "foundation", name: "Foundation Block", category: "framing", dimensions: [2, 0.5, 1], color: "#696969" },
    { id: "rafter", name: "Roof Rafter", category: "framing", dimensions: [0.05, 0.2, 3], color: "#DEB887" },
  ],
  exterior: [
    { id: "door-entry", name: "Entry Door", category: "exterior", dimensions: [0.1, 2, 0.9], color: "#8B4513" },
    { id: "window", name: "Window", category: "exterior", dimensions: [0.1, 1.2, 1], color: "#87CEEB" },
    { id: "siding", name: "Siding Panel", category: "exterior", dimensions: [0.02, 2.4, 3], color: "#F5DEB3" },
    { id: "roof-tile", name: "Roof Section", category: "exterior", dimensions: [3, 0.1, 2], color: "#696969" },
    { id: "deck", name: "Deck Platform", category: "exterior", dimensions: [4, 0.1, 3], color: "#DEB887" },
    { id: "fence", name: "Fence Panel", category: "exterior", dimensions: [0.1, 1.8, 2], color: "#8B4513" },
  ],
  accessories: [
    { id: "ceiling-light", name: "Ceiling Light", category: "accessories", dimensions: [0.3, 0.1, 0.3], color: "#FFFFE0" },
    { id: "floor-lamp", name: "Floor Lamp", category: "accessories", dimensions: [0.3, 1.5, 0.3], color: "#2F4F4F" },
    { id: "plant", name: "Plant", category: "accessories", dimensions: [0.4, 0.8, 0.4], color: "#228B22" },
    { id: "artwork", name: "Wall Art", category: "accessories", dimensions: [0.02, 0.8, 1], color: "#4B0082" },
    { id: "rug", name: "Area Rug", category: "accessories", dimensions: [2, 0.01, 1.5], color: "#B22222" },
    { id: "curtains", name: "Window Curtains", category: "accessories", dimensions: [0.05, 2, 1.2], color: "#FF6347" },
  ],
};

const categoryConfig = {
  kitchen: { icon: ChefHat, label: "Kitchen", color: "text-orange-600" },
  bathroom: { icon: Bath, label: "Bathroom", color: "text-blue-600" },
  living: { icon: Sofa, label: "Living Room", color: "text-green-600" },
  framing: { icon: Hammer, label: "Construction", color: "text-yellow-600" },
  exterior: { icon: Home, label: "Exterior", color: "text-purple-600" },
  accessories: { icon: Lightbulb, label: "Accessories", color: "text-pink-600" },
};

interface ObjectLibraryProps {
  onObjectSelect: (object: ObjectDefinition) => void;
}

export const ObjectLibrary = ({ onObjectSelect }: ObjectLibraryProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['kitchen']));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="w-80 bg-surface-elevated border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Object Library</h2>
        <p className="text-sm text-muted-foreground">Click to add objects to your scene</p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2">
          {Object.entries(categoryConfig).map(([category, config]) => {
            const Icon = config.icon;
            const isExpanded = expandedCategories.has(category);
            const objects = objectLibrary[category] || [];
            
            return (
              <div key={category} className="mb-2">
                <Button
                  variant="ghost"
                  onClick={() => toggleCategory(category)}
                  className="w-full justify-start p-2 h-auto"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2" />
                  )}
                  <Icon className={`w-4 h-4 mr-2 ${config.color}`} />
                  <span className="font-medium">{config.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {objects.length}
                  </span>
                </Button>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {objects.map((object) => (
                      <Button
                        key={object.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-8"
                        onClick={() => onObjectSelect(object)}
                      >
                        <div 
                          className="w-3 h-3 rounded mr-2" 
                          style={{ backgroundColor: object.color }}
                        />
                        {object.name}
                      </Button>
                    ))}
                  </div>
                )}
                
                {category !== 'accessories' && <Separator className="my-2" />}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};