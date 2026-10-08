// Human Semantic Surface Lab fixture only.
// Mirrors the canonical Verb Explorer bootstrap by instantiating the shared
// Choice Support Sensor factory into one runtime sensor.
// No support observation is invented here; the initial contextual value remains "none".
(function(root){
'use strict';

var sensorApi=root.SIYAYOChoiceSupportSensor;
if(!sensorApi||typeof sensorApi.create!=='function')return;

root.SIYAYOChoiceSupportSensor=sensorApi.create();
})(typeof globalThis!=='undefined'?globalThis:this);
