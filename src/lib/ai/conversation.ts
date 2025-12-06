import OpenAI from 'openai';
import { Appointment, AppointmentUpdate } from '@/types/appointment';

// Lazy initialize OpenAI client only when needed
let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface ConversationContext {
  appointment: Appointment;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
}

// System prompt for the AI assistant
const getSystemPrompt = (appointment: Appointment) => `You are a friendly medical office assistant making a confirmation call for an appointment.

Appointment Details:
- Patient: ${appointment.patient_name}
- Date & Time: ${new Date(appointment.appointment_time).toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  })}
- Current Status: ${appointment.status}
${appointment.notes ? `- Notes: ${appointment.notes}` : ''}

Your task:
1. Greet the patient warmly
2. Confirm their appointment details
3. Ask if they can confirm or need to reschedule
4. If rescheduling, ask for their preferred date and time
5. Be concise and professional

Important: 
- Keep responses brief (1-2 sentences)
- Be empathetic and understanding
- If they confirm, acknowledge and thank them
- If they reschedule, get the new date/time and confirm
- Use natural, conversational language

When the conversation concludes, include a JSON object in your response with the format:
{
  "action": "confirm" | "reschedule" | "cancel" | "none",
  "new_time": "ISO date string if rescheduling",
  "notes": "any additional notes"
}`;

export async function initializeConversation(appointment: Appointment): Promise<string> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    // Fallback to mock if no API key
    const response = await mockConversation(appointment, '', 0);
    return response.message;
  }

  const context: ConversationContext = {
    appointment,
    messages: [
      { role: 'system', content: getSystemPrompt(appointment) }
    ]
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: context.messages,
    temperature: 0.7,
    max_tokens: 150,
  });

  const assistantMessage = response.choices[0]?.message?.content || 
    `Hello ${appointment.patient_name}, this is a reminder call about your appointment on ${new Date(appointment.appointment_time).toLocaleDateString()}. Can you confirm you'll be able to make it?`;

  return assistantMessage;
}

export async function continueConversation(
  appointment: Appointment,
  conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  userMessage: string
): Promise<{ message: string; update?: AppointmentUpdate }> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    // Fallback to mock if no API key
    return mockConversation(appointment, userMessage, conversationHistory.length);
  }

  const messages = [
    { role: 'system' as const, content: getSystemPrompt(appointment) },
    ...conversationHistory,
    { role: 'user' as const, content: userMessage }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    temperature: 0.7,
    max_tokens: 200,
  });

  const assistantMessage = response.choices[0]?.message?.content || 
    "I understand. Let me help you with that.";

  // Try to extract action from the response
  const update = extractAppointmentUpdate(assistantMessage, userMessage);

  return {
    message: assistantMessage,
    update
  };
}

function extractAppointmentUpdate(assistantMessage: string, userMessage: string): AppointmentUpdate | undefined {
  const lowerMessage = userMessage.toLowerCase();

  // Try to parse JSON from assistant message
  try {
    const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.action === 'confirm') {
        return { status: 'confirmed' };
      } else if (parsed.action === 'cancel') {
        return { status: 'cancelled' };
      } else if (parsed.action === 'reschedule' && parsed.new_time) {
        return { 
          status: 'rescheduled', 
          appointment_time: parsed.new_time,
          notes: parsed.notes 
        };
      }
    }
  } catch {
    // If JSON parsing fails, use keyword detection
  }

  // Fallback: keyword-based detection
  if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('correct')) {
    return { status: 'confirmed' };
  }

  if (lowerMessage.includes('cancel') || lowerMessage.includes('can\'t make it')) {
    return { status: 'cancelled' };
  }

  if (lowerMessage.includes('reschedule') || lowerMessage.includes('different time') || lowerMessage.includes('change')) {
    return { status: 'rescheduled' };
  }

  return undefined;
}

// Simpler version for demo purposes - doesn't require API key
export async function mockConversation(
  appointment: Appointment,
  userMessage: string,
  messageCount: number
): Promise<{ message: string; update?: AppointmentUpdate }> {
  const lowerMessage = userMessage.toLowerCase();

  // First message - greeting
  if (messageCount === 0) {
    return {
      message: `Hello ${appointment.patient_name}! This is a reminder about your appointment on ${new Date(appointment.appointment_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${new Date(appointment.appointment_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Can you confirm you'll be able to make it?`
    };
  }

  // Confirmation
  if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('correct')) {
    return {
      message: "Perfect! Your appointment is confirmed. We'll see you then. Have a great day!",
      update: { status: 'confirmed' }
    };
  }

  // Cancellation
  if (lowerMessage.includes('cancel') || lowerMessage.includes('can\'t make')) {
    return {
      message: "I understand. I've cancelled your appointment. Please call us when you'd like to reschedule. Take care!",
      update: { status: 'cancelled' }
    };
  }

  // Rescheduling
  if (lowerMessage.includes('reschedule') || lowerMessage.includes('different time') || lowerMessage.includes('change')) {
    return {
      message: "No problem! What date and time would work better for you?",
      update: { status: 'rescheduled' }
    };
  }

  // Default response
  return {
    message: "I see. Would you like to confirm your appointment, reschedule, or cancel it?"
  };
}
