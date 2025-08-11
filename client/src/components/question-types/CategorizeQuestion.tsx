import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Image upload temporarily disabled
// import { ObjectUploader } from "../ObjectUploader";
// import { apiRequest } from "@/lib/queryClient";
import { CategorizeQuestion as CategorizeQuestionType } from "@shared/schema";
import { LayersIcon, Settings, Plus, Trash2, Image } from "lucide-react";

// Sortable Item Component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}

// Sortable Category Component  
function SortableCategory({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}

interface CategorizeQuestionProps {
  question: CategorizeQuestionType;
  onUpdate: (updates: Partial<CategorizeQuestionType>) => void;
  onDelete: () => void;
}

export function CategorizeQuestion({ question, onUpdate, onDelete }: CategorizeQuestionProps) {
  const [newItemText, setNewItemText] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Image upload handlers temporarily disabled
  // const handleGetUploadParameters = async () => {
  //   const response = await apiRequest("POST", "/api/objects/upload");
  //   const data = await response.json();
  //   return {
  //     method: "PUT" as const,
  //     url: data.uploadURL,
  //   };
  // };

  // const handleUploadComplete = (result: any) => {
  //   if (result.successful && result.successful[0]) {
  //     const uploadedUrl = result.successful[0].uploadURL;
  //     onUpdate({ image: uploadedUrl });
  //   }
  // };

  const addItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem = {
      id: `item_${Date.now()}`,
      text: newItemText.trim(),
      correctCategory: question.categories[0]?.id || "",
    };
    
    onUpdate({
      items: [...question.items, newItem],
    });
    setNewItemText("");
  };

  const updateItem = (itemId: string, updates: Partial<typeof question.items[0]>) => {
    onUpdate({
      items: question.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteItem = (itemId: string) => {
    onUpdate({
      items: question.items.filter(item => item.id !== itemId),
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: `category_${Date.now()}`,
      name: newCategoryName.trim(),
    };
    
    onUpdate({
      categories: [...question.categories, newCategory],
    });
    setNewCategoryName("");
  };

  const updateCategory = (categoryId: string, name: string) => {
    onUpdate({
      categories: question.categories.map(cat => 
        cat.id === categoryId ? { ...cat, name } : cat
      ),
    });
  };

  const deleteCategory = (categoryId: string) => {
    onUpdate({
      categories: question.categories.filter(cat => cat.id !== categoryId),
      items: question.items.map(item => 
        item.correctCategory === categoryId 
          ? { ...item, correctCategory: "" } 
          : item
      ),
    });
  };

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = question.items.findIndex(item => item.id === active.id);
      const newIndex = question.items.findIndex(item => item.id === over.id);

      onUpdate({
        items: arrayMove(question.items, oldIndex, newIndex),
      });
    }
  };

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = question.categories.findIndex(cat => cat.id === active.id);
      const newIndex = question.categories.findIndex(cat => cat.id === over.id);

      onUpdate({
        categories: arrayMove(question.categories, oldIndex, newIndex),
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <LayersIcon className="text-blue-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Categorize Question</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </Label>
          <Input
            id="question-text"
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question..."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Items to Categorize - Drag & Drop Enabled */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Items to Categorize
            </h4>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd}
            >
              <SortableContext 
                items={question.items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 mb-4">
                  {question.items.map(item => (
                    <SortableItem key={item.id} id={item.id}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex-1">
                        <Input
                          value={item.text}
                          onChange={(e) => updateItem(item.id, { text: e.target.value })}
                          className="border-none bg-transparent p-0 h-auto"
                          placeholder="Item text"
                        />
                        <div className="flex items-center space-x-2">
                          <Select
                            value={item.correctCategory}
                            onValueChange={(value) => updateItem(item.id, { correctCategory: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <div className="flex space-x-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add new item..."
                onKeyPress={(e) => e.key === "Enter" && addItem()}
              />
              <Button onClick={addItem} variant="outline">
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Categories - Drag & Drop Enabled */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Categories
            </h4>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCategoryDragEnd}
            >
              <SortableContext 
                items={question.categories.map(cat => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 mb-4">
                  {question.categories.map(category => (
                    <SortableCategory key={category.id} id={category.id}>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 flex-1">
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, e.target.value)}
                          className="border-none bg-transparent p-0 h-auto font-medium text-blue-900"
                          placeholder="Category name"
                        />
                        <Button variant="ghost" size="sm" onClick={() => deleteCategory(category.id)}>
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </SortableCategory>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <div className="flex space-x-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Add new category..."
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
              />
              <Button onClick={addCategory} variant="outline">
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Image upload temporarily disabled due to storage configuration */}
        {/* <div className="mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
            <Image size={16} className="mr-2" />
            Add Image (Coming Soon)
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}
