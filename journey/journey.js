(() => {
  "use strict";

  const stage=document.getElementById("journeyStage");
  const scene=document.getElementById("journeyScene");
  const sceneId=document.getElementById("sceneId");
  const sceneTitle=document.getElementById("sceneTitle");
  const sceneHint=document.getElementById("sceneHint");
  const progress=document.getElementById("journeyProgress");
  const back=document.getElementById("journeyBack");
  const next=document.getElementById("journeyNext");
  const portalSurface=document.getElementById("portalSurface");
  const morphologyPortal=document.getElementById("morphologyPortal");

  const scenes=[
    {id:"W0",title:"Celestial Iris",hint:"Swipe or use Next to begin the Journey."},
    {id:"W1",title:"Golden Eagle",hint:"The celestial guardian reveals the golden branch."},
    {id:"W2",title:"Golden Seed",hint:"The seed waits for your gesture."},
    {id:"W3",title:"Seed Fall",hint:"The seed begins its descent toward Frondosa."},
    {id:"W4",title:"Frondosa",hint:"Branches, leaves and portals become perceptible."},
    {id:"W5",title:"Inside the Trunk",hint:"The seed continues through the inner structure."},
    {id:"W6",title:"Roots and Ground",hint:"The Journey approaches the ground plane."},
    {id:"W7",title:"Jaguar Footprint",hint:"The next trace appears in the learner’s path."},
    {id:"W8",title:"Patita · DNA Recognition",hint:"WAIT! A new golden seed has been found."}
  ];

  let index=0;
  let pointerStart=null;

  function render(reason="bootstrap"){
    const current=scenes[index];
    stage.dataset.scene=current.id;
    sceneId.textContent=current.id;
    sceneTitle.textContent=current.title;
    sceneHint.textContent=current.hint;
    progress.textContent=(index+1)+" / "+scenes.length;
    back.disabled=index===0;
    next.disabled=index===scenes.length-1;
    portalSurface.hidden=current.id!=="W4";

    window.dispatchEvent(new CustomEvent("siyayo:journey-scene-changed",{
      detail:{
        sceneId:current.id,
        index,
        reason,
        evaluated:false,
        evidenceProduced:false,
        green:false
      }
    }));
  }

  function move(delta,reason){
    const target=Math.max(0,Math.min(scenes.length-1,index+delta));
    if(target===index) return;
    index=target;
    render(reason);
  }

  back.addEventListener("click",()=>move(-1,"back-control"));
  next.addEventListener("click",()=>move(1,"next-control"));

  scene.addEventListener("pointerdown",event=>{
    pointerStart={x:event.clientX,y:event.clientY};
  });
  scene.addEventListener("pointerup",event=>{
    if(!pointerStart) return;
    const dx=event.clientX-pointerStart.x;
    const dy=event.clientY-pointerStart.y;
    pointerStart=null;
    if(Math.abs(dx)<48 || Math.abs(dx)<Math.abs(dy)) return;
    move(dx<0?1:-1,"swipe");
  });

  scene.addEventListener("keydown",event=>{
    if(event.key==="ArrowRight"){ event.preventDefault(); move(1,"keyboard"); }
    if(event.key==="ArrowLeft"){ event.preventDefault(); move(-1,"keyboard"); }
  });

  morphologyPortal.addEventListener("click",()=>{
    window.dispatchEvent(new CustomEvent("siyayo:journey-portal-request",{
      detail:{
        portalId:"explore-morphology",
        originScene:"W4",
        destinationSurface:"piano-stage",
        capability:{collection:"verbs",activity:"morphology"},
        navigationAuthority:"external-approved-receiver-required",
        evaluated:false,
        evidenceProduced:false,
        green:false
      }
    }));
    sceneHint.textContent="Explore Morphology mapped · awaiting approved navigation receiver.";
  });

  render();
})();
