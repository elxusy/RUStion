'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  color?: string;
};

type CalendarProps = {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
};

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 
  'Май', 'Июнь', 'Июль', 'Август',
  'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const CalendarComponent: React.FC<CalendarProps> = ({ 
  events = [], 
  onDateSelect,
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Получаем первый день месяца
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // День недели первого дня (0 - воскресенье, 1 - понедельник)
  let firstDayWeekday = firstDayOfMonth.getDay();
  // Преобразуем день недели для формата Пн-Вс (1-7)
  firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
  
  // Количество дней в текущем месяце
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Создаем массив дней для отображения календаря
  const calendarDays = [];
  
  // Добавляем пустые ячейки для дней до начала месяца
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Добавляем дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day));
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <div className="calendar-component bg-zinc-800 rounded-lg border border-zinc-700 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
        <button 
          onClick={goToPreviousMonth}
          className="p-1.5 rounded-full hover:bg-zinc-700 text-zinc-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium flex items-center gap-2 text-zinc-200">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span>{MONTHS[currentMonth]} {currentYear}</span>
        </h3>
        <button 
          onClick={goToNextMonth}
          className="p-1.5 rounded-full hover:bg-zinc-700 text-zinc-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS_OF_WEEK.map(day => (
          <div 
            key={day} 
            className="text-xs font-semibold text-zinc-400 text-center py-1"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => (
          <div 
            key={index} 
            className={`
              p-1 h-12 text-center relative rounded-md transition-colors
              ${date ? 'cursor-pointer hover:bg-zinc-700' : ''}
              ${selectedDate && date && isSameDay(date, selectedDate) ? 'bg-blue-900 text-blue-200' : ''}
              ${date && isToday(date) ? 'border border-blue-500' : ''}
            `}
            onClick={() => date && handleDateClick(date)}
          >
            {date && (
              <>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                  isToday(date) 
                    ? 'bg-blue-500 text-white font-medium'
                    : selectedDate && isSameDay(date, selectedDate) 
                      ? 'bg-blue-900 text-blue-200 font-medium'
                      : 'text-zinc-300'
                }`}>
                  {date.getDate()}
                </span>
                
                {/* Индикаторы событий */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-1">
                  {getEventsForDate(date).slice(0, 3).map((event, idx) => (
                    <div
                      key={event.id}
                      className={`w-1.5 h-1.5 rounded-full transition-transform hover:scale-150 ${
                        idx === 0 ? 'bg-green-500' : 
                        idx === 1 ? 'bg-purple-500' : 
                        'bg-orange-500'
                      }`}
                      style={event.color ? { backgroundColor: event.color } : {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      title={event.title}
                    />
                  ))}
                  {getEventsForDate(date).length > 3 && (
                    <div className="text-[9px] text-zinc-400 font-medium">
                      +{getEventsForDate(date).length - 3}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarComponent; 