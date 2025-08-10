import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ObjectUploader } from "./ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { LayersIcon, Underline, BookOpen } from "lucide-react";

interface QuestionTypeSidebarProps {
  formData: {
    title: string;
    description: string;
    headerImage: string;
    questions: any[];
  };
  onFormDataChange: (updates: any) => void;
  onAddQuestion: (type: "categorize" | "cloze" | "comprehension") => void;
}

export function QuestionTypeSidebar({ formData, onFormDataChange, onAddQuestion }: QuestionTypeSidebarProps) {
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
      onFormDataChange({ ...formData, headerImage: uploadedUrl });
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Types</h2>
        
        {/* Question Type Cards */}
        <div className="space-y-3">
          <Card 
            className="cursor-pointer border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => onAddQuestion("categorize")}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LayersIcon className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Categorize</h3>
                  <p className="text-sm text-gray-500">Drag & drop items into categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => onAddQuestion("cloze")}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Underline className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Cloze (Fill-in-blank)</h3>
                  <p className="text-sm text-gray-500">Underline words to create blanks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => onAddQuestion("comprehension")}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Comprehension</h3>
                  <p className="text-sm text-gray-500">Paragraph with MCQ questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Form Settings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sidebar-title" className="block text-sm font-medium text-gray-700 mb-2">Form Title</Label>
            <Input
              id="sidebar-title"
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              placeholder="Enter form title..."
            />
          </div>
          
          <div>
            <Label htmlFor="sidebar-description" className="block text-sm font-medium text-gray-700 mb-2">Description</Label>
            <Textarea
              id="sidebar-description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Add form description..."
              rows={3}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Header Image</Label>
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full"
            >
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary hover:bg-primary/5 transition-all">
                <div className="text-gray-400 text-xl mb-2">☁️</div>
                <p className="text-sm text-gray-500">Click to upload header image</p>
              </div>
            </ObjectUploader>
          </div>
        </div>
      </div>
    </aside>
  );
}
