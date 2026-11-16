import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, AlertCircle, ArrowUp } from 'lucide-react';

export function VoiceModal({ isOpen, onClose, onSendMessage, isAssistantResponding, lastAssistantMessage }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Голосовой ввод не поддерживается вашим браузером. Рекомендуется использовать Chrome, Edge или Safari.');
    }
  }, []);

  // Handle Speech Recognition setup
  useEffect(() => {
    if (!isOpen || !isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (currentFinal) {
        setTranscript((prev) => (prev ? `${prev} ${currentFinal}` : currentFinal));
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      console.warn('[Voice] Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Доступ к микрофону заблокирован. Разрешите использование микрофона в настройках браузера.');
        setIsListening(false);
      } else if (event.error !== 'no-speech') {
        setError(`Ошибка распознавания: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Auto-start listening on open
    try {
      recognition.start();
    } catch (e) {}

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsSpeaking(false);
    };
  }, [isOpen, isSupported]);

  // Read aloud new assistant messages if not muted
  useEffect(() => {
    if (lastAssistantMessage && isOpen && !isMuted && synthRef.current) {
      synthRef.current.cancel();
      const cleanText = lastAssistantMessage.replace(/[*#_`~[\]]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ru-RU';
      utterance.rate = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  }, [lastAssistantMessage, isOpen, isMuted]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {}
    }
  };

  const handleSend = () => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText) return;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    onSendMessage(fullText);
    setTranscript('');
    setInterimTranscript('');
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-base text-neutral-100">Режим Jarvis — Голосовой ассистент</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pulse Wave */}
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-emerald-500/10 animate-ping duration-1000" />
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-pulse duration-700" />
              </>
            )}
            {isSpeaking && (
              <div className="absolute w-28 h-28 rounded-full bg-indigo-500/20 animate-pulse duration-500" />
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-xl ${
                isListening
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/25 ring-4 ring-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          <p className="mt-5 text-sm font-medium text-neutral-400">
            {isSpeaking
              ? 'Kortex отвечает голосом...'
              : isAssistantResponding
              ? 'Kortex обрабатывает запрос...'
              : isListening
              ? 'Слушаю вас... Говорите естественно'
              : 'Микрофон отключен. Нажмите, чтобы начать говорить'}
          </p>
        </div>

        {/* Live Transcript Display */}
        <div className="min-h-[90px] max-h-36 overflow-y-auto p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-sm">
          {transcript || interimTranscript ? (
            <p className="text-neutral-200 leading-relaxed">
              {transcript} <span className="text-neutral-400 italic">{interimTranscript}</span>
            </p>
          ) : (
            <p className="text-neutral-400 italic text-center py-4">
              Скажите, например: «Какие у меня задачи на сегодня?» или «Создай заметку по проекту»
            </p>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Controls */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-neutral-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 text-xs flex items-center gap-1.5 transition"
              title={isMuted ? 'Включить озвучивание' : 'Отключить звук'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Без звука' : 'Голос включен'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTranscript('');
                setInterimTranscript('');
              }}
              className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 text-xs hover:bg-neutral-800 transition"
            >
              Очистить
            </button>
            <button
              onClick={handleSend}
              disabled={!transcript.trim() && !interimTranscript.trim()}
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-900 font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed shadow"
            >
              <span>Отправить</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
