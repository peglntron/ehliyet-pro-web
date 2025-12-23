import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Box } from '@mui/material';
import type { DrivingLesson } from '../../types/drivingLesson';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'tr': tr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: tr }),
  getDay,
  locales,
});

interface MonthCalendarViewProps {
  lessons: DrivingLesson[];
  onSelectDate: (date: Date) => void;
  onSelectLesson: (lesson: DrivingLesson) => void;
}

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: DrivingLesson;
}

const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  lessons,
  onSelectDate,
  onSelectLesson,
}) => {
  // Dersleri takvim eventlerine çevir
  const events: CalendarEvent[] = useMemo(() => {
    return lessons.map(lesson => {
      const lessonDate = lesson.scheduledDate ? new Date(lesson.scheduledDate) : new Date();
      
      let [hours, minutes] = (lesson.scheduledTime || '09:00').split(':').map(Number);
      
      const start = new Date(lessonDate);
      start.setHours(hours, minutes, 0, 0);
      
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + 30);
      
      return {
        id: lesson.id,
        title: `${lesson.student.firstName} ${lesson.student.lastName}`,
        start,
        end,
        resource: lesson,
      };
    });
  }, [lessons]);

  // Status renklerini belirle
  const eventStyleGetter = (event: CalendarEvent) => {
    const lesson = event.resource;
    let backgroundColor = '#2196f3';
    
    switch (lesson.status) {
      case 'COMPLETED':
        backgroundColor = '#4caf50';
        break;
      case 'INSTRUCTOR_DONE':
        backgroundColor = '#ff9800';
        break;
      case 'CANCELLED':
        backgroundColor = '#f44336';
        break;
      case 'SCHEDULED':
        backgroundColor = '#2196f3';
        break;
      case 'PLANNED':
        backgroundColor = '#9e9e9e';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '13px',
        padding: '4px 6px',
      }
    };
  };

  // Custom event component - sadece isim
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const lesson = event.resource;
    return (
      <Box sx={{ 
        overflow: 'hidden', 
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '15px',
        fontWeight: 600,
      }}>
        {lesson.student.firstName} {lesson.student.lastName}
      </Box>
    );
  };

  const messages = {
    today: 'Bugün',
    previous: 'Geri',
    next: 'İleri',
    month: 'Ay',
    week: 'Hafta',
    day: 'Gün',
    agenda: 'Ajanda',
    date: 'Tarih',
    time: 'Saat',
    event: 'Ders',
    noEventsInRange: 'Bu tarih aralığında ders bulunmuyor',
    showMore: (total: number) => `+${total} daha`,
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 300px)', 
      minHeight: '600px',
      '& .rbc-calendar': {
        fontSize: '14px',
      },
      '& .rbc-header': {
        padding: '12px 6px',
        fontWeight: 600,
        fontSize: '15px',
        borderBottom: '2px solid #ddd',
      },
      '& .rbc-time-slot': {
        minHeight: '60px',
      },
      '& .rbc-timeslot-group': {
        minHeight: '60px',
      },
      '& .rbc-day-slot .rbc-time-slot': {
        borderTop: '1px solid #e0e0e0',
      },
      '& .rbc-today': {
        backgroundColor: '#e3f2fd',
      },
      '& .rbc-event': {
        padding: '6px 8px',
        fontSize: '15px',
      },
      '& .rbc-event-content': {
        fontSize: '15px',
        fontWeight: 600,
      },
      '& .rbc-time-content': {
        borderTop: '2px solid #ddd',
      },
      '& .rbc-current-time-indicator': {
        backgroundColor: '#e91e63',
        height: '2px',
      },
    }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={[Views.WEEK, Views.DAY]}
        defaultView={Views.WEEK}
        messages={messages}
        onSelectEvent={(event: CalendarEvent) => onSelectLesson(event.resource)}
        selectable={false}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        culture="tr"
        min={new Date(2025, 0, 1, 8, 0, 0)}
        max={new Date(2025, 0, 1, 20, 0, 0)}
        step={30}
        timeslots={2}
      />
    </Box>
  );
};

export default MonthCalendarView;
