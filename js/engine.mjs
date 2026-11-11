import { shuffle } from './content.mjs';

export const difficulties = { easy: 10, medium: 15, hard: 25 };
export const speedrunTime = count => count * 30_000;

export function createRound(game, options, now = performance.now(), random = Math.random) {
  const count = difficulties[options.difficulty];
  if (!count || game.questions.length < count) throw new Error('Quantidade de questões indisponível.');
  const questions = shuffle(game.questions, random).slice(0, count).map(question => ({
    ...question, options: question.options && shuffle(question.options, random)
  }));
  return {
    game, options, questions, started: now, questionStarted: now, index: 0,
    deadline: options.speedrun ? now + speedrunTime(count) : Infinity,
    attempts: 0, score: 0, records: [], answers: [], stage: 'answer'
  };
}

function normalize(value) {
  return String(value).trim().normalize('NFC').toLocaleLowerCase('pt-BR');
}

export function submit(round, answer) {
  if (round.stage !== 'answer' || !String(answer).trim()) return null;
  const question = round.questions[round.index];
  round.attempts++;
  round.answers.push(String(answer).trim());
  const correct = normalize(answer) === normalize(question.answer);
  if (!correct && round.attempts === 1) return { correct, retry: true };
  const points = correct ? (round.attempts === 1 ? 10 : 5) : 0;
  round.score += points;
  round.stage = 'feedback';
  round.records.push({question, correct, points, answers: [...round.answers]});
  return {correct, points};
}

export function next(round, now = performance.now()) {
  if (round.stage !== 'feedback') return false;
  if (round.index + 1 >= round.questions.length || now >= round.deadline) {
    finish(round, now);
    return false;
  }
  round.index++;
  round.questionStarted = now;
  round.attempts = 0;
  round.answers = [];
  round.stage = 'answer';
  return true;
}

export function finish(round, now = performance.now()) {
  if (round.stage === 'finished') return;
  for (const question of round.questions.slice(round.records.length)) {
    round.records.push({question, correct: false, points: 0, answers: question === round.questions[round.index] ? [...round.answers] : []});
  }
  round.stage = 'finished';
  round.ended = Math.min(now, round.deadline);
}

export function award(score, count) {
  const percentage = score / (count * 10);
  if (percentage >= .8) return 'Dourada';
  if (percentage >= .5) return 'Vermelha';
  return 'Verde';
}

