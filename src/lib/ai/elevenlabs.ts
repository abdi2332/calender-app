import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Lazy initialize ElevenLabs client
let elevenLabsClient: ElevenLabsClient | null = null;

function getElevenLabsClient() {
  if (!elevenLabsClient && process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
    elevenLabsClient = new ElevenLabsClient({
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    });
  }
  return elevenLabsClient;
}

/**
 * Convert text to speech using ElevenLabs
 * @param text - The text to convert to speech
 * @param voiceId - Optional voice ID (defaults to Rachel)
 * @returns Audio blob or null if ElevenLabs is not configured
 */
export async function textToSpeech(
  text: string,
  voiceId: string = '21m00Tcm4TlvDq8ikWAM' // Rachel voice (default)
): Promise<Blob | null> {
  const client = getElevenLabsClient();
  
  if (!client) {
    console.warn('⚠️ ElevenLabs not configured - text-to-speech disabled');
    return null;
  }

  try {
    console.log('🎙️ Generating speech with ElevenLabs...');
    
    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    });

    // Convert stream to blob
    const chunks: Uint8Array[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    console.log('✅ Speech generated successfully');
    return blob;
  } catch (error: unknown) {
    // Handle specific ElevenLabs errors
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status?: number }).status;
      
      if (status === 401) {
        console.error('❌ ElevenLabs API Error: Unauthorized (401)');
        console.error('This could be due to:');
        console.error('  - Invalid API key');
        console.error('  - Unusual activity detected (VPN/proxy)');
        console.error('  - Free tier abuse prevention');
        console.error('💡 Solution: Disable VPN or upgrade to paid plan');
      } else if (status === 429) {
        console.error('❌ ElevenLabs API Error: Rate limit exceeded (429)');
        console.error('💡 Solution: Wait a moment or upgrade plan');
      } else {
        console.error('❌ ElevenLabs API Error:', error);
      }
    } else {
      console.error('❌ ElevenLabs TTS error:', error);
    }
    
    console.log('ℹ️ Falling back to text-only mode');
    return null;
  }
}

/**
 * Play audio from blob
 * @param audioBlob - The audio blob to play
 * @returns Audio element for control
 */
export function playAudio(audioBlob: Blob): HTMLAudioElement {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  audio.play().catch(error => {
    console.error('Audio playback error:', error);
  });

  // Clean up URL when audio ends
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl);
  });

  return audio;
}

/**
 * Available voice IDs from ElevenLabs
 * You can get more voices from: https://elevenlabs.io/app/voice-library
 */
export const VOICE_IDS = {
  rachel: '21m00Tcm4TlvDq8ikWAM',      // Female, calm
  domi: 'AZnzlk1XvdvUeBnXmlld',        // Female, strong
  bella: 'EXAVITQu4vr4xnSDxMaL',       // Female, soft
  antoni: 'ErXwobaYiN019PkySvjV',      // Male, well-rounded
  elli: 'MF3mGyEYCl7XYWbV9V6O',        // Male, energetic
  josh: 'TxGEqnHWrfWFTfGW9XjX',        // Male, deep
  arnold: 'VR6AewLTigWG4xSOukaG',      // Male, crisp
  adam: 'pNInz6obpgDQGcFmaJgB',        // Male, deep
  sam: 'yoZ06aMxZJJ28mfd3POQ',         // Male, raspy
};
