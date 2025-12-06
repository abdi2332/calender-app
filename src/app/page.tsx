'use client';

import React, { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { AppointmentCalendar } from '@/components/Calendar/AppointmentCalendar';
import { AppointmentCard } from '@/components/Calendar/AppointmentCard';
import { Modal } from '@/components/ui/Modal';
import { CallInterface } from '@/components/MockCall/CallInterface';
import { appointmentsApi } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  // Load appointments
  useEffect(() => {
    loadAppointments();

    // Subscribe to real-time changes
    const subscription = appointmentsApi.subscribeToChanges(() => {
      loadAppointments();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCallModalOpen(true);
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      await appointmentsApi.update(id, updates);
      await loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const upcomingAppointments = filteredAppointments
    .filter((apt) => new Date(apt.appointment_time) >= new Date())
    .sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Medical Appointment Manager
              </h1>
              <p className="text-gray-400 mt-1">AI-Powered Appointment Confirmation System</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[700px]"
            >
              {isLoading ? (
                <div className="h-full bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading appointments...</p>
                  </div>
                </div>
              ) : (
                <AppointmentCalendar
                  appointments={appointments}
                  onSelectAppointment={handleCallClick}
                />
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-3">Filter</h2>
              <div className="flex gap-2">
                {(['all', 'pending', 'confirmed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === status
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Upcoming Appointments</h2>
              <div className="space-y-3 max-h-[560px] overflow-y-auto">
                {upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onCallClick={handleCallClick}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Call Modal */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        title="Mock Call"
        className="max-w-2xl"
      >
        {selectedAppointment && (
          <CallInterface
            appointment={selectedAppointment}
            onClose={() => setIsCallModalOpen(false)}
            onUpdateAppointment={handleUpdateAppointment}
          />
        )}
      </Modal>
    </div>
  );
}
