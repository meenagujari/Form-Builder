import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Form, Question, CategorizeQuestion, ClozeQuestion, ComprehensionQuestion } from "@shared/schema";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
}

function DraggableItem({ id, children }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-move hover:border-primary transition-colors"
    >
      <GripVertical size={16} className="text-gray-400 mr-2" />
      {children}
    </div>
  );
}

export default function FormFill() {
  const [match, params] = useRoute("/fill/:shareUrl");
  const { toast } = useToast();
  const shareUrl = params?.shareUrl;

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [userEmail, setUserEmail] = useState("");

  const { data: form, isLoading, error } = useQuery({
    queryKey: ["/api/share", shareUrl],
    enabled: !!shareUrl,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { answers: Record<string, any>; userEmail?: string }) => {
      const response = await apiRequest("POST", `/api/forms/${(form as Form).id}/responses`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response submitted!",
        description: "Thank you for completing the form.",
      });
      setAnswers({});
      setUserEmail("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    submitMutation.mutate({ answers, userEmail });
  };

  const updateAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const renderCategorizeQuestion = (question: CategorizeQuestion) => {
    const [categorizedItems, setCategorizedItems] = useState<Record<string, string[]>>(() => {
      const initial: Record<string, string[]> = {};
      question.categories.forEach(cat => {
        initial[cat.id] = [];
      });
      initial["uncategorized"] = question.items.map(item => item.id);
      return initial;
    });

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Remove item from current category
      const newCategorized = { ...categorizedItems };
      Object.keys(newCategorized).forEach(categoryId => {
        newCategorized[categoryId] = newCategorized[categoryId].filter(id => id !== activeId);
      });

      // Add item to new category
      if (!newCategorized[overId]) {
        newCategorized[overId] = [];
      }
      newCategorized[overId].push(activeId);

      setCategorizedItems(newCategorized);
      updateAnswer(question.id, newCategorized);
    };

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          {question.image && (
            <img src={question.image} alt="Question" className="w-full max-w-md mb-4 rounded" />
          )}
          
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Uncategorized Items */}
              <div>
                <h4 className="font-medium mb-3">Items to Categorize</h4>
                <SortableContext items={categorizedItems.uncategorized} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2" id="uncategorized">
                    {categorizedItems.uncategorized.map(itemId => {
                      const item = question.items.find(i => i.id === itemId);
                      return item ? (
                        <DraggableItem key={itemId} id={itemId}>
                          {item.text}
                        </DraggableItem>
                      ) : null;
                    })}
                  </div>
                </SortableContext>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-4">
                  {question.categories.map(category => (
                    <div key={category.id} className="min-h-20 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg" id={category.id}>
                      <h5 className="font-medium text-blue-900 mb-2">{category.name}</h5>
                      <SortableContext items={categorizedItems[category.id] || []} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {(categorizedItems[category.id] || []).map(itemId => {
                            const item = question.items.find(i => i.id === itemId);
                            return item ? (
                              <DraggableItem key={itemId} id={itemId}>
                                {item.text}
                              </DraggableItem>
                            ) : null;
                          })}
                        </div>
                      </SortableContext>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DndContext>
        </CardContent>
      </Card>
    );
  };

  const renderClozeQuestion = (question: ClozeQuestion) => {
    const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});

    const updateBlankAnswer = (blankId: string, value: string) => {
      const newAnswers = { ...blankAnswers, [blankId]: value };
      setBlankAnswers(newAnswers);
      updateAnswer(question.id, newAnswers);
    };

    // Parse text with blanks
    const renderTextWithBlanks = () => {
      let text = question.text;
      const sortedBlanks = [...question.blanks].sort((a, b) => b.position - a.position);
      
      sortedBlanks.forEach(blank => {
        const blankInput = `<input id="${blank.id}" data-blank="${blank.id}" class="inline-input" placeholder="____" />`;
        text = text.substring(0, blank.position) + blankInput + text.substring(blank.position + blank.word.length);
      });

      return text;
    };

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fill in the blanks</h3>
          {question.image && (
            <img src={question.image} alt="Question" className="w-full max-w-md mb-4 rounded" />
          )}
          
          <div 
            className="text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderTextWithBlanks() }}
          />
          
          <style dangerouslySetInnerHTML={{ __html: `
            .inline-input {
              border-bottom: 2px solid #6366f1;
              background: transparent;
              outline: none;
              padding: 2px 8px;
              margin: 0 4px;
              min-width: 60px;
              font-weight: 500;
            }
            .inline-input:focus {
              border-bottom-color: #4f46e5;
            }
          ` }} />

          <script dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('[data-blank]').forEach(input => {
                input.addEventListener('input', (e) => {
                  const blankId = e.target.dataset.blank;
                  const value = e.target.value;
                  // This would need to be connected to React state in a real implementation
                });
              });
            `
          }} />

          <div className="mt-4 space-y-2">
            {question.blanks.map(blank => (
              <div key={blank.id} className="flex items-center space-x-2">
                <Label>Blank {question.blanks.indexOf(blank) + 1}:</Label>
                <Input
                  value={blankAnswers[blank.id] || ""}
                  onChange={(e) => updateBlankAnswer(blank.id, e.target.value)}
                  className="w-32"
                  placeholder="Enter answer"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComprehensionQuestion = (question: ComprehensionQuestion) => {
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});

    const updateMcqAnswer = (mcqId: string, optionId: string) => {
      const newAnswers = { ...mcqAnswers, [mcqId]: optionId };
      setMcqAnswers(newAnswers);
      updateAnswer(question.id, newAnswers);
    };

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reading Comprehension</h3>
          {question.image && (
            <img src={question.image} alt="Question" className="w-full max-w-md mb-4 rounded" />
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{question.passage}</p>
          </div>

          <div className="space-y-6">
            {question.questions.map((mcq, index) => (
              <div key={mcq.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Question {index + 1}: {mcq.question}</h4>
                <RadioGroup
                  value={mcqAnswers[mcq.id] || ""}
                  onValueChange={(value) => updateMcqAnswer(mcq.id, value)}
                  className="space-y-2"
                >
                  {mcq.options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "categorize":
        return renderCategorizeQuestion(question);
      case "cloze":
        return renderClozeQuestion(question);
      case "comprehension":
        return renderComprehensionQuestion(question);
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

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
            <p className="text-gray-600">This form may have been removed or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Form Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {(form as Form).headerImage && (
              <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <h1 className="text-3xl font-bold text-white z-10">{(form as Form).title}</h1>
              </div>
            )}
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{(form as Form).title}</h1>
              {(form as Form).description && (
                <p className="text-gray-600 text-lg mb-4">{(form as Form).description}</p>
              )}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>📝 {((form as Form).questions as Question[])?.length || 0} questions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Email */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Label htmlFor="email" className="text-base font-medium">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Questions */}
        {((form as Form).questions as Question[])?.map(renderQuestion)}

        {/* Submit Button */}
        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            size="lg"
            className="px-8"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Form"}
          </Button>
        </div>
      </div>
    </div>
  );
}
