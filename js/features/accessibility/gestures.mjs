import { classifyLandmarks } from './libras-geometry.mjs';
/** Rastreamento de gestos por MediaPipe Tasks Vision, executado inteiramente no navegador. */
const VERSION = '0.10.14';
const CDNS = [
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/+esm`,
  `https://esm.sh/@mediapipe/tasks-vision@${VERSION}`
];
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const LINKS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const TIPS = [4,8,12,16,20], PIPS = [3,6,10,14,18];
const distance = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);

export class GestureController {
  constructor(videoElement, canvasElement, onGestureCallback, onStatusUpdate, onPendingGesture) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onGestureCallback = onGestureCallback;
    this.onStatusUpdate = onStatusUpdate;
    this.onPendingGesture = onPendingGesture;
    this.landmarker = null;
    this.stream = null;
    this.isRunning = false;
    this.raf = 0;
    this.lastVideoTime = -1;
    this.lastDetectedCount = -1;
    this.stableCount = 0;
    this.holdMs = 1500;
    this.mode = "choices";
    this.candidateSince = 0;
    this.lockedGesture = null;
    this.releaseSince = 0;
    this.triggered = false;
    this.starting = false;
    this.generation = 0;
    this.librasRules = null;
    this.lastLetterAnalysis = null;
    this.motionSamples = [];
    this.motionCandidate = null;
    this.motionCandidateUntil = 0;
  }

  async init() {
    if (this.landmarker) return;
    let module, lastError;
    for (const url of CDNS) {
      try {
        module = await import(url);
        if (module.HandLandmarker && module.FilesetResolver) break;
        throw new Error('Biblioteca incompleta');
      } catch (error) { lastError = error; module = null; }
    }
    if (!module) throw new Error('Falha ao baixar o MediaPipe: ' + (lastError?.message || 'CDN indisponível'));
    const vision = await module.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`);
    const options = {baseOptions:{modelAssetPath:MODEL,delegate:'GPU'},runningMode:'VIDEO',numHands:1};
    try { this.landmarker = await module.HandLandmarker.createFromOptions(vision, options); }
    catch (error) {
      options.baseOptions.delegate = 'CPU';
      this.landmarker = await module.HandLandmarker.createFromOptions(vision, options);
    }
  }

  async start() {
    if (this.isRunning || this.starting) return;
    this.starting = true;
    const generation = ++this.generation;
    this.onStatusUpdate?.('Carregando rastreamento da mão…');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Câmera indisponível. Acesse por HTTPS ou localhost.');
      await this.init();
      if (this.mode === 'letters' && !this.librasRules) {
        const response = await fetch(new URL('./libras-rules.json', import.meta.url));
        if (!response.ok) throw new Error('Não foi possível carregar as regras de Libras');
        this.librasRules = await response.json();
      }
      if (generation !== this.generation) return;
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
      if (generation !== this.generation) { stream.getTracks().forEach(t=>t.stop()); return; }
      this.stream = stream;
      this.videoElement.srcObject = stream;
      this.videoElement.muted = true;
      this.videoElement.style.display = 'block';
      await this.videoElement.play();
      if (generation !== this.generation) { this.stop(); return; }
      this.isRunning = true;
      this.lastVideoTime = -1;
      this.onStatusUpdate?.(this.mode === 'letters' ? 'Alfabeto experimental A–Z; J/Z usam movimento. Mantenha o gesto por 1,5 s.' : 'Mostre de 1 a 4 dedos');
      this.frame();
    } catch (error) {
      console.error('Falha no rastreamento de gestos:', error);
      this.onStatusUpdate?.('Erro na câmera: ' + error.message);
      this.stream?.getTracks().forEach(t=>t.stop());
      this.stream = null;
      this.videoElement.srcObject = null;
      throw error;
    } finally { this.starting = false; }
  }

  stop() {
    ++this.generation;
    this.isRunning = false;
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach(t=>t.stop());
    this.stream = null;
    if (this.videoElement) { this.videoElement.pause(); this.videoElement.srcObject = null; }
    this.canvasElement?.getContext('2d')?.clearRect(0,0,this.canvasElement.width,this.canvasElement.height);
    this.reset();
  }

  reset() {
    this.lastDetectedCount = null;
    this.motionSamples = [];
    this.motionCandidate = null;
    this.motionCandidateUntil = 0;
    this.candidateSince = 0;
    this.lockedGesture = null;
    this.releaseSince = 0;
    this.onPendingGesture?.(null,0);
  }

  setMode(mode) {
    if (this.mode !== mode) { this.mode = mode; this.reset(); }
  }

  // Classificação por similaridade; percentuais NÃO representam probabilidades calibradas.
  classifyLetter(l) {
    const now = performance.now();
    const staticResult = classifyLandmarks(l,this.librasRules);
    this.lastLetterAnalysis = staticResult;
    // Reconhecimento de trajetória experimental; o desenho da letra exige deslocamento.
    const finger = this.fingerStates(l);
    const palm = Math.max(distance(l[0],l[9]),0.001);
    const indexOnly = finger[1] && !finger[2] && !finger[3] && !finger[4];
    const pinkyOnly = finger[4] && !finger[1] && !finger[2] && !finger[3];
    const kind = indexOnly ? 'Z' : pinkyOnly ? 'J' : null;
    if (!kind) this.motionSamples = [];
    else {
      if (this.motionSamples.length && this.motionSamples[0].kind !== kind) this.motionSamples = [];
      const tip = kind === 'Z' ? l[8] : l[20];
      this.motionSamples.push({x:(tip.x-l[0].x)/palm,y:(tip.y-l[0].y)/palm,t:now,kind});
      this.motionSamples = this.motionSamples.filter(v=>now-v.t<1700).slice(-50);
      const trace = this.motionSamples;
      if (trace.length >= 9 && now-trace[0].t > 420) {
        const x = trace.map(v=>v.x), y=trace.map(v=>v.y);
        const width=Math.max(...x)-Math.min(...x),height=Math.max(...y)-Math.min(...y);
        const a=trace[0],mid=trace[Math.floor(trace.length/2)],b=trace[trace.length-1];
        const zShape=width>0.7 && height>0.2 && (mid.x-a.x)*(b.x-mid.x)<0 && Math.abs(b.y-a.y)>0.15;
        const jShape=height>0.65 && width>0.22 && Math.abs(b.x-a.x)>0.15 && (mid.y-a.y)>0.2;
        if ((kind==='Z' && zShape) || (kind==='J' && jShape)) {
          this.motionCandidate=kind;
          this.motionCandidateUntil=now+2300;
          this.motionSamples=[];
        }
      }
    }
    if (this.motionCandidate && now<this.motionCandidateUntil) {
      this.lastLetterAnalysis={letter:this.motionCandidate,score:0,margin:0,accepted:true,dynamic:true};
      return this.motionCandidate;
    }
    this.motionCandidate=null;
    return staticResult.letter;
  }

  fingerStates(l) {
    return TIPS.map((tip,i)=>i===0
      ? distance(l[4],l[17]) > distance(l[3],l[17])*1.12
      : distance(l[tip],l[0]) > distance(l[PIPS[i]],l[0])*1.13);
  }

  frame() {
    if (!this.isRunning) return;
    try {
      const video = this.videoElement;
      if (video.readyState >= 2 && video.currentTime !== this.lastVideoTime) {
        const result = this.landmarker.detectForVideo(video,performance.now());
        this.lastVideoTime = video.currentTime;
        this.draw(result);
        const landmarks = result.landmarks?.[0];
        const now = performance.now();
        const gesture = landmarks ? (this.mode === 'letters'
          ? this.classifyLetter(landmarks)
          : this.fingerStates(landmarks).filter(Boolean).length) : null;
        const valid = this.mode === 'letters' ? !!gesture : gesture >= 1 && gesture <= 4;
        if (!valid) {
          if (!this.releaseSince) this.releaseSince = now;
          if (now - this.releaseSince >= 350) {
            this.lastDetectedCount = null;
            this.candidateSince = 0;
            this.lockedGesture = null;
          }
          this.onPendingGesture?.(null,0);
          this.onStatusUpdate?.(this.mode === 'letters' ? (this.lastLetterAnalysis?.score ? `Sinal incerto (${Math.round(this.lastLetterAnalysis.score*100)}% de similaridade) — ajuste a mão` : 'Sinal não identificado — ajuste a mão') : 'Mostre de 1 a 4 dedos');
        } else {
          this.releaseSince = 0;
          if (gesture !== this.lastDetectedCount) {
            this.lastDetectedCount = gesture;
            this.candidateSince = now;
          }
          const progress = Math.min(1,(now-this.candidateSince)/this.holdMs);
          const locked = gesture === this.lockedGesture;
          this.onPendingGesture?.(gesture, locked ? 1 : progress, locked);
          if (progress >= 1 && !locked) {
            this.lockedGesture = gesture;
            this.onGestureCallback?.(gesture);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar gesto:',error);
      this.onStatusUpdate?.('Erro no rastreamento: '+error.message);
      this.stop();
      return;
    }
    this.raf = requestAnimationFrame(()=>this.frame());
  }

  draw(result) {
    const canvas = this.canvasElement, video = this.videoElement;
    if (!canvas || !video.videoWidth) return;
    const w=video.videoWidth,h=video.videoHeight;
    if (canvas.width!==w || canvas.height!==h) {canvas.width=w;canvas.height=h;}
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,w,h);
    const l=result.landmarks?.[0];
    if (!l) return;
    ctx.strokeStyle='#50f0bc';ctx.lineWidth=Math.max(2,w/220);
    for (const [a,b] of LINKS) {
      ctx.beginPath();ctx.moveTo(l[a].x*w,l[a].y*h);ctx.lineTo(l[b].x*w,l[b].y*h);ctx.stroke();
    }
    for (const [i,p] of l.entries()) {
      ctx.beginPath();ctx.arc(p.x*w,p.y*h,i===0?5:3,0,Math.PI*2);
      ctx.fillStyle=i===0?'#ffffff':'#50f0bc';ctx.fill();
    }
  }
}
