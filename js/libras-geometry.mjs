/** Comparador geométrico leve: não é modelo treinado nem tradução de Libras validada. */
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const TIPS=[4,8,12,16,20], PIPS=[3,6,10,14,18];
export function extractFeatures(l) {
  if (!Array.isArray(l) || l.length!==21) return null;
  const palm=Math.max(dist(l[0],l[9]),1e-4);
  const extension=TIPS.map((tip,i)=>{
    const reference=i===0?17:0;
    const joint=PIPS[i];
    const ratio=dist(l[tip],l[reference])/Math.max(dist(l[joint],l[reference]),1e-4);
    // Transição suave entre dedo dobrado e estendido.
    return Math.max(0,Math.min(1,(ratio-1.02)/0.24));
  });
  const tipCluster=(dist(l[8],l[12])+dist(l[12],l[16])+dist(l[16],l[20]))/3/palm;
  // A curvatura e a orientação relativa permitem separar parcialmente configurações próximas.
  const curl=[8,12,16,20].reduce((sum,tip,i)=>{
    const mcp=[5,9,13,17][i], pip=[6,10,14,18][i];
    return sum+Math.max(0,Math.min(1,1-dist(l[tip],l[mcp])/Math.max(dist(l[pip],l[mcp])*1.8,1e-4)));
  },0)/4;
  // Cruzamento aproximado em coordenadas normalizadas: sinal da posição relativa das pontas.
  const cross=((l[8].x-l[12].x)*(l[5].x-l[9].x))<0;
  return {extension,spread:dist(l[8],l[20])/palm,thumbIndex:dist(l[4],l[8])/palm,indexMiddle:dist(l[8],l[12])/palm,tipCluster,curl,cross};
}
export function rankLetters(features,config) {
  if (!features || !config?.letters) return [];
  return config.letters.map(rule=>{
    const fingerSimilarity=rule.fingers.reduce((sum,expected,i)=>sum+(expected?features.extension[i]:1-features.extension[i]),0)/5;
    const requirements=[['minSpread','spread'],['minThumbIndex','thumbIndex'],['minIndexMiddle','indexMiddle'],['minTipCluster','tipCluster'],['minCurl','curl']];
    const maxima=[['maxSpread','spread'],['maxThumbIndex','thumbIndex'],['maxIndexMiddle','indexMiddle'],['maxTipCluster','tipCluster'],['maxCurl','curl']];
    let penalty=0;
    for(const [ruleKey,featureKey] of requirements) {
      if(rule[ruleKey]!==undefined && features[featureKey]<rule[ruleKey]) penalty+=Math.min(0.45,(rule[ruleKey]-features[featureKey])*0.65);
    }
    for(const [ruleKey,featureKey] of maxima) {
      if(rule[ruleKey]!==undefined && features[featureKey]>rule[ruleKey]) penalty+=Math.min(0.55,(features[featureKey]-rule[ruleKey])*0.75);
    }
    if(rule.crossed===true && !features.cross) penalty+=0.55;
    return {letter:rule.letter,score:Math.max(0,Math.min(1,fingerSimilarity-penalty))};
  }).sort((a,b)=>b.score-a.score);
}
export function classifyLandmarks(l,config) {
  const ranked=rankLetters(extractFeatures(l),config);
  const best=ranked[0],runnerUp=ranked[1];
  const margin=best ? best.score-(runnerUp?.score??0):0;
  const accepted=!!best && best.score>=(config.threshold??0.88) && margin>=(config.minimumMargin??0.1);
  return {letter:accepted?best.letter:null,score:best?.score??0,margin,ranked,accepted};
}
