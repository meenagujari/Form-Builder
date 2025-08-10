import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Monitor, ExternalLink, Share } from "lucide-react";

interface PreviewPanelProps {
  formData: {
    title: string;
    description: string;
    questions: any[];
  };
}

export function PreviewPanel({ formData }: PreviewPanelProps) {
  return (
    <aside className="w-96 bg-white border-l border-gray-200 flex flex-col hidden xl:flex">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Smartphone size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Tablet size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="bg-primary/10 text-primary">
              <Monitor size={16} />
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <Button variant="ghost" size="sm" className="flex-1 bg-white shadow-sm">
            Builder
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            Fill
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        <Card>
          <CardContent className="p-4">
            {/* Miniature Form Preview */}
            <div className="text-center mb-4">
              <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
              <h3 className="font-semibold text-sm text-gray-900">{formData.title}</h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{formData.description}</p>
            </div>

            {/* Question Preview Cards */}
            <div className="space-y-3">
              {formData.questions.map((question, index) => (
                <div key={question.id} className={`p-3 rounded-lg border ${
                  question.type === "categorize" ? "bg-blue-50 border-blue-200" :
                  question.type === "cloze" ? "bg-green-50 border-green-200" :
                  "bg-purple-50 border-purple-200"
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {question.type === "categorize" && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                    {question.type === "cloze" && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                    {question.type === "comprehension" && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
                    <span className="text-xs font-medium capitalize">
                      {question.type === "cloze" ? "Fill-in-blank" : question.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {question.type === "categorize" && (question.question || "Categorize items...")}
                    {question.type === "cloze" && (question.text?.substring(0, 30) + "..." || "Fill in the blanks...")}
                    {question.type === "comprehension" && (question.passage?.substring(0, 30) + "..." || "Reading passage...")}
                  </div>
                </div>
              ))}
              
              {formData.questions.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No questions added yet
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
              <Button size="sm" className="w-full">
                Submit Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 border-t border-gray-200">
        <div className="space-y-3">
          <Button className="w-full" size="sm">
            <ExternalLink size={16} className="mr-2" />
            Open in New Tab
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Share size={16} className="mr-2" />
            Generate Share Link
          </Button>
        </div>
      </div>
    </aside>
  );
}
