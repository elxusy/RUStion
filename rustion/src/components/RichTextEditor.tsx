'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  toolbarPlugin,
  linkPlugin,
  codeBlockPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  CodeToggle,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  imagePlugin,
  InsertImage,
  frontmatterPlugin
} from '@mdxeditor/editor';
import type { ViewMode } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

type RichTextEditorProps = {
  initialContent: string;
  onSave: (content: string) => void;
  placeholder?: string;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onSave,
  placeholder = 'Начните писать...'
}) => {
  const [content, setContent] = useState<string>(initialContent || '');
  const [viewMode, setViewMode] = useState<ViewMode>('rich-text');
  const isInitialMount = useRef(true);
  const isUserEdit = useRef(false);

  // Мы используем debounce с меньшей задержкой для лучшего отклика
  const debouncedSave = useCallback(
    debounce((value: string) => {
      if (isUserEdit.current) {
        onSave(value);
        isUserEdit.current = false;
      }
    }, 500),
    [onSave]
  );

  const handleContentChange = (value: string) => {
    isUserEdit.current = true;
    setContent(value);
    debouncedSave(value);
  };

  // При инициализации или изменении initialContent снаружи
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Обновляем локальное состояние только если пользователь не редактирует сейчас
    if (!isUserEdit.current && initialContent !== content) {
      setContent(initialContent || '');
    }
  }, [initialContent, content]);

  // Добавляем CSS для улучшения контраста в редакторе
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mdxeditor {
        border: none !important;
      }
      .mdxeditor-content-editable {
        color: white !important;
        font-size: 16px !important;
      }
      .mdxeditor-toolbar {
        background-color: #27272a !important;
        border-bottom: 1px solid #3f3f46 !important;
      }
      .mdxeditor-toolbar-item {
        color: #d4d4d8 !important;
      }
      .mdxeditor-toolbar-item:hover {
        background-color: #3f3f46 !important;
      }
      .mdxeditor-toolbar-item-active {
        background-color: #3b82f6 !important;
        color: white !important;
      }
      .mdxeditor-toolbar-separator {
        background-color: #3f3f46 !important;
      }
      .mdxeditor-placeholder {
        color: #9ca3af !important;
      }
      .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
        color: white !important;
        margin-top: 1.5em !important;
        margin-bottom: 0.5em !important;
      }
      .prose p {
        color: #f1f5f9 !important;
      }
      .prose a {
        color: #3b82f6 !important;
      }
      .prose ul, .prose ol {
        color: #f1f5f9 !important;
      }
      .prose code {
        background-color: #374151 !important;
        color: #f1f5f9 !important;
        padding: 0.1em 0.3em !important;
        border-radius: 0.25em !important;
      }
      .prose pre {
        background-color: #1f2937 !important;
        color: #f1f5f9 !important;
      }
      .prose blockquote {
        border-left-color: #3b82f6 !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
        padding: 0.5em 1em !important;
      }
      .prose table {
        border-color: #374151 !important;
      }
      .prose th {
        background-color: #374151 !important;
        color: white !important;
      }
      .prose td {
        border-color: #374151 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="rich-text-editor w-full rounded-md border border-zinc-700 overflow-hidden shadow-sm">
      <MDXEditor
        markdown={content}
        onChange={handleContentChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none bg-zinc-800 text-white"
        className="w-full bg-zinc-800 text-white"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          tablePlugin(),
          frontmatterPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          diffSourcePlugin({ viewMode }),
          linkPlugin(),
          imagePlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <BlockTypeSelect />
                  <ListsToggle />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <InsertThematicBreak />
                </DiffSourceToggleWrapper>
              </>
            ),
          }),
        ]}
      />
    </div>
  );
};

export default RichTextEditor; 