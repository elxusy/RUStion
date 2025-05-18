'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, PlusCircle, Check, Square, GripVertical, X } from 'lucide-react';

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
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();
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
  
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };
  
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragOverItem) {
      setDragOverItem(id);
    }
  };
  
  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem !== dragOverItem) {
      const draggedIndex = items.findIndex(item => item.id === draggedItem);
      const dragOverIndex = items.findIndex(item => item.id === dragOverItem);
      
      if (draggedIndex > -1 && dragOverIndex > -1) {
        const newItems = [...items];
        const removedItems = newItems.splice(draggedIndex, 1);
        
        if (removedItems.length > 0) {
          const removed: ChecklistItem = removedItems[0] as ChecklistItem;
          newItems.splice(dragOverIndex, 0, removed);
          
          setItems(newItems);
          onChange?.(newItems);
        }
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };
  
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
  
  const clearCompleted = () => {
    const updatedItems = items.filter(item => !item.completed);
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  return (
    <div className="checklist bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg border border-zinc-700 overflow-hidden shadow-md max-w-2xl mx-auto">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-medium text-lg text-zinc-100">{title}</h3>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs text-zinc-400 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded transition-colors"
            >
              Очистить завершенные
            </button>
          )}
        </div>
        
        {totalCount > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>Прогресс: {completedCount} из {totalCount}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
        
        <ul className="space-y-2">
          {items.map(item => (
            <li 
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 group p-3 rounded-md transition-all duration-150
                ${draggedItem === item.id ? 'opacity-50 bg-zinc-700' : ''}
                ${dragOverItem === item.id ? 'border-t-2 border-indigo-500' : ''}
                ${item.completed ? 'bg-zinc-800/40' : 'hover:bg-zinc-700/50'}
              `}
            >
              <div className="cursor-grab text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
              </div>
              
              <button 
                onClick={() => handleToggleComplete(item.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-sm border transition-all duration-200 ${
                  item.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-zinc-900' 
                    : 'border-zinc-600 hover:border-emerald-400'
                } flex items-center justify-center`}
                aria-label={item.completed ? "Отметить как невыполненное" : "Отметить как выполненное"}
              >
                {item.completed && <Check className="w-4 h-4" />}
              </button>
              
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 transition-all duration-200 text-base ${
                  item.completed ? 'line-through text-zinc-500' : 'text-zinc-300'
                }`}
              />
              
              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-150 p-1.5 rounded-full hover:bg-zinc-800"
                aria-label="Удалить задачу"
              >
                <X className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex items-center gap-2 bg-zinc-800 p-4 border-t border-zinc-700">
        <input
          ref={inputRef}
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Добавить задачу..."
          className="flex-1 px-4 py-2.5 text-sm border border-zinc-600 rounded-md bg-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <button
          onClick={handleAddItem}
          disabled={!newItemText.trim()}
          className={`p-2.5 rounded-md transition-colors ${
            newItemText.trim() 
              ? 'text-indigo-400 hover:text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30'
              : 'text-zinc-500 bg-zinc-700 cursor-not-allowed'
          }`}
          aria-label="Добавить задачу"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-6 text-zinc-500 text-sm">
          <div className="mb-2 opacity-70">
            <Square className="w-6 h-6 mx-auto" />
          </div>
          Нет задач. Добавьте первую задачу прямо сейчас!
        </div>
      )}
    </div>
  );
};

export default ChecklistComponent; 