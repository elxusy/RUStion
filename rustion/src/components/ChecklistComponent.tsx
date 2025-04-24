'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Check, Square } from 'lucide-react';

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

type ChecklistProps = {
  initialItems?: ChecklistItem[];
  onChange?: (items: ChecklistItem[]) => void;
  title?: string;
};

const ChecklistComponent: React.FC<ChecklistProps> = ({ 
  initialItems = [], 
  onChange,
  title = 'Чеклист'
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setNewItemText('');
    onChange?.(updatedItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleToggleComplete = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  const handleItemTextChange = (id: string, newText: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, text: newText } : item
    );
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  return (
    <div className="checklist bg-zinc-800 rounded-lg border border-zinc-700 p-4 mb-4 shadow-sm">
      <h3 className="font-medium text-lg mb-3 text-zinc-200 border-b border-zinc-700 pb-2">{title}</h3>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-center gap-2 group p-1 hover:bg-zinc-700 rounded transition-colors">
            <button 
              onClick={() => handleToggleComplete(item.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border transition-all duration-200 ${
                item.completed 
                  ? 'bg-emerald-500 border-emerald-500 text-zinc-900' 
                  : 'border-zinc-600 hover:border-emerald-400'
              } flex items-center justify-center`}
            >
              {item.completed && <Check className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleItemTextChange(item.id, e.target.value)}
              className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 transition-all duration-200 ${
                item.completed ? 'line-through text-zinc-500' : 'text-zinc-300'
              }`}
            />
            <button 
              onClick={() => handleDeleteItem(item.id)}
              className="text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-150"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 flex items-center gap-2 border-t border-zinc-700 pt-3">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Добавить задачу..."
          className="flex-1 px-3 py-2 text-sm border border-zinc-600 rounded bg-zinc-700 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          onClick={handleAddItem}
          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-zinc-700 rounded-full transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-3 text-zinc-500 text-sm italic">
          Нет элементов. Добавьте первую задачу!
        </div>
      )}
    </div>
  );
};

export default ChecklistComponent; 