// Read-only target presentation. Targets come from the active corpus label;
// no translation, routing, evaluation, Evidence, or mastery inference.
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SIYAYOStudyTargetPresentation=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function escape(value){return String(value==null?'':value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function highlight(value,target){
 var text=String(value==null?'':value);
 if(typeof target!=='string'||!target.trim())return escape(text);
 var literal=target.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 // Use Unicode boundaries so a target never colors a substring inside another word.
 var expression=new RegExp('(^|[^\\p{L}\\p{N}\\p{M}_])('+literal+')(?=$|[^\\p{L}\\p{N}\\p{M}_])','giu');
 var out='',last=0;
 for(var match of text.matchAll(expression)){
  var start=match.index+match[1].length;
  out+=escape(text.slice(last,start))+'<strong class="study-target-word">'+escape(match[2])+'</strong>';
  last=start+match[2].length;
 }
 return out+escape(text.slice(last));
}
return Object.freeze({highlight:highlight});
});
