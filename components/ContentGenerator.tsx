import React, { useState, useEffect, useRef } from 'react';
import { TrendItem } from '../types';
import { generateSocialPost, generateSpeech } from '../services/geminiService';

interface ContentGeneratorProps {
  selectedTrend: TrendItem | null;
  onClose: () => void;
}

type PlatformType = 'Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube';

const ICONS: Record<PlatformType, React.ReactNode> = {
  Twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  ),
  LinkedIn: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ),
  Instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  ),
  TikTok: (
     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.09-.63-.63-1.24-1.21-1.93-1.69v8.37c-.01 1.78-.66 3.51-1.81 4.88-1.15 1.38-2.77 2.29-4.52 2.54-1.87.26-3.81-.13-5.38-1.11-1.57-.98-2.71-2.5-3.15-4.27-.44-1.78-.16-3.66.77-5.22.94-1.56 2.45-2.71 4.2-3.2.3-.08.61-.13.92-.15v4.11c-1.12.18-2.07.96-2.45 2.03-.39 1.07-.11 2.27.71 3.09.82.83 2.09 1.07 3.17.61 1.09-.46 1.79-1.53 1.79-2.71V.02h3.66z"/></svg>
  ),
  YouTube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  )
};

// Audio decoding helpers for Gemini API raw PCM
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ selectedTrend, onClose }) => {
  const [platform, setPlatform] = useState<PlatformType>('LinkedIn');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Reset state when trend changes
  useEffect(() => {
    setGeneratedText('');
    setCopied(false);
    stopAudio();
  }, [selectedTrend]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch(e) {}
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleGenerate = async () => {
    if (!selectedTrend) return;
    setLoading(true);
    setGeneratedText(''); 
    stopAudio();
    try {
      const text = await generateSocialPost(selectedTrend, platform);
      setGeneratedText(text);
    } catch (err) {
      setGeneratedText("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!generatedText) return;
    stopAudio();
    setGeneratingVoice(true);
    
    try {
      const base64Audio = await generateSpeech(generatedText);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const ctx = audioContextRef.current;
        // Resume context if suspended (browser policy)
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          ctx,
          24000,
          1
        );

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        
        sourceRef.current = source;
        source.start();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio playback error", err);
    } finally {
      setGeneratingVoice(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedTrend) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Content Creator</h2>
          <p className="text-xs text-gray-500">AI-powered drafting</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Context Card */}
        <div className="bg-brand-50 rounded-xl p-4 mb-6 border border-brand-100">
          <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wide mb-2">Selected Topic</h4>
          <p className="text-sm font-medium text-gray-900 line-clamp-2">{selectedTrend.headline}</p>
        </div>

        {/* Platform Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Platform</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ICONS) as PlatformType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  platform === p
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {ICONS[p]}
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all mb-8"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            <>
              Generate Draft
              <span className="ml-2">✨</span>
            </>
          )}
        </button>

        {/* Result Area */}
        {generatedText && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Generated Draft</label>
              <div className="flex gap-2">
                 {/* Voice Generation Button */}
                <button
                  onClick={isPlaying ? stopAudio : handleGenerateVoice}
                  disabled={generatingVoice}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    isPlaying 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  }`}
                >
                  {generatingVoice ? (
                     <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : isPlaying ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      Generate Voice
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center"
                >
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 bg-gray-50 min-h-[400px] resize-none font-mono text-gray-800 leading-relaxed text-sm"
                value={generatedText}
                readOnly
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/50 backdrop-blur px-2 py-1 rounded">
                AI Generated Content
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};