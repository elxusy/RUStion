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
    <div className="dashboard-component">
      <div className="flex gap-4 overflow-x-auto pb-2 pt-1">
        {sortedColumns.map(column => {
          const columnTasks = tasks.filter(task => task.column === column.id);
          return (
            <div 
              key={column.id}
              className={`dashboard-column flex-shrink-0 w-64 rounded-lg border shadow-sm ${
                activeColumn === column.id ? 'border-blue-500 ring-2 ring-blue-900' : 'border-zinc-700'
              } transition-all duration-200`}
              style={{ backgroundColor: column.color }}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex justify-between items-center px-3 py-2 border-b border-zinc-700">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => handleColumnTitleChange(column.id, e.target.value)}
                    className="font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-zinc-200"
                  />
                  <span className="text-xs text-zinc-400 ml-1">{getColumnTaskCount(column.id)} задач</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <button
                      onClick={() => toggleColumnColorPicker(column.id)}
                      className="text-zinc-500 hover:text-blue-400 p-1 rounded-full hover:bg-zinc-800/50 transition-colors"
                      title="Цвет колонки"
                    >
                      <Circle className="w-3.5 h-3.5 fill-current" />
                    </button>
                    {columnColorPickerOpen === column.id && (
                      <div className="absolute top-full right-0 mt-1 p-1 bg-zinc-800 border border-zinc-600 rounded shadow-lg z-20">
                        <div className="grid grid-cols-3 gap-1 mb-1">
                          {COLUMN_COLORS.map(color => (
                            <button
                              key={color.value}
                              onClick={() => handleColumnColorChange(column.id, color.value)}
                              className="w-6 h-6 rounded hover:ring-2 hover:ring-white"
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {columns.length > 1 && (
                    <button
                      onClick={() => handleRemoveColumn(column.id)}
                      className="text-zinc-500 hover:text-red-500 p-1 rounded-full hover:bg-zinc-800/50 transition-colors"
                      title="Удалить колонку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-2 min-h-[12rem] flex flex-col gap-2">
                {columnTasks.length === 0 && (
                  <div className="text-center py-6 text-zinc-500 text-xs italic">
                    Перетащите задачи сюда
                  </div>
                )}
                
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={handleDragEnd}
                    className={`task p-2 rounded border border-zinc-700 shadow-sm cursor-move 
                      hover:shadow hover:border-blue-600 transition-all duration-150 ${
                      draggedTask?.id === task.id ? 'opacity-50 ring-2 ring-blue-800' : ''
                    } ${task.color || 'bg-zinc-800'}`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-1">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskTitleChange(task.id, e.target.value)}
                        onClick={() => setEditingTaskId(task.id)}
                        onBlur={() => setEditingTaskId(null)}
                        className="flex-1 font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-white placeholder-zinc-400"
                        placeholder="Введите название задачи..."
                      />
                      <div className="flex gap-1">
                        <div className="relative">
                          <button
                            onClick={() => toggleColorPicker(task.id)}
                            className="p-1 text-zinc-400 hover:text-blue-400 rounded-full hover:bg-zinc-700/50 transition-colors"
                            title="Изменить цвет"
                          >
                            <Circle className="w-3.5 h-3.5 fill-current" />
                          </button>
                          
                          {colorPickerOpen === task.id && (
                            <div className="absolute top-full right-0 mt-1 p-1 bg-zinc-800 border border-zinc-600 rounded shadow-lg z-10 w-28">
                              <div className="grid grid-cols-4 gap-1 mb-1">
                                {CARD_COLORS.map(color => (
                                  <button
                                    key={color.value}
                                    onClick={() => handleTaskColorChange(task.id, color.value)}
                                    className={`w-5 h-5 rounded-full ${color.value} hover:ring-2 hover:ring-white transition-all`}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="drag-handle text-zinc-500">
                          <Move className="w-4 h-4" />
                        </span>
                        <button
                          onClick={() => handleRemoveTask(task.id)}
                          className="text-zinc-500 hover:text-red-500 transition-colors"
                          title="Удалить задачу"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-zinc-400 px-1">{task.description}</p>
                    )}
                  </div>
                ))}
                
                <div className="mt-2">
                  <input
                    type="text"
                    value={taskInputs[column.id] || ''}
                    onChange={(e) => handleTaskInputChange(column.id, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                    placeholder="Добавить задачу..."
                    className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-zinc-700 border-zinc-600 transition-all"
                  />
                  <button
                    onClick={() => handleAddTask(column.id)}
                    className="mt-1 w-full py-1.5 flex items-center justify-center text-sm text-zinc-400 hover:text-blue-400 hover:bg-zinc-800/80 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span>Добавить</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="flex-shrink-0 flex items-start">
          <button
            onClick={handleAddColumn}
            className="p-2 h-10 rounded-lg border border-dashed border-zinc-600 bg-zinc-800/50 text-zinc-400 hover:text-blue-400 hover:border-blue-500 hover:bg-zinc-700 flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span>Добавить колонку</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent; 