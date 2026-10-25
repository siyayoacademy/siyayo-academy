#!/usr/bin/env node
// SIYAYO XPR-01: offline structural validation. No network calls, writes, deployment, or remote assertions.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'docs','siyayo-cross-project-registry.json');
const r=JSON.parse(fs.readFileSync(file,'utf8'));
function assert(ok,message){if(!ok)throw new Error('XPR-01 INVALID: '+message);}
assert(r.id==='SIYAYO-XPR-01-CROSS-PROJECT-REGISTRY','registry ID');
assert(r.status==='STATIC_DOCUMENTARY_SNAPSHOT_NO_AUTOMATIC_SYNCHRONIZATION','status');
assert(Array.isArray(r.projects)&&r.projects.length===2,'projects');
assert(r.projects.some(p=>p.id==='SIA'&&p.module_inventory_count===18),'SIA inventory');
assert(r.projects.some(p=>p.id==='MCE'&&p.module_inventory_count===21),'MCE inventory');
const projects=new Map(r.projects.map(p=>[p.id,p]));
assert(projects.size===2,'duplicate projects');
const ids=new Set();
for(const item of r.entries){
 assert(projects.has(item.project_id),'unknown owner '+item.id);
 assert(item.id===item.project_id+':'+item.local_code,'qualified ID '+item.id);
 assert(!ids.has(item.id),'duplicate module '+item.id);
 assert(typeof item.implementation_status==='string'&&item.implementation_status.length>0,'missing implementation status');
 assert(item.portable_by_default===false,'no default portability');
 ids.add(item.id);
}
assert(ids.size===39,'39 unique catalog entries');
for(const p of r.projects){
 assert([...ids].filter(id=>id.startsWith(p.id+':')).length===p.module_inventory_count,'module total for '+p.id);
 assert(p.registry_commit.match(/^[0-9a-f]{40}$/),'snapshot commit for '+p.id);
 for(const code of ['REG-01','REG-02','REG-03'])assert(Array.isArray(p.registries[code])&&p.registries[code].length===2,'required docs '+p.id+' '+code);
}
const links=new Set();
for(const link of r.cross_project_links){
 assert(!links.has(link.id),'duplicate bridge id '+link.id);
 links.add(link.id);
 assert(ids.has(link.from)&&ids.has(link.to),'broken bridge '+link.id);
 assert(link.from.split(':')[0]!==link.to.split(':')[0],'bridge must cross projects');
 assert(typeof link.type==='string'&&Array.isArray(link.tests)&&link.tests.length,'bridge provenance/test '+link.id);
}
const responsive=r.cross_project_links.find(x=>x.id==='XPR-LINK-01');
assert(responsive&&responsive.from==='SIA:RS-01'&&responsive.to==='MCE:MCE-RS-01','RS-01 mapping');
assert(responsive.differences.some(x=>x.field==='event'),'responsive event differs');
assert(responsive.differences.some(x=>x.field==='localStorage'),'responsive persistence differs');
for(const k of ['academyResponsiveJS','academyResponsiveCSS','mceResponsiveJS','mceResponsiveCSS']){
 assert(/^[0-9a-f]{40}$/.test(r.provenance[k]),'verified blob SHA '+k);
}
assert(r.provenance.academyResponsiveJS!==r.provenance.mceResponsiveJS,'JS implementation not identical');
assert(r.provenance.academyResponsiveCSS!==r.provenance.mceResponsiveCSS,'CSS implementation not identical');
assert(r.known_discrepancies.some(x=>x.id==='XPR-GAP-01'&&x.status==='JSON_NOT_FETCHED_BY_RENDERER'),'MCE hymn JSON renderer boundary');
assert(r.protected_exclusions.some(x=>x.project==='MCE'&&x.not_import_from_SIA.includes('EVAL-08')),'no cross-project evidence/assessment copying');
console.log('XPR-01 snapshot PASS: '+ids.size+' qualified modules, '+links.size+' cross-project links, '+r.projects.length+' independent projects; no network or production writes.');
