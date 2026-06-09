import React, {useMemo, useRef, useState} from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import { Download, Share2, Save, RotateCcw } from 'lucide-react'
import { calcBazi, deriveLinggen, deriveMingge, elementColor } from './bazi'
import './style.css'

const SAVE_KEY = 'bazi-xiuxian-save-v1'
const choices = [
  {key:'大凶', text:'强行破阵，赌命夺机缘', delta:{生命力:-28,气运:-18,心魔:26,决策力:-8,性格:-6}},
  {key:'小凶', text:'听信旁门，借术速成', delta:{生命力:-12,气运:-8,心魔:12,决策力:-3,性格:-2}},
  {key:'平', text:'稳守本心，顺势而行', delta:{生命力:0,气运:1,心魔:0,决策力:1,性格:1}},
  {key:'小吉', text:'谨慎试探，取一线机缘', delta:{生命力:10,气运:9,心魔:-6,决策力:5,性格:4}},
  {key:'大吉', text:'明辨天机，择正道破局', delta:{生命力:22,气运:18,心魔:-13,决策力:8,性格:7}},
]
const chapters = ['子·问道初醒','丑·灵根照骨','寅·山门试炼','卯·草木逢春','辰·洞府机缘','巳·心火劫','午·剑气纵横','未·黄庭筑基','申·金石试炼','酉·月下问心','戌·魔念来袭','亥·归藏终局']
const story = [
  '你在寒夜醒来，掌心浮现一枚生辰灵印。', '命盘显化，五行灵气在周身流转。', '山门长老命你在险路、稳路、捷路之间择一而行。',
  '灵草园中异香浮动，似有妖气，也似有仙缘。', '旧洞府门前有三盏灯，一盏明，一盏暗，一盏半明。', '心火幻境中，你看见自己最贪求的答案。',
  '剑冢震动，残剑择主，亦会反噬。', '黄庭内景开启，气息必须归于一线。', '金石台上，众修士争夺一枚无主法器。',
  '月下问心，旧债与新愿同时浮现。', '魔念窥伺，你必须决定是否借力破境。', '万象归藏，十二地支轮转成最终命数。'
]
function clamp(n){return Math.max(0, Math.min(100, Math.round(n)))}
function scoreToEnding(score){
  if(score < 35) return {grade:'大凶', title:'死亡', desc:'气绝道消，生辰灵印碎于尘中。'}
  if(score < 50) return {grade:'小凶', title:'入魔', desc:'修为未成，心魔先成，从此道心偏斜。'}
  if(score < 65) return {grade:'平', title:'凡人', desc:'你看破仙凡之隔，归于烟火人间。'}
  if(score < 82) return {grade:'小吉', title:'练气', desc:'灵气入体，踏上真正的修仙之路。'}
  return {grade:'大吉', title:'筑基', desc:'道基初成，十二地支皆为你铺路。'}
}
function App(){
  const [input,setInput]=useState(()=>JSON.parse(localStorage.getItem(SAVE_KEY)||'null')?.input || {name:'',date:'2000-01-01',time:'12:00',unknownHour:false})
  const [accepted,setAccepted]=useState(()=>JSON.parse(localStorage.getItem(SAVE_KEY)||'null')?.accepted || false)
  const [game,setGame]=useState(()=>JSON.parse(localStorage.getItem(SAVE_KEY)||'null')?.game || null)
  const [error,setError]=useState('')
  const shotRef=useRef(null)
  const bazi = useMemo(()=>{try{return game?.bazi || calcBazi(input)}catch{return null}},[input,game])
  function start(){
    try{
      const bz=calcBazi(input); const lg=deriveLinggen(bz.stats); const mg=deriveMingge(bz.stats)
      const maxEl=Object.entries(bz.stats).sort((a,b)=>b[1]-a[1])[0][0]
      const attrs={性格:55,决策力:55,生命力:65,气运:50,心魔:25}
      const next={bazi:bz, linggen:lg, mingge:mg, maxEl, attrs, chapter:0, log:[]}
      setGame(next); setError(''); save(input,true,next)
    }catch(e){setError(e.message)}
  }
  function save(i=input,a=accepted,g=game){localStorage.setItem(SAVE_KEY,JSON.stringify({input:i,accepted:a,game:g}))}

  function choose(c){
  const nextAttrs={...game.attrs}; 
  Object.entries(c.delta).forEach(([k,v])=>nextAttrs[k]=clamp(nextAttrs[k]+v))

  const next={
    ...game,
    attrs:nextAttrs,
    chapter: game.chapter+1,
    log:[
      ...game.log,
      {
        chapter:chapters[game.chapter],
        choice:c.text,
        result:c.key
      }
    ]
  }

  setGame(next); 
  save(input,accepted,next)
}




  
  function reset(){localStorage.removeItem(SAVE_KEY); setGame(null); setAccepted(false)}
  async function screenshot(){const canvas=await html2canvas(shotRef.current,{backgroundColor:'#120d16'}); const a=document.createElement('a'); a.download='八字修仙人生.png'; a.href=canvas.toDataURL(); a.click()}
  async function share(){const text=`我在《八字修仙人生》中生成了${game?.linggen||'灵根'}，命格：${game?.mingge||''}`; if(navigator.share){await navigator.share({title:'八字修仙人生',text, url:location.href})}else{await navigator.clipboard.writeText(text+' '+location.href); alert('分享文案已复制')}}
  const ended = game && game.chapter>=12
  const finalScore = game ? game.attrs.生命力*.25 + game.attrs.气运*.35 + game.attrs.决策力*.2 + game.attrs.性格*.1 + (100-game.attrs.心魔)*.1 : 0
  const ending = ended ? scoreToEnding(finalScore) : null
  return <div className="app"><main ref={shotRef} className="panel">
    <header><h1>八字修仙人生</h1><p>以生辰四柱入局，历十二地支章节，择五档吉凶，观一生命数。</p></header>
    {!accepted && <section className="disclaimer"><h2>免责声明</h2><p>本游戏内容仅用于传统文化主题娱乐与创意体验。八字、五行、灵根、命格等演算均为游戏化设定，不构成现实命理、医疗、投资、人生决策建议，请勿迷信或据此作出重大决定。</p><button onClick={()=>{setAccepted(true);save(input,true,game)}}>我已知晓，进入游戏</button></section>}
    {accepted && !game && <section className="card"><h2>生辰录入</h2><label>道号/姓名<input value={input.name} onChange={e=>setInput({...input,name:e.target.value})} placeholder="可选"/></label><label>出生日期<input type="date" value={input.date} onChange={e=>setInput({...input,date:e.target.value})}/></label><label>出生时间<input type="time" disabled={input.unknownHour} value={input.time} onChange={e=>setInput({...input,time:e.target.value})}/></label><label className="check"><input type="checkbox" checked={input.unknownHour} onChange={e=>setInput({...input,unknownHour:e.target.checked})}/> 不清楚出生时辰：按五行均衡折中处理</label>{error&&<p className="err">{error}</p>}<button onClick={start}>生成命盘，开始修仙</button></section>}
    {game && <section className="grid"><div className="card"><h2>命盘</h2><div className="pillars">{Object.entries(game.bazi.pillars).map(([k,v])=><div key={k}><small>{{year:'年柱',month:'月柱',day:'日柱',hour:'时柱'}[k]}</small><b>{v}</b></div>)}</div><p>{game.bazi.note}</p><h3>{game.linggen}</h3><p>{game.mingge}</p></div><div className="card"><h2>五行统计</h2>{Object.entries(game.bazi.stats).map(([k,v])=><div className="bar" key={k}><span>{k}</span><i><em style={{width:v+'%',background:elementColor[k]}}/></i><b>{v}%</b></div>)}</div><div className="card"><h2>属性</h2>{Object.entries(game.attrs).map(([k,v])=><div className="bar attr" key={k}><span>{k}</span><i><em style={{width:v+'%'}}/></i><b>{v}</b></div>)}</div></section>}
    {game && !ended && <section className="card story"><h2>{chapters[game.chapter]}</h2><p>{story[game.chapter]}</p><div className="choices">{choices.map(c=><button key={c.key} onClick={()=>choose(c)}>{c.text}</button>)}</div></section>}
    {ending && <section className="card ending"><h2>结局：{ending.title}</h2><h3>{ending.grade}</h3><p>{ending.desc}</p><p>最终命数：{Math.round(finalScore)}</p><ol>{game.log.map((l,i)=><li key={i}>{l.chapter}：{l.choice}</li>)}</ol></section>}
    {game && <footer><button onClick={()=>save()}><Save size={16}/> 本地存档</button><button onClick={screenshot}><Download size={16}/> 截图</button><button onClick={share}><Share2 size={16}/> 分享</button><button onClick={reset}><RotateCcw size={16}/> 重开</button></footer>}
  </main></div>
}
createRoot(document.getElementById('root')).render(<App />)
