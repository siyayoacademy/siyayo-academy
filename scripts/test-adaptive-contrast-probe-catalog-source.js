const assert=require('node:assert/strict');
require('../js/adaptive-contrast-probe-catalog-source.js');
const Source=globalThis.AdaptiveContrastProbeCatalogSource;

const valid={
  version:'0.1.0',
  items:[{
    patternKey:'pt:exquisito:cross-language-transfer:es',
    expectedLanguage:'pt',
    targetMeaning:'strange-or-odd',
    alternatives:[
      {id:'pt-esquisito',language:'pt',form:'esquisito',meaning:'strange-or-odd'},
      {id:'es-exquisito',language:'es',form:'exquisito',meaning:'excellent-refined-or-delicious'}
    ]
  }]
};

assert.equal(Source.validate(null),null);
assert.equal(Source.validate({version:'0.1.0',items:[]}),null);
assert.equal(Source.validate({version:'0.1.0',items:[{...valid.items[0],patternKey:''}]}),null);
assert.equal(Source.validate({version:'0.1.0',items:[valid.items[0],valid.items[0]]}),null);
assert.equal(Source.validate({version:'0.1.0',items:[{...valid.items[0],alternatives:[valid.items[0].alternatives[0],valid.items[0].alternatives[0]]}]}),null);
assert.equal(Source.validate(valid),valid);

(async()=>{
  Source.clear();
  assert.equal(Source.getCatalog(),null);
  assert.equal(await Source.load({fetch:null}),null);

  Source.clear();
  assert.equal(await Source.load({fetch:async()=>({ok:false,json:async()=>valid})}),null);
  assert.equal(Source.getCatalog(),null);

  Source.clear();
  assert.equal(await Source.load({fetch:async()=>({ok:true,json:async()=>({version:'0.1.0',items:[]})})}),null);
  assert.equal(Source.getCatalog(),null);

  Source.clear();
  const loaded=await Source.load({fetch:async url=>{
    assert.equal(url,Source.DEFAULT_URL);
    return {ok:true,json:async()=>valid};
  }});
  assert.equal(loaded,valid);
  assert.equal(Source.getCatalog(),valid);

  console.log('Adaptive contrast probe catalog source: PASS — canonical catalog loads explicitly and failures preserve WAIT.');
})().catch(error=>{console.error(error);process.exitCode=1;});
