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
import { DndContext, closestCenter, DragEndEvent, useDroppable } from "@dnd-kit/core";
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
      className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-move hover:border-primary hover:shadow-md transition-all duration-200 active:scale-95"
    >
      <GripVertical size={16} className="text-gray-400 mr-2" />
      {children}
    </div>
  );
}

function DraggableAnswerOption({ id, children }: DraggableItemProps) {
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
    >
      {children}
    </div>
  );
}



function DroppableBlank({ id, children, isOver }: { id: string; children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <span
      ref={setNodeRef}
      className={`inline-drop-zone ${isOver ? 'drag-over' : ''}`}
      data-blank={id}
    >
      {children}
    </span>
  );
}

export default function FormFill() {
  const [match, params] = useRoute("/fill/:shareUrl");
  const { toast } = useToast();
  const shareUrl = params?.shareUrl;

  const [answers, setAnswers] = useState<Record<string, any>>({});

  const { data: form, isLoading, error } = useQuery({
    queryKey: ["/api/share", shareUrl],
    enabled: !!shareUrl,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { answers: Record<string, any> }) => {
      const response = await apiRequest("POST", `/api/forms/${(form as Form).id}/responses`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response submitted!",
        description: "Thank you for completing the form.",
      });
      setAnswers({});
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
    submitMutation.mutate({ answers });
  };

  const updateAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const renderCategorizeQuestion = (question: CategorizeQuestion) => {
    // Initialize categorized items for this question if not exists
    if (!answers[question.id]) {
      const initial: Record<string, string[]> = {};
      question.categories.forEach(cat => {
        initial[cat.id] = [];
      });
      initial["uncategorized"] = question.items.map(item => item.id);
      setAnswers(prev => ({
        ...prev,
        [question.id]: initial
      }));
    }

    const categorizedItems = answers[question.id] || {};
    
    // Ensure uncategorized array exists
    if (!categorizedItems.uncategorized) {
      categorizedItems.uncategorized = question.items.map(item => item.id);
    }
    
    const setCategorizedItems = (newItems: Record<string, string[]>) => {
      setAnswers(prev => ({
        ...prev,
        [question.id]: newItems
      }));
    };

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
                <div className="min-h-20 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <SortableContext items={categorizedItems.uncategorized || []} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2" id="uncategorized">
                      {(categorizedItems.uncategorized || []).map(itemId => {
                        const item = question.items.find(i => i.id === itemId);
                        return item ? (
                          <DraggableItem key={itemId} id={itemId}>
                            {item.text}
                          </DraggableItem>
                        ) : null;
                      })}
                      {(categorizedItems.uncategorized || []).length === 0 && (
                        <p className="text-gray-500 text-center py-4">Drop items here to uncategorize them</p>
                      )}
                    </div>
                  </SortableContext>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-4">
                  {question.categories.map(category => (
                    <div key={category.id} className="min-h-20 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg hover:bg-blue-100 transition-colors" id={category.id}>
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
                          {(categorizedItems[category.id] || []).length === 0 && (
                            <p className="text-blue-600 text-center py-2 text-sm">Drop items here</p>
                          )}
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
    // Initialize blank answers for this question if not exists
    if (!answers[question.id]) {
      setAnswers(prev => ({
        ...prev,
        [question.id]: { placedAnswers: {}, usedOptions: [] }
      }));
    }

    const questionAnswers = answers[question.id] || { placedAnswers: {}, usedOptions: [] };
    const placedAnswers = questionAnswers.placedAnswers || {};
    const usedOptions = questionAnswers.usedOptions || [];

    const updateBlankAnswer = (blankId: string, optionWord: string) => {
      const newPlacedAnswers = { ...placedAnswers, [blankId]: optionWord };
      const newUsedOptions = [...usedOptions, optionWord];
      
      setAnswers(prev => ({
        ...prev,
        [question.id]: {
          placedAnswers: newPlacedAnswers,
          usedOptions: newUsedOptions
        }
      }));
    };

    const removeAnswerFromBlank = (blankId: string) => {
      const removedWord = placedAnswers[blankId];
      if (removedWord) {
        const newPlacedAnswers = { ...placedAnswers };
        delete newPlacedAnswers[blankId];
        const newUsedOptions = usedOptions.filter(word => word !== removedWord);
        
        setAnswers(prev => ({
          ...prev,
          [question.id]: {
            placedAnswers: newPlacedAnswers,
            usedOptions: newUsedOptions
          }
        }));
      }
    };

    // Parse text with blanks as React components
    const renderTextWithBlanks = () => {
      let text = question.text;
      const sortedBlanks = [...question.blanks].sort((a, b) => a.position - b.position);
      const parts: (string | { type: 'blank'; id: string; answer: string })[] = [];
      
      let lastPosition = 0;
      
      sortedBlanks.forEach(blank => {
        // Add text before the blank
        if (blank.position > lastPosition) {
          parts.push(text.substring(lastPosition, blank.position));
        }
        
        // Add the blank
        parts.push({
          type: 'blank',
          id: blank.id,
          answer: placedAnswers[blank.id] || ''
        });
        
        lastPosition = blank.position + blank.word.length;
      });
      
      // Add remaining text
      if (lastPosition < text.length) {
        parts.push(text.substring(lastPosition));
      }
      
      return parts;
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
            .inline-drop-zone {
              border: 2px solid #e5e7eb;
              background: #f9fafb;
              padding: 8px 12px;
              margin: 0 4px;
              min-width: 80px;
              min-height: 32px;
              font-weight: 500;
              border-radius: 8px;
              display: inline-block;
              vertical-align: middle;
              cursor: pointer;
              transition: all 0.2s;
              text-align: center;
            }
            .inline-drop-zone:hover {
              background: rgba(99, 102, 241, 0.1);
              border-color: #6366f1;
            }
            .inline-drop-zone.filled {
              background: rgba(34, 197, 94, 0.1);
              border-color: #22c55e;
              color: #15803d;
            }
            .inline-drop-zone.drag-over {
              background: rgba(99, 102, 241, 0.2);
              border-color: #4f46e5;
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
          ` }} />

          <div className="mt-6">
            <h4 className="font-medium mb-3">Drag the correct answers to the blanks:</h4>
            
            <DndContext 
              collisionDetection={closestCenter} 
              onDragEnd={(event) => {
                const { active, over } = event;
                if (!over) return;

                const activeId = active.id as string;
                const overId = over.id as string;
                
                // Check if dropping on a blank space
                const targetBlank = question.blanks.find(b => b.id === overId);
                if (targetBlank && activeId.startsWith('answer-option-')) {
                  const answerText = activeId.replace('answer-option-', '');
                  // Remove any existing answer from this blank first
                  if (placedAnswers[targetBlank.id]) {
                    removeAnswerFromBlank(targetBlank.id);
                  }
                  updateBlankAnswer(targetBlank.id, answerText);
                }
              }}
            >
              {/* Answer Options to Drag */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Answer Options:</h5>
                <div className="flex flex-wrap gap-2">
                  <SortableContext items={question.blanks.filter(b => !usedOptions.includes(b.word)).map(b => `answer-option-${b.word}`)} strategy={verticalListSortingStrategy}>
                    {question.blanks
                      .filter(blank => !usedOptions.includes(blank.word))
                      .map(blank => (
                        <DraggableAnswerOption key={`answer-option-${blank.word}`} id={`answer-option-${blank.word}`}>
                          <div className="px-3 py-2 bg-blue-100 border border-blue-300 rounded-lg cursor-move hover:bg-blue-200 transition-colors">
                            <span className="text-blue-800 font-medium">{blank.word}</span>
                          </div>
                        </DraggableAnswerOption>
                      ))}
                  </SortableContext>
                </div>
                {usedOptions.length === question.blanks.length && (
                  <p className="text-sm text-gray-500 mt-2">All options have been placed!</p>
                )}
              </div>

              {/* Text with Droppable Blanks */}
              <div className="text-base leading-relaxed">
                {renderTextWithBlanks().map((part, index) => {
                  if (typeof part === 'string') {
                    return <span key={index}>{part}</span>;
                  } else {
                    return (
                      <DroppableBlank key={part.id} id={part.id} isOver={false}>
                        {part.answer ? (
                          <span 
                            className="inline-drop-zone filled cursor-pointer"
                            onClick={() => removeAnswerFromBlank(part.id)}
                            title="Click to remove"
                          >
                            <span className="px-2 py-1 bg-green-100 border border-green-300 rounded text-green-800 font-medium">
                              {part.answer}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-drop-zone">&nbsp;</span>
                        )}
                      </DroppableBlank>
                    );
                  }
                })}
              </div>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComprehensionQuestion = (question: ComprehensionQuestion) => {
    // Initialize MCQ answers for this question if not exists
    if (!answers[question.id]) {
      setAnswers(prev => ({
        ...prev,
        [question.id]: {}
      }));
    }

    const mcqAnswers = answers[question.id] || {};

    const updateMcqAnswer = (mcqId: string, optionId: string) => {
      const newAnswers = { ...mcqAnswers, [mcqId]: optionId };
      setAnswers(prev => ({
        ...prev,
        [question.id]: newAnswers
      }));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Enhanced Form Header */}
        <div className="question-card mb-8">
          <div className="text-center">
            {(form as Form).headerImage && (
              <div className="w-full h-48 gradient-bg rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <h1 className="text-3xl font-bold text-white z-10">{(form as Form).title}</h1>
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{(form as Form).title}</h1>
            {(form as Form).description && (
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">{(form as Form).description}</p>
            )}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center bg-blue-50 px-3 py-2 rounded-full">
                📝 {((form as Form).questions as Question[])?.length || 0} questions
              </span>
              <span className="flex items-center bg-green-50 px-3 py-2 rounded-full">
                ⏱️ Interactive form
              </span>
            </div>
          </div>
        </div>



        {/* Questions */}
        {((form as Form).questions as Question[])?.map(renderQuestion)}

        {/* Submit Button */}
        <div className="text-center py-8">
          <Button 
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            size="lg"
            className="px-12 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg text-lg font-semibold"
          >
            {submitMutation.isPending ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Submitting...
              </span>
            ) : (
              "Submit Form"
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-3">Your responses will be recorded securely</p>
        </div>
      </div>
    </div>
  );
}
