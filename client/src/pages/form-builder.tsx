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
import { Box, Edit, Eye, BarChart3, Share, Save, Plus, Settings, Trash2, Copy, FileText } from "lucide-react";

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

    console.log("New question created:", newQuestion);
    const updatedFormData = {
      ...formData,
      questions: [...formData.questions, newQuestion],
    };
    console.log("Updated form data:", updatedFormData);
    setFormData(updatedFormData);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    FormCraft
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Interactive Form Builder</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 ml-8">
                <Button variant="ghost" size="sm" className="text-primary bg-primary/10 font-medium">
                  <Edit size={16} className="mr-2" />
                  Builder
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-gray-100"
                  onClick={() => {
                    if (formId) {
                      // Open form filling mode in new tab
                      window.open(`/fill/${formId}`, '_blank');
                    } else {
                      toast({
                        title: "Save form first",
                        description: "Please save your form before previewing it.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Eye size={16} className="mr-2" />
                  Preview Form
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <BarChart3 size={16} className="mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 hidden sm:block">
                {formData.questions.length} question{formData.questions.length !== 1 ? 's' : ''}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSave}
                disabled={createFormMutation.isPending || updateFormMutation.isPending}
                className="hover:bg-gray-100"
              >
                <Save size={16} className="mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={createFormMutation.isPending || updateFormMutation.isPending}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
              >
                <Share size={16} className="mr-2" />
                Publish Form
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <aside className="w-80 border-r border-gray-200/50 glass-effect min-h-screen">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Question Types</h2>
              <p className="text-sm text-gray-600">Drag or click to add questions to your form</p>
            </div>
            
            <div className="space-y-4">
              <div 
                onClick={() => {
                  console.log("Adding categorize question");
                  addQuestion("categorize");
                }}
                className="sidebar-item"
                style={{ cursor: 'pointer' }}
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Box size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Categorize</h3>
                  <p className="text-sm text-gray-500">Drag & drop items into categories</p>
                </div>
              </div>
              
              <div 
                onClick={() => {
                  console.log("Adding cloze question");
                  addQuestion("cloze");
                }}
                className="sidebar-item"
                style={{ cursor: 'pointer' }}
              >
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Edit size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Cloze Test</h3>
                  <p className="text-sm text-gray-500">Fill in the blank questions</p>
                </div>
              </div>
              
              <div 
                onClick={() => {
                  console.log("Adding comprehension question");
                  addQuestion("comprehension");
                }}
                className="sidebar-item"
                style={{ cursor: 'pointer' }}
              >
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Comprehension</h3>
                  <p className="text-sm text-gray-500">Reading passage with MCQs</p>
                </div>
              </div>
            </div>

            {/* Form Settings */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Settings size={16} className="mr-2" />
                Form Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Form title"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Form description"
                    className="text-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Enhanced Main Editor */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-8">
            {/* Form Header Card */}
            <div className="mb-8">
              <div className="question-card">
                <div className="text-center">
                  {formData.headerImage && (
                    <div className="w-full h-32 gradient-bg rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <h1 className="text-2xl font-bold text-white z-10">{formData.title}</h1>
                    </div>
                  )}
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {formData.title || "Untitled Form"}
                  </h1>
                  {formData.description && (
                    <p className="text-lg text-gray-600 mb-4">{formData.description}</p>
                  )}
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FileText size={16} className="mr-2" />
                      {formData.questions.length} questions
                    </span>
                    <span className="flex items-center">
                      <Eye size={16} className="mr-2" />
                      Interactive
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {console.log("Rendering questions:", formData.questions)}
              {formData.questions.map((question, index) => {
                console.log("Rendering question:", question);
                return (
                  <div key={question.id} className="relative group">
                    <div className="absolute -left-12 top-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    {renderQuestion(question)}
                  </div>
                );
              })}
            </div>

            {/* Empty State / Add Question */}
            {formData.questions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-500 mb-6">Start building your form by adding questions from the sidebar</p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => addQuestion("categorize")} variant="outline">
                    <Box size={16} className="mr-2" />
                    Add Categorize
                  </Button>
                  <Button onClick={() => addQuestion("cloze")} variant="outline">
                    <Edit size={16} className="mr-2" />
                    Add Cloze
                  </Button>
                  <Button onClick={() => addQuestion("comprehension")} variant="outline">
                    <FileText size={16} className="mr-2" />
                    Add Comprehension
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => addQuestion("categorize")}
                  className="bg-white hover:bg-gray-50 shadow-sm"
                >
                  <Plus size={20} className="mr-2" />
                  Add Another Question
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
