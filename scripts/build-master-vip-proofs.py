"""Build A4 editorial proofs from the same catalog used by the web reader."""
from pathlib import Path
import json,hashlib,html
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.units import mm
from pypdf import PdfReader,PdfWriter
root=Path(__file__).resolve().parents[1];site=root/'master-vip';c=json.loads((site/'data/catalog.json').read_text());font=site/'assets/fonts'
for name,file in [('Body','NunitoSans-Regular.ttf'),('BodyBold','NunitoSans-Bold.ttf'),('BodyItalic','NunitoSans-Italic.ttf'),('Display','SIYAYODisplay-SemiBold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(font/file)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='BodyBold',italic='BodyItalic',boldItalic='BodyBold')
blue=colors.HexColor('#061b3d');gold=colors.HexColor('#8f6a1e');gray=colors.HexColor('#526071')
styles={
 'title':ParagraphStyle('title',fontName='Display',fontSize=23,leading=28,textColor=blue,spaceAfter=10),
 'h':ParagraphStyle('h',fontName='Display',fontSize=14,leading=18,textColor=blue,spaceBefore=8,spaceAfter=7),
 'sub':ParagraphStyle('sub',fontName='BodyBold',fontSize=9,leading=12,textColor=gold,spaceBefore=5,spaceAfter=4),
 'body':ParagraphStyle('body',fontName='Body',fontSize=10,leading=13.5,textColor=colors.HexColor('#182334'),spaceAfter=5),
 'small':ParagraphStyle('small',fontName='Body',fontSize=8,leading=10.3,textColor=gray,spaceAfter=5),
 'source':ParagraphStyle('source',fontName='BodyItalic',fontSize=8.4,leading=11,textColor=gray,spaceAfter=4),
}
def para(t,style='body'):return Paragraph(html.escape(t).replace('\n','<br/>'),styles[style])
def langs(texts,edition,targets=None):
 items=[]
 for lang in edition.split('-'):
  if not texts.get(lang):continue
  text=html.escape(texts[lang]);target=targets.get(lang) if targets else None
  if target:text=text.replace(html.escape(target),'<b>'+html.escape(target)+'</b>',1)
  items.append(Paragraph('<font color="#8f6a1e" size="8"><b>'+lang.upper()+'</b></font>  '+text,styles['body']))
 return items
by={u['id']:u for u in c['units']};model=by['MVP:UNIT:EXISTENCE:MODEL:001'];practice=by['MVP:UNIT:EXISTENCE:PRACTICE:001'];answer=by[practice['answer_key_id']];reviews=[u for u in c['units'] if u['type']=='EDITORIAL_COMPARISON']
outputs=[]
for edition in ['en-pt','en-es','en-es-pt']:
 path=site/'proofs'/('master-vip-existence-a4-'+edition+'.pdf');path.parent.mkdir(parents=True,exist_ok=True)
 def footer(cv,doc):
  cv.saveState();cv.setFillColor(gray);cv.setFont('Body',8);cv.drawString(22*mm,12*mm,'SIYAYO Academy | Master VIP | '+edition.upper());cv.drawRightString(A4[0]-16*mm,12*mm,f'{doc.page}');cv.restoreState()
 doc=SimpleDocTemplate(str(path),pagesize=A4,leftMargin=22*mm,rightMargin=16*mm,topMargin=17*mm,bottomMargin=20*mm,title='Master VIP Existence A4 '+edition,author='SIYAYO Academy',pageCompression=1)
 story=[para('MASTER VIP · THE TEN KINDS OF WORDS','sub'),para('Existence\nThere + To Be','title'),para('Prova editorial A4 | '+edition.upper()+' | versão '+c['version'],'small'),para('Para estudo e conferência. Conteúdo proposto e impressão aguardam homologação. Esta prova reúne o piloto e seis revisões; não reproduz todo o capítulo original.','small'),para('PRESENT · AFFIRMATIVE','h')]
 for ex in model['examples']:
  story+=langs(ex['text'],edition,ex['targets']);story.append(Spacer(1,3*mm))
 story.append(para('Uma estrutura, três modos','h'))
 rows=[[para('MODE','sub'),para('SINGULAR','sub'),para('PLURAL','sub')]]
 for label,a,b in [('AFFIRMATIVE','There is a tomato.','There are two tomatoes.'),('NEGATIVE','There is not a tomato.','There are not any tomatoes.'),('INTERROGATIVE','Is there a tomato?','Are there any tomatoes?')]:rows.append([para(label,'small'),para(a),para(b)])
 t=Table(rows,colWidths=[33*mm,65*mm,64*mm],hAlign='LEFT');t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.4,colors.HexColor('#c8ced6')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf1f6')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.append(t);story+= [Spacer(1,5*mm),para('Ponto de atenção','sub'),para('There is acompanha nome contável singular ou incontável. There are acompanha nome contável plural. Em espanhol, hay permanece igual; em português, há é impessoal.','body'),para('WORD TYPE: VERB → verbo → verbo. As funções gramaticais são analisadas no contexto.','small')]
 for start in [0,3]:
  story += [PageBreak(),para('Revisão editorial','title'),para(f'Pontos {start+1} a {start+3} | Original e proposta preservados separadamente','small')]
  for idx,u in enumerate(reviews[start:start+3],start+1):
   story.append(para(f'{idx:02}. '+u['title'],'h'));story.append(para('ORIGINAL','sub'))
   for line in u['original_lines']:story.append(para(line['text']+' ['+line['source_id']+']','source'))
   story.append(para('PROPOSTA PARA HOMOLOGAÇÃO','sub'));story+=langs(u['body'],edition);story.append(para(u['editorial_reason'],'small'));story.append(Spacer(1,2*mm))
 story += [PageBreak(),para('Prática contextual','title'),para('Observe, escolha e escreva','h')];story+=langs(practice['instructions'],edition)
 for i,prompt in enumerate(practice['prompts'],1):
  story.append(Spacer(1,5*mm));story.append(para(f'{i}. '+prompt));line=Table([['']],colWidths=[162*mm],rowHeights=[12*mm]);line.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#aab3bf'))]));story.append(line)
 story += [Spacer(1,10*mm),para('Amplie o contexto','h'),para('Descreva um objeto e uma quantidade que você encontra na sua cozinha. Depois, faça uma pergunta sobre essa quantidade.','body'),Spacer(1,14*mm),para('ID da atividade: '+practice['id'],'small')]
 story += [PageBreak(),para('Gabarito e conferência','title'),para('Respostas da prática','h')];story+=langs(answer['body'],edition);story +=[Spacer(1,7*mm),para('Critérios de revisão','h'),para('Confira singular, plural e contabilidade; sentido da pergunta; posição de is/are na interrogativa; naturalidade da tradução. Outras respostas exigem análise do contexto.','body'),para('A prática impressa não concede Green Pass. Qualquer avaliação depende de seu contrato específico.','small'),Spacer(1,7*mm),para('Rastreabilidade editorial','h'),para('Fonte: STRUCTURE-KIND OF WORDS.docx. Bloco EXISTENCE P11776–P12083. SHA256: '+c['source_sha256'],'small'),para('As seis propostas são SIYAYO_ADAPTATION. O original permanece disponível no subsite. A tradução das propostas não representa tradução integral da fonte.','small'),para('Quicksand e Nunito Sans incorporadas. A4 210 × 297 mm; margem interna 22 mm, externa 16 mm. Imprima em tamanho real e confira a prova física antes da tiragem.','small'),para('https://jaguar-master-vip-modular-si.siyayo-academy.pages.dev/master-vip/','small')]
 doc.build(story,onFirstPage=footer,onLaterPages=footer);reader=PdfReader(path);assert len(reader.pages)==5,(edition,len(reader.pages));outputs.append({'edition':edition,'path':str(path.relative_to(root)),'pages':len(reader.pages),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()});print(edition,len(reader.pages))
writer=PdfWriter()
for output in outputs:writer.append(root/output['path'],outline_item=output['edition'].upper())
combined=root/'MASTER_VIP_PROVAS_A4_TRES_EDICOES.pdf'
with combined.open('wb') as f:writer.write(f)
report={'catalog_version':c['version'],'format':'A4','proofs':outputs,'combined_pages':len(PdfReader(combined).pages),'status':'GENERATED_VISUAL_QA_PENDING','scope':'Teaching pilot, six editorial proposals, practice and answer key'};(site/'proofs/proof-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
