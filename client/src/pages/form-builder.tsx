import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, Question } from "@shared/schema";
import { FormHeader } from "@/components/FormHeader";
import { QuestionTypeSidebar } from "@/components/QuestionTypeSidebar";
import { PreviewPanel } from "@/components/PreviewPanel";
import { CategorizeQuestion } from "@/components/question-types/CategorizeQuestion";
import { ClozeQuestion } from "@/components/question-types/ClozeQuestion";
import { ComprehensionQuestion } from "@/components/question-types/ComprehensionQuestion";
import { Box, Edit, Eye, BarChart3, Share, Save } from "lucide-react";

export default function FormBuilder() {
  const [match, params] = useRoute("/builder/:id");
  const { toast } = useToast();
  const formId = params?.id;

  const [formData, setFormData] = useState({
    title: "Untitled Form",
    description: "",
    headerImage: "",
    questions: [] as Question[],
    isPublished: false,
  });

  const { data: form, isLoading } = useQuery({
    queryKey: ["/api/forms", formId],
    enabled: !!formId,
  });

  const createFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/forms", data);
      return response.json();
    },
    onSuccess: (newForm) => {
      toast({
        title: "Form created!",
        description: "Your form has been created successfully.",
      });
      window.history.replaceState(null, "", `/builder/${newForm.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/forms/${formId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form saved!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms", formId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save form. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (form) {
      setFormData({
        title: (form as Form).title,
        description: (form as Form).description || "",
        headerImage: (form as Form).headerImage || "",
        questions: (form as Form).questions as Question[] || [],
        isPublished: (form as Form).isPublished,
      });
    }
  }, [form]);

  const handleSave = () => {
    if (formId) {
      updateFormMutation.mutate(formData);
    } else {
      createFormMutation.mutate(formData);
    }
  };

  const handlePublish = () => {
    const publishData = { ...formData, isPublished: true };
    if (formId) {
      updateFormMutation.mutate(publishData);
    } else {
      createFormMutation.mutate(publishData);
    }
  };

  const addQuestion = (type: "categorize" | "cloze" | "comprehension") => {
    let newQuestion: Question;
    
    if (type === "categorize") {
      newQuestion = {
        id: `question_${Date.now()}`,
        type: "categorize",
        question: "",
        items: [],
        categories: [],
      };
    } else if (type === "cloze") {
      newQuestion = {
        id: `question_${Date.now()}`,
        type: "cloze",
        text: "",
        blanks: [],
      };
    } else {
      newQuestion = {
        id: `question_${Date.now()}`,
        type: "comprehension",
        passage: "",
        questions: [],
      };
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } as Question : q
      ),
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "categorize":
        return (
          <CategorizeQuestion
            key={question.id}
            question={question}
            onUpdate={(updates) => updateQuestion(question.id, updates)}
            onDelete={() => deleteQuestion(question.id)}
          />
        );
      case "cloze":
        return (
          <ClozeQuestion
            key={question.id}
            question={question}
            onUpdate={(updates) => updateQuestion(question.id, updates)}
            onDelete={() => deleteQuestion(question.id)}
          />
        );
      case "comprehension":
        return (
          <ComprehensionQuestion
            key={question.id}
            question={question}
            onUpdate={(updates) => updateQuestion(question.id, updates)}
            onDelete={() => deleteQuestion(question.id)}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FormCraft</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 ml-8">
              <Button variant="ghost" size="sm" className="text-primary bg-primary/10">
                <Edit size={16} className="mr-2" />
                Builder
              </Button>
              <Button variant="ghost" size="sm">
                <Eye size={16} className="mr-2" />
                Preview
              </Button>
              <Button variant="ghost" size="sm">
                <BarChart3 size={16} className="mr-2" />
                Analytics
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleSave}
              disabled={createFormMutation.isPending || updateFormMutation.isPending}
            >
              <Save size={16} className="mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={createFormMutation.isPending || updateFormMutation.isPending}
            >
              <Share size={16} className="mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <QuestionTypeSidebar 
          formData={formData}
          onFormDataChange={setFormData}
          onAddQuestion={addQuestion}
        />

        {/* Main Editor */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Form Header */}
            <FormHeader 
              title={formData.title}
              description={formData.description}
              headerImage={formData.headerImage}
              questionCount={formData.questions.length}
              onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            />

            {/* Questions */}
            {formData.questions.map(renderQuestion)}

            {/* Add Question Button */}
            <div className="text-center py-8">
              <div className="inline-flex space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => addQuestion("categorize")}
                  className="border-dashed"
                >
                  Add Categorize Question
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => addQuestion("cloze")}
                  className="border-dashed"
                >
                  Add Cloze Question
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => addQuestion("comprehension")}
                  className="border-dashed"
                >
                  Add Comprehension Question
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Preview Panel */}
        <PreviewPanel formData={formData} />
      </div>
    </div>
  );
}
