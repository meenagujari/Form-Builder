import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { ClozeQuestion as ClozeQuestionType } from "@shared/schema";
import { Underline, Settings, Trash2, Image, Info, GripVertical } from "lucide-react";

// Sortable Blank Component
function SortableBlank({ id, children }: { id: string; children: React.ReactNode }) {
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
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center">
        <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 mr-2">
          <GripVertical size={16} className="text-gray-400" />
        </div>
        {children}
      </div>
    </div>
  );
}

interface ClozeQuestionProps {
  question: ClozeQuestionType;
  onUpdate: (updates: Partial<ClozeQuestionType>) => void;
  onDelete: () => void;
}

export function ClozeQuestion({ question, onUpdate, onDelete }: ClozeQuestionProps) {
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleTextChange = (event: React.FormEvent<HTMLDivElement>) => {
    const text = event.currentTarget.textContent || "";
    onUpdate({ text });
  };

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const selectedText = sel.toString().trim();
      
      if (selectedText && editorRef.current?.contains(range.commonAncestorContainer)) {
        // Calculate position in plain text
        const textContent = editorRef.current.textContent || "";
        const beforeRange = document.createRange();
        beforeRange.setStart(editorRef.current.firstChild || editorRef.current, 0);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        const startPos = beforeRange.toString().length;
        
        setSelection({
          start: startPos,
          end: startPos + selectedText.length,
          text: selectedText,
        });
      }
    }
  };

  const createBlank = () => {
    if (!selection) return;

    const newBlank = {
      id: `blank_${Date.now()}`,
      word: selection.text,
      position: selection.start,
    };

    onUpdate({
      blanks: [...question.blanks, newBlank],
    });

    setSelection(null);
  };

  const deleteBlank = (blankId: string) => {
    onUpdate({
      blanks: question.blanks.filter(blank => blank.id !== blankId),
    });
  };

  const handleBlankDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = question.blanks.findIndex(blank => blank.id === active.id);
      const newIndex = question.blanks.findIndex(blank => blank.id === over.id);

      onUpdate({
        blanks: arrayMove(question.blanks, oldIndex, newIndex),
      });
    }
  };

  const renderTextWithBlanks = () => {
    let text = question.text;
    const sortedBlanks = [...question.blanks].sort((a, b) => b.position - a.position);
    
    sortedBlanks.forEach(blank => {
      const beforeText = text.substring(0, blank.position);
      const afterText = text.substring(blank.position + blank.word.length);
      const blankSpan = `<span class="bg-yellow-100 px-1 border-b-2 border-yellow-400" data-blank="${blank.id}">${blank.word}</span>`;
      text = beforeText + blankSpan + afterText;
    });

    return text;
  };

  useEffect(() => {
    if (editorRef.current) {
      const html = renderTextWithBlanks();
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  }, [question.text, question.blanks]);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Underline className="text-green-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Fill in the Blanks</h3>
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
          <Label className="block text-sm font-medium text-gray-700 mb-2">Instructions</Label>
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Info className="inline text-blue-500 mr-2" size={16} />
            Type your text below, then select words to convert them into fill-in-the-blank fields.
          </div>
        </div>

        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Text Content</Label>
          <div className="border border-gray-300 rounded-lg p-4 min-h-32 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleTextChange}
              onMouseUp={handleMouseUp}
              className="outline-none min-h-24"
              style={{ whiteSpace: "pre-wrap" }}
              suppressContentEditableWarning={true}
            />
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm">
            {selection && (
              <Button
                onClick={createBlank}
                variant="outline"
                size="sm"
                className="text-primary border-primary"
              >
                <Underline size={16} className="mr-1" />
                Create Blank: "{selection.text}"
              </Button>
            )}
          </div>
        </div>

        {question.blanks.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <GripVertical size={16} className="mr-2 text-gray-400" />
              Blank Fields Created (Drag to reorder)
            </h4>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBlankDragEnd}
            >
              <SortableContext 
                items={question.blanks.map(blank => blank.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {question.blanks.map((blank, index) => (
                    <SortableBlank key={blank.id} id={blank.id}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">Blank {index + 1}:</span>
                          <span className="px-2 py-1 bg-yellow-100 rounded text-sm font-medium">
                            {blank.word}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBlank(blank.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </SortableBlank>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Image upload temporarily disabled for assignment */}
      </CardContent>
    </Card>
  );
}
