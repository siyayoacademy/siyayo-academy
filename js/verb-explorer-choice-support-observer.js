// Read-only observer for the real Verb Explorer choice-audio boundary.
// It records support only for the grounded E/L/Q/C snapshot captured at the click.
(function(root){
'use strict';
var installed=false;
function install(options){
 options=options||{};
 if(installed||typeof document==='undefined')return false;
 installed=true;
 document.addEventListener('click',function(event){
  var target=event.target&&typeof event.target.closest==='function'
   ? event.target.closest('[data-choice-audio]')
   : null;
  if(!target)return;
  var bridge=options.stateBridge||root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var sensor=options.sensor||root.SIYAYOChoiceSupportSensor;
  if(!bridge||typeof bridge.capture!=='function'||!sensor||typeof sensor.observe!=='function')return;
  var context=bridge.capture();
  if(!context)return;
  var value=sensor.observe({type:'choice-audio',context:context});
  if(typeof options.onObserved==='function')options.onObserved(Object.freeze({value:value,context:context}),target);
 },true);
 return true;
}
root.SIYAYOVerbExplorerChoiceSupportObserver=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
