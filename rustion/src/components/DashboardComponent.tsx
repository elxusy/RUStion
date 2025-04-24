'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Move, LayoutGrid, Circle, Tag, PenSquare, CalendarRange } from 'lucide-react';

const CARD_COLORS = [
  { name: 'Синий', value: 'bg-blue-800' },
  { name: 'Зеленый', value: 'bg-emerald-800' },
  { name: 'Фиолетовый', value: 'bg-violet-800' },
  { name: 'Красный', value: 'bg-rose-800' },
  { name: 'Оранжевый', value: 'bg-amber-800' },
  { name: 'Голубой', value: 'bg-cyan-800' },
  { name: 'Серый', value: 'bg-zinc-700' }
];

const COLUMN_COLORS = [
  { name: 'Темно-синий', value: '#1a1d29' },
  { name: 'Темно-зеленый', value: '#0f2922' },
  { name: 'Темно-фиолетовый', value: '#1c1633' },
  { name: 'Темно-красный', value: '#2d1a22' },
  { name: 'Темно-серый', value: '#1e1e24' }
];

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  column: string;
  color?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
};

export type ColumnInfo = {
  id: string;
  title: string;
  color?: string;
  order?: number;
};

type DashboardProps = {
  initialColumns?: ColumnInfo[];
  initialTasks?: TaskItem[];
  onChange?: (columns: ColumnInfo[], tasks: TaskItem[]) => void;
};

const DashboardComponent: React.FC<DashboardProps> = ({
  initialColumns = [
    { id: 'todo', title: 'К выполнению', color: '#1a1d29', order: 0 },
    { id: 'in-progress', title: 'В процессе', color: '#1c1633', order: 1 },
    { id: 'done', title: 'Выполнено', color: '#0f2922', order: 2 },
  ],
  initialTasks = [],
  onChange,
}) => {
  const [columns, setColumns] = useState<ColumnInfo[]>(initialColumns);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<TaskItem | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [columnColorPickerOpen, setColumnColorPickerOpen] = useState<string | null>(null);

  useEffect(() => {
    setColumns(initialColumns);
    setTasks(initialTasks);
  }, [initialColumns, initialTasks]);

  useEffect(() => {
    // Создаем объект с полями ввода для каждой колонки
    const inputs: Record<string, string> = {};
    columns.forEach(col => {
      inputs[col.id] = '';
    });
    setTaskInputs(inputs);
  }, [columns]);

  const sortedColumns = [...columns].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  const handleAddColumn = () => {
    const newOrder = Math.max(...columns.map(c => c.order || 0), -1) + 1;
    const id = `column-${Date.now()}`;
    const newColumn = { 
      id, 
      title: 'Новая колонка', 
      color: '#1a1d29',
      order: newOrder 
    };
    const updatedColumns = [...columns, newColumn];
    
    setColumns(updatedColumns);
    onChange?.(updatedColumns, tasks);
    
    // Добавляем поле ввода для новой колонки
    setTaskInputs(prev => ({
      ...prev,
      [id]: ''
    }));
  };

  const handleRemoveColumn = (id: string) => {
    // Перемещаем все задачи из этой колонки в первую доступную колонку
    const firstColumn = columns.find(c => c.id !== id);
    
    let updatedTasks = [...tasks];
    if (firstColumn) {
      updatedTasks = tasks.map(task => 
        task.column === id ? { ...task, column: firstColumn.id } : task
      );
    } else {
      updatedTasks = tasks.filter(task => task.column !== id);
    }
    
    const updatedColumns = columns.filter(col => col.id !== id);
    
    setColumns(updatedColumns);
    setTasks(updatedTasks);
    onChange?.(updatedColumns, updatedTasks);
    
    // Удаляем поле ввода для удаленной колонки
    const newTaskInputs = { ...taskInputs };
    delete newTaskInputs[id];
    setTaskInputs(newTaskInputs);
  };

  const handleColumnTitleChange = (id: string, title: string) => {
    const updatedColumns = columns.map(col => 
      col.id === id ? { ...col, title } : col
    );
    
    setColumns(updatedColumns);
    onChange?.(updatedColumns, tasks);
  };

  const handleColumnColorChange = (id: string, color: string) => {
    const updatedColumns = columns.map(col => 
      col.id === id ? { ...col, color } : col
    );
    
    setColumns(updatedColumns);
    onChange?.(updatedColumns, tasks);
    setColumnColorPickerOpen(null);
  };

  const handleTaskInputChange = (columnId: string, value: string) => {
    setTaskInputs(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const handleAddTask = (columnId: string) => {
    const inputValue = taskInputs[columnId]?.trim();
    if (!inputValue) return;
    
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: inputValue,
      column: columnId,
      color: 'bg-zinc-700' // Цвет по умолчанию
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    // Очищаем только поле ввода для конкретной колонки
    setTaskInputs(prev => ({
      ...prev,
      [columnId]: ''
    }));
    
    onChange?.(columns, updatedTasks);
  };

  const handleRemoveTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    onChange?.(columns, updatedTasks);
  };

  const handleTaskTitleChange = (taskId: string, title: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, title } : task
    );
    
    setTasks(updatedTasks);
    onChange?.(columns, updatedTasks);
  };

  const handleTaskColorChange = (taskId: string, colorClass: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, color: colorClass } : task
    );
    
    setTasks(updatedTasks);
    onChange?.(columns, updatedTasks);
    setColorPickerOpen(null);
  };

  const handleDragStart = (task: TaskItem) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setActiveColumn(columnId);
  };

  const handleDrop = (columnId: string) => {
    if (!draggedTask) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === draggedTask.id ? { ...task, column: columnId } : task
    );
    
    setTasks(updatedTasks);
    setDraggedTask(null);
    setActiveColumn(null);
    onChange?.(columns, updatedTasks);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setActiveColumn(null);
  };

  const getColumnTaskCount = (columnId: string) => {
    return tasks.filter(task => task.column === columnId).length;
  };

  const toggleColorPicker = (taskId: string) => {
    setColorPickerOpen(prev => prev === taskId ? null : taskId);
  };

  const toggleColumnColorPicker = (columnId: string) => {
    setColumnColorPickerOpen(prev => prev === columnId ? null : columnId);
  };

  return (
    <div className="dashboard-component bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-400" />
          <span>Управление задачами</span>
        </h2>
        <button
          onClick={handleAddColumn}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Новая колонка</span>
        </button>
      </div>
      
      <div className="flex gap-5 overflow-x-auto p-5 min-h-[500px] bg-gradient-to-b from-zinc-900 to-zinc-950">
        {sortedColumns.map(column => {
          const columnTasks = tasks.filter(task => task.column === column.id);
          return (
            <div 
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={() => handleDrop(column.id)}
              className={`column flex-shrink-0 w-[320px] rounded-lg overflow-hidden flex flex-col ${
                activeColumn === column.id && draggedTask ? 'ring-2 ring-indigo-500 ring-opacity-70' : ''
              }`}
              style={{ backgroundColor: column.color || '#1a1a2e' }}
            >
              <div className="p-3 flex items-center justify-between border-b border-opacity-20 border-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => handleColumnTitleChange(column.id, e.target.value)}
                    className="bg-transparent font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 px-2 py-1 rounded max-w-[150px]"
                  />
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => toggleColumnColorPicker(column.id)}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-white/30"
                      style={{ backgroundColor: column.color }}
                    />
                    {columnColorPickerOpen === column.id && (
                      <div className="absolute z-10 mt-2 -left-2 bg-zinc-800 rounded-lg p-2 border border-zinc-700 shadow-xl grid grid-cols-5 gap-1.5 w-[160px]">
                        {COLUMN_COLORS.map(color => (
                          <div
                            key={color.value}
                            className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transform transition-transform border border-white/20"
                            style={{ backgroundColor: color.value }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleColumnColorChange(column.id, color.value);
                            }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-white/70 px-2 py-0.5 rounded-full bg-black/30">
                    {getColumnTaskCount(column.id)}
                  </span>
                </div>
                
                <button
                  onClick={() => handleRemoveColumn(column.id)}
                  className="text-white/70 hover:text-white/90 p-1 rounded-full hover:bg-black/20 transition-colors"
                  title="Удалить колонку"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div 
                className="flex-1 p-3 overflow-y-auto task-container space-y-3"
                style={{ backgroundColor: `${column.color}cc` }}
              >
                {columnTasks.map(task => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={handleDragEnd}
                    className={`task bg-opacity-90 rounded-lg shadow-md overflow-hidden flex flex-col ${task.color || 'bg-zinc-700'} transform transition-transform duration-200 hover:-translate-y-1`}
                  >
                    <div className="p-3 pb-2 flex items-start justify-between gap-2">
                      {editingTaskId === task.id ? (
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleTaskTitleChange(task.id, e.target.value)}
                          onBlur={() => setEditingTaskId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingTaskId(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 bg-black/20 p-1 rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      ) : (
                        <div 
                          onClick={() => setEditingTaskId(task.id)}
                          className="flex-1 text-white cursor-pointer font-medium"
                        >
                          {task.title}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <div
                          className="relative cursor-pointer"
                          onClick={() => toggleColorPicker(task.id)}
                          title="Изменить цвет"
                        >
                          <div className="w-5 h-5 flex items-center justify-center text-white/80 hover:text-white rounded-full hover:bg-black/20">
                            <Circle className="w-3.5 h-3.5" />
                          </div>
                          
                          {colorPickerOpen === task.id && (
                            <div className="absolute z-10 mt-2 right-0 bg-zinc-800 rounded-lg p-2 border border-zinc-700 shadow-xl grid grid-cols-4 gap-1.5 w-[120px]">
                              {CARD_COLORS.map(color => (
                                <div
                                  key={color.value}
                                  className={`w-5 h-5 rounded-full cursor-pointer hover:scale-110 transform transition-transform ${color.value}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskColorChange(task.id, color.value);
                                  }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleRemoveTask(task.id)}
                          className="w-5 h-5 flex items-center justify-center text-white/80 hover:text-white rounded-full hover:bg-black/20"
                          title="Удалить задачу"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div 
                          className="w-5 h-5 flex items-center justify-center text-white/60 cursor-grab"
                          title="Перетащить задачу"
                        >
                          <Move className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                    
                    {task.description && (
                      <div className="px-3 pb-2">
                        <p className="text-white/80 text-sm">{task.description}</p>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="px-3 pb-2 flex items-center gap-1.5">
                        <CalendarRange className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-xs text-white/70">{task.dueDate}</span>
                      </div>
                    )}
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                        {task.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-white/80 flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-36 text-white/40 bg-black/20 rounded-lg">
                    <PenSquare className="w-6 h-6 mb-2" />
                    <p className="text-sm">Нет задач</p>
                    <p className="text-xs">Добавьте первую задачу</p>
                  </div>
                )}
                
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={taskInputs[column.id] || ''}
                      onChange={(e) => handleTaskInputChange(column.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && taskInputs[column.id]?.trim()) {
                          handleAddTask(column.id);
                        }
                      }}
                      placeholder="Добавить задачу..."
                      className="flex-1 bg-black/40 px-3 py-2 rounded-md text-white text-sm placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <button
                      onClick={() => handleAddTask(column.id)}
                      disabled={!taskInputs[column.id]?.trim()}
                      className={`p-2 rounded-md ${
                        taskInputs[column.id]?.trim() 
                          ? 'bg-indigo-600/50 text-white hover:bg-indigo-600/70' 
                          : 'bg-black/30 text-white/50 cursor-not-allowed'
                      } transition-colors`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardComponent; 