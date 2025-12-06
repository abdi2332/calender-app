'use client';

import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Appointment } from '@/types/appointment';
import { getStatusEventColor } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface AppointmentCalendarProps {
    appointments: Appointment[];
    onSelectAppointment: (appointment: Appointment) => void;
}

interface CalendarEvent extends Event {
    resource: Appointment;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
    appointments,
    onSelectAppointment
}) => {
    const events: CalendarEvent[] = useMemo(() => {
        return appointments.map((appointment) => ({
            title: appointment.patient_name,
            start: new Date(appointment.appointment_time),
            end: new Date(new Date(appointment.appointment_time).getTime() + 30 * 60000), // 30 min appointments
            resource: appointment,
        }));
    }, [appointments]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const backgroundColor = getStatusEventColor(event.resource.status);
        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
            },
        };
    };

    return (
        <div className="h-full bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={(event) => onSelectAppointment(event.resource)}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView="week"
                popup
                className="custom-calendar"
            />
        </div>
    );
};
