import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Palette,
} from 'lucide-react';

interface NotionTextBlockProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const COLORS = [
  '#000000', '#e03131', '#f08c00', '#2f9e44', '#1971c2', '#7048e8', '#f59f00', '#fff3bf', '#ffffff'
];
const BG_COLORS = [
  '#ffffff', '#ffe066', '#ffd6e0', '#d0ebff', '#e6fcf5', '#fff3bf', '#f8f9fa', '#dee2e6', '#000000'
];

const FloatingMenuBar: React.FC<{ editor: any }> = ({ editor }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColor, setShowColor] = useState(false);
  const [showBg, setShowBg] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { from, to, empty } = editor.state.selection;
      if (!empty && editor.isFocused) {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setCoords({
            top: rect.top + window.scrollY - 48, // чуть выше выделения
            left: rect.left + window.scrollX + rect.width / 2,
          });
          setShow(true);
        } else {
          setShow(false);
        }
      } else {
        setShow(false);
      }
    };
    editor.on('selectionUpdate', update);
    editor.on('focus', update);
    editor.on('blur', update);
    window.addEventListener('scroll', update, true);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('focus', update);
      editor.off('blur', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [editor]);

  if (!editor || !show || !coords) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        transform: 'translate(-50%, -8px)',
        zIndex: 9999,
        background: 'rgba(24,24,27,0.98)',
        border: '1px solid #334155',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        padding: '6px 10px',
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        transition: 'opacity 0.15s',
      }}
      onMouseDown={e => e.preventDefault()} // чтобы не терять фокус
    >
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'text-blue-500' : ''}><Bold size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'text-blue-500' : ''}><Italic size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'text-blue-500' : ''}><UnderlineIcon size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'text-blue-500' : ''}><Strikethrough size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'text-yellow-400' : ''}><Highlighter size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
        if (editor.isActive('heading', { level: 1 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }
      }} className={editor.isActive('heading', { level: 1 }) ? 'text-blue-500' : ''}><Heading1 size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
        if (editor.isActive('heading', { level: 2 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }
      }} className={editor.isActive('heading', { level: 2 }) ? 'text-blue-500' : ''}><Heading2 size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
        if (editor.isActive('heading', { level: 3 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }
      }} className={editor.isActive('heading', { level: 3 }) ? 'text-blue-500' : ''}><Heading3 size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'text-blue-500' : ''}><List size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'text-blue-500' : ''}><ListOrdered size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'text-blue-500' : ''}><AlignLeft size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'text-blue-500' : ''}><AlignCenter size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'text-blue-500' : ''}><AlignRight size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
        const url = window.prompt('Введите ссылку');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }} className={editor.isActive('link') ? 'text-blue-500' : ''}><LinkIcon size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={18} /></button>
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowColor(v => !v)}><Palette size={18} /></button>
      {showColor && (
        <div style={{ position: 'absolute', top: 38, left: 0, background: '#222', borderRadius: 6, padding: 6, display: 'flex', gap: 4, zIndex: 10000 }}>
          {COLORS.map(color => (
            <button
              key={color}
              style={{ background: color, width: 20, height: 20, borderRadius: '50%', border: '2px solid #fff', outline: editor.isActive('textStyle', { color }) ? '2px solid #60a5fa' : 'none' }}
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().setColor(color).run();
                setShowColor(false);
              }}
              title={color}
            />
          ))}
          <button
            style={{ background: 'none', color: '#fff', border: 'none', marginLeft: 4 }}
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              setShowColor(false);
            }}
          >✕</button>
        </div>
      )}
      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowBg(v => !v)}><Highlighter size={18} /></button>
      {showBg && (
        <div style={{ position: 'absolute', top: 38, left: 40, background: '#222', borderRadius: 6, padding: 6, display: 'flex', gap: 4, zIndex: 10000 }}>
          {BG_COLORS.map(bg => (
            <button
              key={bg}
              style={{ background: bg, width: 20, height: 20, borderRadius: '50%', border: '2px solid #fff', outline: editor.isActive('highlight', { color: bg }) ? '2px solid #f59f00' : 'none' }}
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().toggleHighlight({ color: bg }).run();
                setShowBg(false);
              }}
              title={bg}
            />
          ))}
          <button
            style={{ background: 'none', color: '#fff', border: 'none', marginLeft: 4 }}
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().unsetHighlight().run();
              setShowBg(false);
            }}
          >✕</button>
        </div>
      )}
    </div>,
    document.body
  );
};

const NotionTextBlock: React.FC<NotionTextBlockProps> = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Введите текст...' }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc max-w-none min-h-[32px] focus:outline-none relative',
      },
    },
  });

  return (
    <div className="notion-text-block border border-zinc-700 rounded-lg p-3 bg-zinc-900 hover:border-blue-400 transition-colors relative">
      <style>{`
        .notion-text-block h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.2em 0 0.6em 0;
        }
        .notion-text-block h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
        }
        .notion-text-block h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0.8em 0 0.4em 0;
        }
        .notion-text-block .hl[data-color="#ffffff"] { background: #ffffff; color: #222; }
        .notion-text-block .hl[data-color="#ffe066"] { background: #ffe066; color: #222; }
        .notion-text-block .hl[data-color="#ffd6e0"] { background: #ffd6e0; color: #222; }
        .notion-text-block .hl[data-color="#d0ebff"] { background: #d0ebff; color: #222; }
        .notion-text-block .hl[data-color="#e6fcf5"] { background: #e6fcf5; color: #222; }
        .notion-text-block .hl[data-color="#fff3bf"] { background: #fff3bf; color: #222; }
        .notion-text-block .hl[data-color="#f8f9fa"] { background: #f8f9fa; color: #222; }
        .notion-text-block .hl[data-color="#dee2e6"] { background: #dee2e6; color: #222; }
        .notion-text-block .hl[data-color="#000000"] { background: #000000; color: #fff; }
      `}</style>
      <FloatingMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default NotionTextBlock; 