'use client';

import React, { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { ConversationMessage } from '@/types/appointment';
import { Button } from '@/components/ui/Button';
import { ConversationDisplay } from './ConversationDisplay';
import { CallControls } from './CallControls';
import { motion, AnimatePresence } from 'framer-motion';
import { mockConversation } from '@/lib/ai/conversation';

interface CallInterfaceProps {
    appointment: Appointment;
    onClose: () => void;
    onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
    appointment,
    onClose,
    onUpdateAppointment
}) => {
    const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
    const [duration, setDuration] = useState(0);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Start call automatically
    useEffect(() => {
        if (callStatus === 'idle') {
            startCall();
        }
    }, []);

    // Call duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStatus === 'connected') {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const startCall = async () => {
        setCallStatus('dialing');

        // Simulate dialing
        setTimeout(async () => {
            setCallStatus('connected');

            // Initial AI greeting
            setIsTyping(true);
            setTimeout(async () => {
                const response = await mockConversation(appointment, '', 0);
                const aiMessage: ConversationMessage = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: response.message,
                    timestamp: new Date()
                };
                setMessages([aiMessage]);
                setIsTyping(false);
            }, 1500);
        }, 2000);
    };

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const userMessage: ConversationMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userInput,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setUserInput('');
        setIsTyping(true);

        // Get AI response
        setTimeout(async () => {
            const response = await mockConversation(appointment, userInput, messages.length);

            const aiMessage: ConversationMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);

            // Update appointment if needed
            if (response.update) {
                onUpdateAppointment(appointment.id, response.update);

                // End call after update
                setTimeout(() => {
                    endCall();
                }, 2000);
            }
        }, 1000 + Math.random() * 1000);
    };

    const endCall = () => {
        setCallStatus('ended');
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4">
            {/* Call Header */}
            <div className="text-center">
                <AnimatePresence mode="wait">
                    {callStatus === 'dialing' && (
                        <motion.div
                            key="dialing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-white">{appointment.patient_name}</p>
                            <p className="text-gray-400 mt-1 text-sm">Calling...</p>
                        </motion.div>
                    )}

                    {callStatus === 'connected' && (
                        <motion.div
                            key="connected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-white">{appointment.patient_name}</p>
                            <p className="text-green-400 mt-1 text-sm">{formatDuration(duration)}</p>
                        </motion.div>
                    )}

                    {callStatus === 'ended' && (
                        <motion.div
                            key="ended"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700 flex items-center justify-center">
                                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-white">Call Ended</p>
                            <p className="text-gray-400 mt-1 text-sm">Duration: {formatDuration(duration)}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Conversation */}
            {callStatus === 'connected' && (
                <>
                    <ConversationDisplay messages={messages} isTyping={isTyping} />

                    {/* Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your response..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button onClick={sendMessage} disabled={!userInput.trim()}>
                            Send
                        </Button>
                    </div>

                    <CallControls onEndCall={endCall} />
                </>
            )}
        </div>
    );
};
