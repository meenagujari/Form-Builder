import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ObjectUploader } from "../ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { CategorizeQuestion as CategorizeQuestionType } from "@shared/schema";
import { LayersIcon, Settings, Plus, Trash2, Image } from "lucide-react";

interface CategorizeQuestionProps {
  question: CategorizeQuestionType;
  onUpdate: (updates: Partial<CategorizeQuestionType>) => void;
  onDelete: () => void;
}

export function CategorizeQuestion({ question, onUpdate, onDelete }: CategorizeQuestionProps) {
  const [newItemText, setNewItemText] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful[0]) {
      const uploadedUrl = result.successful[0].uploadURL;
      onUpdate({ image: uploadedUrl });
    }
  };

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
          {/* Items to Categorize */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Items to Categorize</h4>
            <div className="space-y-2 mb-4">
              {question.items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
              ))}
            </div>
            
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

          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
            <div className="space-y-2 mb-4">
              {question.categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
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
              ))}
            </div>
            
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

        <div className="mt-6 pt-4 border-t border-gray-200">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={10485760}
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <Image size={16} className="mr-2" />
            {question.image ? "Change Image" : "Add Image"}
          </ObjectUploader>
          
          {question.image && (
            <div className="mt-4">
              <img src={question.image} alt="Question" className="max-w-xs rounded border" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
