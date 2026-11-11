/**
 * Módulo de Reconhecimento de Voz para o Além de um Clique
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export class VoiceController {
  constructor(onAnswerCallback) {
    this.onAnswerCallback = onAnswerCallback;
    this.recognition = null;
    this.isListening = false;
    this.init();
  }

  init() {
    if (!SpeechRecognition) {
      console.warn('Reconhecimento de voz não é suportado neste navegador.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
      console.log('Voz capturada:', transcript);
      this.processSpeech(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {}
      }
    };
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  processSpeech(text) {
    // Mapeia comandos numéricos ou por palavra
    if (text.includes('opção 1') || text.includes('opção a') || text.includes('número 1') || text === 'um' || text === '1' || text.includes('primeira')) {
      this.onAnswerCallback(0);
    } else if (text.includes('opção 2') || text.includes('opção b') || text.includes('número 2') || text === 'dois' || text === '2' || text.includes('segunda')) {
      this.onAnswerCallback(1);
    } else if (text.includes('opção 3') || text.includes('opção c') || text.includes('número 3') || text === 'três' || text === '3' || text.includes('terceira')) {
      this.onAnswerCallback(2);
    } else if (text.includes('opção 4') || text.includes('opção d') || text.includes('número 4') || text === 'quatro' || text === '4' || text.includes('quarta')) {
      this.onAnswerCallback(3);
    } else if (text.includes('confirmar') || text.includes('responder') || text.includes('próximo') || text.includes('avançar')) {
      this.onAnswerCallback('submit');
    }
  }
}
