'use client';

import React, { useState, useEffect } from 'react';

type SimpleTextEditorProps = {
  initialContent: string;
  onSave: (content: string) => void;
  placeholder?: string;
};

export const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  initialContent,
  onSave,
  placeholder = 'Начните писать...'
}) => {
  const [content, setContent] = useState(initialContent);
  
  // Обновляем контент, если initialContent изменился
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  
  // Автосохранение после изменений
  useEffect(() => {
    const timerId = setTimeout(() => {
      onSave(content);
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [content, onSave]);

  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 min-h-[200px] focus:outline-none border border-zinc-800 rounded-lg bg-zinc-900/50 text-zinc-200 resize-none"
    />
  );
};

export default SimpleTextEditor; 