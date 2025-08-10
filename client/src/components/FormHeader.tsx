import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ObjectUploader } from "./ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { Clock, List } from "lucide-react";

interface FormHeaderProps {
  title: string;
  description: string;
  headerImage: string;
  questionCount: number;
  onUpdate: (updates: { title?: string; description?: string; headerImage?: string }) => void;
}

export function FormHeader({ title, description, headerImage, questionCount, onUpdate }: FormHeaderProps) {
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
      onUpdate({ headerImage: uploadedUrl });
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-8">
        {headerImage ? (
          <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
            <img 
              src={headerImage} 
              alt="Form header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <h1 className="text-3xl font-bold text-white z-10">{title}</h1>
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <h1 className="text-3xl font-bold text-white z-10">{title}</h1>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="form-title" className="text-base font-medium">Form Title</Label>
            <Input
              id="form-title"
              value={title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="mt-2"
              placeholder="Enter form title"
            />
          </div>
          
          <div>
            <Label htmlFor="form-description" className="text-base font-medium">Description</Label>
            <Textarea
              id="form-description"
              value={description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="mt-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-base font-medium">Header Image</Label>
            <div className="mt-2">
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="w-full"
              >
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary hover:bg-primary/5 transition-all">
                  <div className="text-gray-400 text-xl mb-2">📷</div>
                  <p className="text-sm text-gray-500">
                    {headerImage ? "Change header image" : "Click to upload header image"}
                  </p>
                </div>
              </ObjectUploader>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-6 pt-4 border-t">
          <span className="flex items-center">
            <Clock size={16} className="mr-1" />
            Est. 15 minutes
          </span>
          <span className="flex items-center">
            <List size={16} className="mr-1" />
            {questionCount} questions
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
