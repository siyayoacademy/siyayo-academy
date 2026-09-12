const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const interpreter=fs.readFileSync('js/xespirito-evidence-interpreter.js','utf8');
const bridge=fs.readFileSync('js/verb-explorer-xespirito-evidence-bridge.js','utf8');
const sandbox={SIYAYOXespiritoBridge:{getRepairTrace:()=>[
 {status:'conflict',responsiblePiece:'auxiliary-have'},
 {status:'conflict',responsiblePiece:'auxiliary-have'}
]}};
vm.createContext(sandbox);
vm.runInContext(interpreter,sandbox);
vm.runInContext(bridge,sandbox);
const result=sandbox.SIYAYOVerbExplorerXespiritoEvidenceBridge.interpret();
assert.equal(result.signals[0].occurrences,2);
assert.equal(result.signals[0].status,'requires-reinforcement');
console.log('Verb Explorer Xespirito evidence bridge: PASS');
