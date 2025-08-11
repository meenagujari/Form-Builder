import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ComprehensionQuestion as ComprehensionQuestionType } from "@shared/schema";
import { BookOpen, Settings, Plus, Trash2, Image, Check } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface ComprehensionQuestionProps {
  question: ComprehensionQuestionType;
  onUpdate: (updates: Partial<ComprehensionQuestionType>) => void;
  onDelete: () => void;
}

export function ComprehensionQuestion({ question, onUpdate, onDelete }: ComprehensionQuestionProps) {
  const [newMcqQuestion, setNewMcqQuestion] = useState("");

  // Image upload temporarily disabled for assignment
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

  const addMcqQuestion = () => {
    if (!newMcqQuestion.trim()) return;

    const newQuestion = {
      id: `mcq_${Date.now()}`,
      question: newMcqQuestion.trim(),
      options: [
        { id: `option_${Date.now()}_1`, text: "", isCorrect: true },
        { id: `option_${Date.now()}_2`, text: "", isCorrect: false },
      ],
    };

    onUpdate({
      questions: [...question.questions, newQuestion],
    });
    setNewMcqQuestion("");
  };

  const updateMcqQuestion = (mcqId: string, updates: Partial<typeof question.questions[0]>) => {
    onUpdate({
      questions: question.questions.map(mcq =>
        mcq.id === mcqId ? { ...mcq, ...updates } : mcq
      ),
    });
  };

  const deleteMcqQuestion = (mcqId: string) => {
    onUpdate({
      questions: question.questions.filter(mcq => mcq.id !== mcqId),
    });
  };

  const addOption = (mcqId: string) => {
    const mcq = question.questions.find(q => q.id === mcqId);
    if (!mcq) return;

    const newOption = {
      id: `option_${Date.now()}`,
      text: "",
      isCorrect: false,
    };

    updateMcqQuestion(mcqId, {
      options: [...mcq.options, newOption],
    });
  };

  const updateOption = (mcqId: string, optionId: string, updates: Partial<{ id: string; text: string; isCorrect: boolean; }>) => {
    const mcq = question.questions.find(q => q.id === mcqId);
    if (!mcq) return;

    updateMcqQuestion(mcqId, {
      options: mcq.options.map(option =>
        option.id === optionId ? { ...option, ...updates } : option
      ),
    });
  };

  const deleteOption = (mcqId: string, optionId: string) => {
    const mcq = question.questions.find(q => q.id === mcqId);
    if (!mcq || mcq.options.length <= 2) return;

    updateMcqQuestion(mcqId, {
      options: mcq.options.filter(option => option.id !== optionId),
    });
  };

  const setCorrectAnswer = (mcqId: string, optionId: string) => {
    const mcq = question.questions.find(q => q.id === mcqId);
    if (!mcq) return;

    updateMcqQuestion(mcqId, {
      options: mcq.options.map(option => ({
        ...option,
        isCorrect: option.id === optionId,
      })),
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-purple-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Comprehension Question</h3>
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
          <Label htmlFor="passage" className="block text-sm font-medium text-gray-700 mb-2">
            Reading Passage
          </Label>
          <Textarea
            id="passage"
            value={question.passage}
            onChange={(e) => onUpdate({ passage: e.target.value })}
            placeholder="Enter the reading passage..."
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">MCQ Questions</h4>
            <div className="flex space-x-2">
              <Input
                value={newMcqQuestion}
                onChange={(e) => setNewMcqQuestion(e.target.value)}
                placeholder="Add new MCQ question..."
                className="w-64"
                onKeyPress={(e) => e.key === "Enter" && addMcqQuestion()}
              />
              <Button onClick={addMcqQuestion} size="sm">
                <Plus size={16} className="mr-1" />
                Add Question
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {question.questions.map((mcq, mcqIndex) => (
              <Card key={mcq.id} className="border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="mb-4">
                    <Label className="block text-xs font-medium text-gray-500 mb-1">
                      QUESTION {mcqIndex + 1}
                    </Label>
                    <Input
                      value={mcq.question}
                      onChange={(e) => updateMcqQuestion(mcq.id, { question: e.target.value })}
                      placeholder="Enter MCQ question..."
                      className="text-sm"
                    />
                  </div>

                  <RadioGroup
                    value={mcq.options.find(opt => opt.isCorrect)?.id}
                    onValueChange={(value) => setCorrectAnswer(mcq.id, value)}
                    className="space-y-2"
                  >
                    {mcq.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(mcq.id, option.id, { text: e.target.value })}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          className="flex-1 text-sm"
                        />
                        {mcq.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteOption(mcq.id, option.id)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(mcq.id)}
                        className="text-primary"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Option
                      </Button>
                      <span className="text-gray-500 flex items-center">
                        <Check size={16} className="mr-1" />
                        Select correct answer using radio buttons
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMcqQuestion(mcq.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {question.questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No MCQ questions added yet. Click "Add Question" to start.
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Question Image</h4>
          {question.image ? (
            <div className="relative mb-4">
              <img 
                src={question.image} 
                alt="Question" 
                className="w-full max-w-md h-32 object-cover rounded-lg border"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ image: "" })}
                className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          ) : (
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={5 * 1024 * 1024} // 5MB
              onGetUploadParameters={async () => {
                const response = await fetch("/api/objects/upload", { method: "POST" });
                const data = await response.json();
                return { method: "PUT" as const, url: data.uploadURL };
              }}
              onComplete={(result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                if (result.successful && result.successful.length > 0) {
                  const uploadURL = result.successful[0].uploadURL;
                  onUpdate({ image: uploadURL });
                }
              }}
              buttonClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <div className="flex items-center">
                <Image size={16} className="mr-2" />
                Add Image
              </div>
            </ObjectUploader>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
