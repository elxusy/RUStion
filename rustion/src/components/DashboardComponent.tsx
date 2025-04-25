'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Move, LayoutGrid, Circle, Tag, PenSquare, CalendarRange, Check, Palette } from 'lucide-react';

const CARD_COLORS = [
  { name: 'Индиго', value: 'bg-indigo-600', textColor: 'text-white' },
  { name: 'Фиолетовый', value: 'bg-purple-600', textColor: 'text-white' },
  { name: 'Синий', value: 'bg-blue-600', textColor: 'text-white' },
  { name: 'Голубой', value: 'bg-cyan-600', textColor: 'text-white' },
  { name: 'Изумрудный', value: 'bg-emerald-600', textColor: 'text-white' },
  { name: 'Зеленый', value: 'bg-green-600', textColor: 'text-white' },
  { name: 'Желтый', value: 'bg-yellow-500', textColor: 'text-black' },
  { name: 'Оранжевый', value: 'bg-orange-500', textColor: 'text-black' },
  { name: 'Красный', value: 'bg-red-600', textColor: 'text-white' },
  { name: 'Розовый', value: 'bg-pink-600', textColor: 'text-white' },
  { name: 'Серый', value: 'bg-zinc-700', textColor: 'text-white' },
  { name: 'Нейтральный', value: 'bg-slate-800', textColor: 'text-white' }
];

const COLUMN_COLORS = [
  { name: 'Индиго', value: 'from-indigo-950 to-indigo-900' },
  { name: 'Фиолетовый', value: 'from-purple-950 to-purple-900' },
  { name: 'Синий', value: 'from-blue-950 to-blue-900' },
  { name: 'Голубой', value: 'from-cyan-950 to-cyan-900' },
  { name: 'Изумрудный', value: 'from-emerald-950 to-emerald-900' },
  { name: 'Зеленый', value: 'from-green-950 to-green-900' },
  { name: 'Оранжевый', value: 'from-orange-950 to-orange-900' },
  { name: 'Красный', value: 'from-red-950 to-red-900' },
  { name: 'Розовый', value: 'from-pink-950 to-pink-900' },
  { name: 'Нейтральный', value: 'from-zinc-950 to-zinc-900' }
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
    { id: 'todo', title: 'К выполнению', color: 'from-blue-950 to-blue-900', order: 0 },
    { id: 'in-progress', title: 'В процессе', color: 'from-purple-950 to-purple-900', order: 1 },
    { id: 'done', title: 'Выполнено', color: 'from-emerald-950 to-emerald-900', order: 2 },
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
  const [colorPickerTaskPosition, setColorPickerTaskPosition] = useState({ top: 0, left: 0 });
  const [columnColorPickerPosition, setColumnColorPickerPosition] = useState({ top: 0, left: 0 });

  // Новые состояния для режима кисти
  const [isColorMode, setIsColorMode] = useState(false);
  const [activeColorClass, setActiveColorClass] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [palettePosition, setPalettePosition] = useState({ top: 0, left: 0 });
  const [isColumnColorMode, setIsColumnColorMode] = useState(false); // Состояние для переключения режимов раскраски
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null); // Один активный ID вместо карты

  // Добавляем рефы для отслеживания кликов вне меню
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const columnColorPickerRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

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

  // Обработка клика вне меню
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Закрываем все меню при клике вне их
      if (isPaletteOpen || colorPickerOpen || columnColorPickerOpen) {
        // Проверяем, был ли клик на элементе меню
        const target = e.target as HTMLElement;
        if (!target.closest('.color-menu')) {
          setIsPaletteOpen(false);
          setColorPickerOpen(null);
          setColumnColorPickerOpen(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaletteOpen, colorPickerOpen, columnColorPickerOpen]);

  const sortedColumns = [...columns].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  const handleAddColumn = () => {
    const newOrder = Math.max(...columns.map(c => c.order || 0), -1) + 1;
    const id = `column-${Date.now()}`;
    const newColumn = { 
      id, 
      title: 'Новая колонка', 
      color: 'from-zinc-950 to-zinc-900',
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
    // Проверка на корректный формат класса цвета
    if (!color.startsWith('from-')) {
      console.warn('Некорректный формат класса цвета для колонки:', color);
      return;
    }
    
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
      color: 'bg-slate-800' // Новый цвет по умолчанию
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
    // Проверка на корректный формат класса цвета
    if (!colorClass.startsWith('bg-')) {
      console.warn('Некорректный формат класса цвета для задачи:', colorClass);
      return;
    }
    
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

  const toggleTaskColorMenu = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setColorPickerOpen(colorPickerOpen === taskId ? null : taskId);
  };

  const toggleColumnColorMenu = (columnId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setColumnColorPickerOpen(columnColorPickerOpen === columnId ? null : columnId);
  };

  const togglePaletteMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPaletteOpen(!isPaletteOpen);
    
    // Если закрываем палитру, выходим из режима кисти
    if (isPaletteOpen) {
      setIsColorMode(false);
      setActiveColorClass(null);
    }
  };

  const activateColorMode = (colorClass: string) => {
    setActiveColorClass(colorClass);
    setIsColorMode(true);
    
    // Анимация при выборе цвета
    const selectedColor = document.querySelector(`.color-option.${colorClass.replace(/bg-/, '')}`) as HTMLElement;
    if (selectedColor) {
      selectedColor.classList.add('color-selected-animation');
      setTimeout(() => {
        selectedColor.classList.remove('color-selected-animation');
      }, 500);
    }
    
    // Добавляем небольшую задержку перед закрытием палитры для лучшего UX
    setTimeout(() => {
      setIsPaletteOpen(false);
    }, 200);
  };

  // Функция для раскрашивания задач - исправленная версия
  const paintTask = (taskId: string) => {
    if (isColorMode && activeColorClass && !isColumnColorMode) {
      // Находим DOM-элемент задачи для анимации
      const taskElement = document.getElementById(`task-${taskId}`);
      if (taskElement) {
        taskElement.classList.add('color-brush-apply');
        setTimeout(() => {
          taskElement.classList.remove('color-brush-apply');
        }, 300);
      }
      
      // Обновляем цвет задачи
      handleTaskColorChange(taskId, activeColorClass);
      
      // Работаем только с текущей задачей, не устанавливаем глобальный activeTaskId
    }
  };

  // Новая функция для раскрашивания колонок
  const paintColumn = (columnId: string) => {
    if (isColorMode && activeColorClass && isColumnColorMode) {
      // Получаем имя цвета из класса activeColorClass (например, 'bg-indigo-600' -> 'indigo')
      const parts = activeColorClass.split('-');
      if (parts.length < 2) return;
      
      const colorPrefix = parts[1]; // например, 'indigo'
      if (!colorPrefix) return;
      
      const columnColorClass = `from-${colorPrefix}-950 to-${colorPrefix}-900`;
      
      // Убираем анимацию и просто применяем цвет
      handleColumnColorChange(columnId, columnColorClass);
    }
  };

  const finishColoring = () => {
    setIsColorMode(false);
    setActiveColorClass(null);
    setIsColumnColorMode(false);
  };

  return (
    <div className="dashboard-component bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg overflow-hidden" onClick={() => {
      // Закрываем все меню при клике на дашборд
      setColorPickerOpen(null);
      setColumnColorPickerOpen(null);
      setIsPaletteOpen(false);
    }}>
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-400" />
          <span>Управление задачами</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={togglePaletteMenu}
              className={`flex items-center gap-1.5 px-3 py-1.5 
                ${isColorMode ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'} 
                rounded-md transition-all color-menu`}
              title="Режим выбора цвета"
            >
              <Palette className="w-4 h-4" />
              <span>Цвет</span>
            </button>
            
            {isPaletteOpen && (
              <div 
                className="absolute z-50 mt-1 bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl min-w-[280px] color-menu"
                style={{ 
                  top: '100%',
                  left: '0'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-sm text-zinc-300 mb-3 font-medium">Выберите цвет для "кисти":</div>
                <div className="grid grid-cols-6 gap-2">
                  {CARD_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => activateColorMode(color.value)}
                      className={`color-option ${color.value.replace(/bg-/, '')} w-10 h-10 rounded-lg cursor-pointer transition-all ${color.value} 
                        ${activeColorClass === color.value ? 'ring-2 ring-white scale-110 shadow-glow' : 'hover:scale-105'}`}
                      title={color.name}
                    >
                      {activeColorClass === color.value && (
                        <Check className="w-5 h-5 mx-auto text-white" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-zinc-700">
                  <div className="flex justify-between mb-3">
                    <button 
                      onClick={() => setIsColumnColorMode(false)}
                      className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 ${!isColumnColorMode 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                      Раскрашивать задачи
                    </button>
                    <button 
                      onClick={() => setIsColumnColorMode(true)}
                      className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 ${isColumnColorMode 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-sm bg-current"></div>
                      Раскрашивать колонки
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-zinc-400">
                      {isColumnColorMode 
                        ? 'Нажмите на колонку, чтобы изменить её цвет' 
                        : 'Нажмите на задачу, чтобы применить выбранный цвет'}
                    </p>
                    <button 
                      onClick={() => setIsPaletteOpen(false)}
                      className="text-xs px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-300"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Новая колонка</span>
          </button>
        </div>
      </div>
      
      {isColorMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-900/90 py-2 px-4 flex items-center justify-between shadow-lg">
          <div className="text-white flex items-center gap-3">
            <div className={`w-6 h-6 rounded-md ${activeColorClass} border border-white/40 shadow-sm`}></div>
            <div>
              <span className="font-medium">
                {isColumnColorMode ? 'Режим раскрашивания колонок' : 'Режим раскрашивания задач'}
              </span>
              <p className="text-xs text-indigo-200">
                {isColumnColorMode 
                  ? 'Нажмите на колонку, чтобы изменить её цвет' 
                  : 'Нажмите на задачу, чтобы применить выбранный цвет'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-indigo-800/60 rounded-md p-1.5">
              {CARD_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => activateColorMode(color.value)}
                  className={`w-7 h-7 rounded-md cursor-pointer mx-0.5 transition-all ${color.value} 
                    ${activeColorClass === color.value ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'}`}
                  title={color.name}
                >
                  {activeColorClass === color.value && (
                    <Check className="w-4 h-4 mx-auto text-white" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsColumnColorMode(!isColumnColorMode)}
                className={`text-white px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-1.5
                  ${isColumnColorMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600'}`}
              >
                {isColumnColorMode ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <span>Раскрашивать задачи</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-sm bg-white"></div>
                    <span>Раскрашивать колонки</span>
                  </>
                )}
              </button>
              <button 
                onClick={finishColoring}
                className="text-white px-3 py-1.5 rounded-md bg-indigo-700 hover:bg-indigo-600 font-medium text-sm flex items-center gap-1"
              >
                Завершить
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-5 overflow-x-auto p-5 min-h-[500px] bg-gradient-to-b from-zinc-900 to-zinc-950">
        {sortedColumns.map(column => {
          const columnTasks = tasks.filter(task => task.column === column.id);
          return (
            <div 
              key={column.id}
              id={`column-${column.id}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={() => handleDrop(column.id)}
              onClick={() => isColorMode && isColumnColorMode ? paintColumn(column.id) : null}
              className={`column flex-shrink-0 w-[320px] rounded-lg overflow-hidden flex flex-col
                ${isColorMode && isColumnColorMode ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400' : ''}
                ${activeColumn === column.id && draggedTask ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <div className={`p-3 flex items-center justify-between border-b border-opacity-20 border-white bg-gradient-to-br ${column.color || 'from-zinc-950 to-zinc-900'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => handleColumnTitleChange(column.id, e.target.value)}
                    className="bg-transparent border-none outline-none text-white font-medium"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xs text-white/70 px-2 py-0.5 rounded-full bg-black/30">
                    {getColumnTaskCount(column.id)}
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveColumn(column.id);
                  }}
                  className="text-white/70 hover:text-white/90 p-1 rounded-full hover:bg-black/20 transition-colors"
                  title="Удалить колонку"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div 
                className={`flex-1 p-3 overflow-y-auto task-container space-y-3 bg-gradient-to-b ${column.color || 'from-zinc-950 to-zinc-900'} bg-opacity-50`}
              >
                {columnTasks.map(task => (
                  <div 
                    id={`task-${task.id}`}
                    key={task.id}
                    draggable={!isColorMode}
                    onDragStart={() => !isColorMode && handleDragStart(task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => isColorMode && !isColumnColorMode ? paintTask(task.id) : null}
                    className={`task rounded-lg shadow-md overflow-hidden flex flex-col ${task.color || 'bg-slate-800'} 
                      transform transition-all duration-200 
                      ${isColorMode && !isColumnColorMode ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:scale-[1.02]' : 'hover:-translate-y-1 hover:shadow-lg'}`}
                  >
                    <div className="p-3 flex items-center justify-between border-b border-black/10">
                      <div className="flex-1">
                        {editingTaskId === task.id ? (
                          <input
                            type="text"
                            autoFocus
                            value={task.title}
                            onChange={(e) => handleTaskTitleChange(task.id, e.target.value)}
                            onBlur={() => setEditingTaskId(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingTaskId(null)}
                            className={`bg-transparent border-none outline-none w-full font-medium ${CARD_COLORS.find(c => c.value === task.color)?.textColor || 'text-white'}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div 
                            className={`font-medium ${CARD_COLORS.find(c => c.value === task.color)?.textColor || 'text-white'}`}
                            onClick={(e) => { 
                              if (!isColorMode) {
                                e.stopPropagation();
                                setEditingTaskId(task.id);
                              }
                            }}
                          >
                            {task.title}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTask(task.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white rounded-full hover:bg-black/20"
                          title="Удалить задачу"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div 
                          className={`w-6 h-6 flex items-center justify-center text-white/60 ${isColorMode ? 'cursor-default' : 'cursor-grab'}`}
                          title={isColorMode ? "Режим выбора цвета" : "Перетащить задачу"}
                        >
                          {isColorMode && !isColumnColorMode ? (
                            <div 
                              key={`color-indicator-${task.id}`}
                              className={`w-3.5 h-3.5 rounded-full ${task.color || 'bg-gray-500'}`}
                            ></div>
                          ) : (
                            <Move className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {task.description && (
                      <div className="px-3 pb-2 pt-2">
                        <p className={`text-sm ${CARD_COLORS.find(c => c.value === task.color)?.textColor || 'text-white'} opacity-90`}>
                          {task.description}
                        </p>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className={`px-3 pb-2 flex items-center gap-1.5 ${CARD_COLORS.find(c => c.value === task.color)?.textColor || 'text-white'} opacity-80`}>
                        <CalendarRange className="w-3.5 h-3.5" />
                        <span className="text-xs">{task.dueDate}</span>
                      </div>
                    )}
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                        {task.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className={`text-xs px-2 py-0.5 rounded-full bg-black/30 ${CARD_COLORS.find(c => c.value === task.color)?.textColor || 'text-white'} flex items-center gap-1`}
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="add-task mt-2">
                  <div className="bg-black/20 rounded-lg overflow-hidden flex items-stretch">
                    <input
                      type="text"
                      placeholder="Добавить задачу..."
                      value={taskInputs[column.id] || ''}
                      onChange={(e) => handleTaskInputChange(column.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                      className="bg-transparent flex-1 border-none outline-none px-3 py-2 text-sm text-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask(column.id);
                      }}
                      className="px-3 bg-black/30 text-white hover:bg-black/40 transition-colors"
                      title="Добавить задачу"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx global>{`
        /* Анимация только для задач, не для колонок */
        .task.color-brush-apply {
          animation: pulse-animation 0.3s ease-in-out;
          position: relative;
        }
        
        /* Колонки не должны анимироваться */
        .column.color-brush-apply {
          animation: none;
        }
        
        @keyframes pulse-animation {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
          100% { transform: scale(1); }
        }
        
        .color-brush-apply::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
          pointer-events: none;
          opacity: 0;
          animation: brush-shine 0.3s ease-out;
        }
        
        @keyframes brush-shine {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .color-selected-animation {
          animation: select-color-animation 0.5s ease-in-out;
        }
        
        @keyframes select-color-animation {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
          100% { transform: scale(1.1); }
        }
        
        .shadow-glow {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
        }
        
        .task-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        
        .task-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .task-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .task-container::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default DashboardComponent; 