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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      const data = await appointmentsApi.getAll();
      setAppointments(data);
      console.log('✅ Loaded appointments:', data.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load appointments';
      setError(errorMessage);
      console.error('❌ Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallClick = (appointment: Appointment) => {
    console.log('📞 Opening call for:', appointment.patient_name);
    setSelectedAppointment(appointment);
    setIsCallModalOpen(true);
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      console.log('🔄 Updating appointment:', id, updates);
      await appointmentsApi.update(id, updates);
      await loadAppointments();
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const upcomingAppointments = filteredAppointments
    .filter((apt) => new Date(apt.appointment_time) >= new Date())
    .sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Medical Appointment Manager
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">AI-Powered Appointment Confirmation System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Live</span>
              </div>
              <div className="text-sm text-gray-500">
                {appointments.length} total
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Data</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <p className="text-gray-400 text-xs mt-2">Check console for details or verify Supabase configuration in .env.local</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar Section - Takes more space */}
          <div className="xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden"
            >
              {isLoading ? (
                <div className="h-[600px] sm:h-[700px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading appointments...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-[600px] sm:h-[700px] flex items-center justify-center">
                  <div className="text-center px-4">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400 mb-4">Unable to load calendar</p>
                    <button
                      onClick={loadAppointments}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[600px] sm:h-[700px]">
                  <AppointmentCalendar
                    appointments={filteredAppointments}
                    onSelectAppointment={handleCallClick}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Filter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-3">Filter</h2>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'confirmed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === status
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </div>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
              <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No upcoming appointments</p>
                  </div>
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
