window.AudioFX = (() => {
 let ambienceOn=false, fxOn=true, voiceOn=true, lang="ko-KR", ctx=null, nodes=[];
 const getCtx=()=>{ctx ||= new (window.AudioContext||window.webkitAudioContext)(); if(ctx.state==="suspended")ctx.resume(); return ctx;};
 function chirp(freq=900,dur=.12,vol=.018){if(!fxOn)return;try{const c=getCtx(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(freq,c.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.72,c.currentTime+dur);g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur)}catch(e){}}
 function stopAmbience(){nodes.forEach(n=>{try{n.stop?.();n.disconnect?.()}catch(e){}});nodes=[]}
 function startAmbience(){if(!ambienceOn)return;try{const c=getCtx();const buffer=c.createBuffer(1,c.sampleRate*3,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.15;const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();src.buffer=buffer;src.loop=true;filter.type="lowpass";filter.frequency.value=850;gain.gain.value=.045;src.connect(filter);filter.connect(gain);gain.connect(c.destination);src.start();nodes=[src,filter,gain]; // gentle wind-like ambience
 const osc=c.createOscillator(),og=c.createGain();osc.type="sine";osc.frequency.value=110;og.gain.value=.008;osc.connect(og);og.connect(c.destination);osc.start();nodes.push(osc,og);
 }catch(e){}}
 function setAmbience(v){ambienceOn=v;stopAmbience();if(v)startAmbience()}
 function fx(kind="tap"){if(!fxOn)return;if(kind==="success"){[523,659,784].forEach((f,i)=>setTimeout(()=>chirp(f,.22,.03),i*130))}else if(kind==="choice"){chirp(680,.09,.025);setTimeout(()=>chirp(880,.1,.02),80)}else if(kind==="step"){chirp(260,.06,.012)}else chirp(720,.08,.018)}
 function speak(text){if(!voiceOn||!window.speechSynthesis)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=.92;u.pitch=1.02;speechSynthesis.speak(u)}catch(e){}}
 function setVoice(v){voiceOn=v;if(!v&&window.speechSynthesis)speechSynthesis.cancel()}
 function setLang(v){lang=v}
 return {fx,speak,setAmbience,setVoice,setLang,get ambienceOn(){return ambienceOn},get fxOn(){return fxOn},set fxOn(v){fxOn=v},get voiceOn(){return voiceOn}};
})();