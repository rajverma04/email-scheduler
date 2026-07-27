import { useState } from 'react';
import { 
  Paperclip, Undo2, Redo2, Type, Bold, Italic, Underline, AlignLeft, 
  List, ListOrdered, Quote, Link as LinkIcon, Strikethrough, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

interface EmailRichEditorProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setValue: (field: any, val: any, options?: any) => void;
  attachments: AttachmentItem[];
  removeAttachment: (id: string) => void;
  error?: string;
}

export const EmailRichEditor = ({
  editorRef,
  setValue,
  attachments,
  removeAttachment,
  error,
}: EmailRichEditorProps) => {
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        justifyLeft: document.queryCommandState('justifyLeft'),
      });
    } catch {
      // Ignore queryCommandState errors
    }
  };

  const formatCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    if (editorRef.current) {
      setValue('body', editorRef.current.innerHTML, { shouldValidate: true });
    }
    updateActiveFormats();
  };

  const handleLinkPrompt = () => {
    const url = prompt('Enter URL link:');
    if (url) {
      formatCommand('createLink', url);
    }
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 min-h-[380px] space-y-4">
      {/* Floating White Pill Formatting Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 px-4 py-1.5 flex items-center gap-1 text-gray-500 text-xs w-fit mx-auto">
        <button 
          type="button" 
          onClick={() => formatCommand('undo')} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button" 
          onClick={() => formatCommand('redo')} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <span className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

        <button 
          type="button" 
          onClick={() => formatCommand('fontSize', '4')} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 flex items-center gap-0.5 transition-colors" 
          title="Font Size"
        >
          <Type className="w-3.5 h-3.5" /><span className="text-[10px]">Tт</span>
        </button>

        <span className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

        <button 
          type="button" 
          onClick={() => formatCommand('bold')} 
          className={cn("p-1.5 rounded-full transition-colors font-bold", activeFormats.bold ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button" 
          onClick={() => formatCommand('italic')} 
          className={cn("p-1.5 rounded-full transition-colors italic", activeFormats.italic ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button" 
          onClick={() => formatCommand('underline')} 
          className={cn("p-1.5 rounded-full transition-colors underline", activeFormats.underline ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button" 
          onClick={() => formatCommand('strikeThrough')} 
          className={cn("p-1.5 rounded-full transition-colors line-through", activeFormats.strikeThrough ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <span className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

        <button 
          type="button" 
          onClick={() => formatCommand('justifyLeft')} 
          className={cn("p-1.5 rounded-full transition-colors", activeFormats.justifyLeft ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button" 
          onClick={() => formatCommand('insertOrderedList')} 
          className={cn("p-1.5 rounded-full transition-colors", activeFormats.insertOrderedList ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button" 
          onClick={() => formatCommand('insertUnorderedList')} 
          className={cn("p-1.5 rounded-full transition-colors", activeFormats.insertUnorderedList ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button" 
          onClick={() => formatCommand('formatBlock', 'blockquote')} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button" 
          onClick={handleLinkPrompt} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive contentEditable Rich Text Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={() => {
          if (editorRef.current) {
            setValue('body', editorRef.current.innerHTML, { shouldValidate: true });
          }
          updateActiveFormats();
        }}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onClick={updateActiveFormats}
        data-placeholder="Type Your Reply..."
        className="w-full min-h-[160px] focus:outline-none text-sm text-gray-800 dark:text-gray-200 p-2 border-none rounded-xl empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
      />

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="pt-3 flex flex-wrap gap-3 border-t border-gray-200/60 dark:border-gray-700/60">
          {attachments.map((att) => (
            <div key={att.id} className="relative group">
              {att.type.startsWith('image/') ? (
                <div className="w-36 h-24 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm relative">
                  <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeAttachment(att.id)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                  <Paperclip className="w-4 h-4 text-[#00A859]" />
                  <div className="text-xs max-w-[120px] truncate">
                    <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{att.name}</div>
                    <div className="text-[10px] text-gray-400">{att.size}</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeAttachment(att.id)}
                    className="text-gray-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};
