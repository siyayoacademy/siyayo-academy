from pathlib import Path
import json
r=Path(__file__).resolve().parents[1];o=r/'master-vip/data';c=json.loads((o/'catalog.json').read_text());p=json.loads((o/'coverage-report.json').read_text());maps=[json.loads((r/'master-vip'/ch['source_map']).read_text()) for ch in c['chapters'] if ch.get('source_map')];ps={p['source_id']:p for m in maps for p in m['paragraphs']};ids={i for u in c['units'] if u['source_layer']=='ORIGINAL' for i in u['provenance']['paragraph_ids']};text=[ps[i] for i in ids if i in ps and ps[i]['text'].strip()];p['catalog_version']=c['version'];p['units']=len(c['units'])
for key,n in [('text_characters',sum(len(x['text']) for x in text)),('text_paragraphs',len(text)),('classified_xml_paragraphs',len(ps)),('source_tables',len({t['id'] for m in maps for t in m['tables']}))]:
 field='mapped' if key=='classified_xml_paragraphs' else 'integrated';p[key][field]=n;p[key]['percent']=100*n/p[key]['total']
p['raster_unique_files']['preserved']=len({u['asset']['sha256'] for u in c['units'] if u.get('asset',{}).get('origin')=='MASTER_ORIGINAL'})
for ch in p['chapters']:
 linked={i for u in c['units'] if u['chapter_id']==ch['id'] and u['source_layer']=='ORIGINAL' for i in u['provenance']['paragraph_ids']};ch['linked_text_paragraphs']=sum(i in ps and bool(ps[i]['text'].strip()) for i in linked)
(o/'coverage-report.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n');print(p['text_characters'],p['text_paragraphs'],p['raster_unique_files'])
