/* SIYAYO SOUND-02: shared 12-TET A4=432 Hz tuning for both pianos.
   Full 22-note range is G3..E5 (MIDI 55..76). The Piano Plano UI
   currently exposes only C4..C5; this table does not add physical keys.
   Piano Plano voice: base*0.5; Pianinho right-hand voice: base*2.
   Preserve separate timbres, envelopes, and pedagogical contracts. */
(() => {
  "use strict";
  const A4_HZ=432;
  const midiFromNote=note=>{
    const m=/^([A-G])(#?)([3-5])$/.exec(note);
    if(!m)return null;
    const pitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]];
    return (Number(m[3])+1)*12+pitch+(m[2]?1:0);
  };
  const frequencyFromMidi=midi=>A4_HZ*Math.pow(2,(midi-69)/12);
  const names=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const notes=Object.freeze(Array.from({length:22},(_,i)=>{
    const midi=i+55;
    const note=names[midi%12]+(Math.floor(midi/12)-1);
    const frequency=frequencyFromMidi(midi);
    return Object.freeze({note,midi,frequency,pianoPlanoFundamental:frequency*.5,pianinhoFundamental:frequency*2});
  }));
  const byNote=new Map(notes.map(n=>[n.note,n]));
  const tuning=Object.freeze({A4_HZ,notes,frequencyFromMidi,midiFromNote,
    frequencyForNote:note=>byNote.get(note)?.frequency??null});
  if(notes.length!==22||Math.abs(tuning.frequencyForNote("A4")-432)>1e-9)
    throw Error("SOUND-02 tuning validation failed");
  window.SIYAYO_PIANO_TUNING=tuning;
})();
