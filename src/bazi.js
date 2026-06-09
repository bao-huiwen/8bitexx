export const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
export const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
export const stemElement = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'}
export const branchHidden = {
  子:{水:1}, 丑:{土:.6,水:.25,金:.15}, 寅:{木:.65,火:.2,土:.15}, 卯:{木:1},
  辰:{土:.6,木:.25,水:.15}, 巳:{火:.65,土:.2,金:.15}, 午:{火:.75,土:.25}, 未:{土:.6,火:.25,木:.15},
  申:{金:.65,水:.2,土:.15}, 酉:{金:1}, 戌:{土:.6,金:.25,火:.15}, 亥:{水:.75,木:.25}
}
export const elementColor = {木:'#63c174',火:'#ff786b',土:'#c9a56a',金:'#d5d8df',水:'#69a7ff'}
const jieQiMonthStart = [
  [2,4,'寅'],[3,6,'卯'],[4,5,'辰'],[5,6,'巳'],[6,6,'午'],[7,7,'未'],
  [8,8,'申'],[9,8,'酉'],[10,8,'戌'],[11,7,'亥'],[12,7,'子'],[1,6,'丑']
]
function mod(n,m){return ((n%m)+m)%m}
function daySerial(d){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)}
function ganzhi(index){return stems[mod(index,10)] + branches[mod(index,12)]}
export function calcBazi(input){
  const d = new Date(`${input.date}T${input.time || '12:00'}:00`)
  if(Number.isNaN(d.getTime())) throw new Error('出生日期或时间无效')
  const y = d.getFullYear(), m=d.getMonth()+1, day=d.getDate(), hour=d.getHours()
  // 以立春近似 2 月 4 日换年，适合游戏演算；严肃命理需精确天文节气。
  const baziYear = (m<2 || (m===2 && day<4)) ? y-1 : y
  const yearIndex = mod(baziYear - 1984, 60)
  const yearPillar = ganzhi(yearIndex)
  let monthBranch='丑', monthNo=12
  for(let i=0;i<jieQiMonthStart.length;i++){
    const [sm,sd,br]=jieQiMonthStart[i]
    const start = new Date(y, sm-1, sd)
    const end = i===jieQiMonthStart.length-1 ? new Date(y+1,1,4) : new Date(y, jieQiMonthStart[i+1][0]-1, jieQiMonthStart[i+1][1])
    if(d>=start && d<end){monthBranch=br; monthNo=i+1; break}
  }
  const yearStemIndex = mod(yearIndex,10)
  const monthStemIndex = mod(yearStemIndex*2 + monthNo + 1, 10)
  const monthPillar = stems[monthStemIndex] + monthBranch
  const dayIndex = mod(daySerial(d) - daySerial(new Date('1984-02-02')), 60) // 1984-02-02 近似甲子日基准
  const dayPillar = ganzhi(dayIndex)
  const unknownHour = input.unknownHour
  let hourPillar = '时辰不详'
  if(!unknownHour){
    const branchIndex = Math.floor((hour + 1) / 2) % 12
    const dayStemIndex = mod(dayIndex,10)
    const hourStemIndex = mod((dayStemIndex % 5) * 2 + branchIndex, 10)
    hourPillar = stems[hourStemIndex] + branches[branchIndex]
  }
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar]
  const stats = {木:0,火:0,土:0,金:0,水:0}
  pillars.forEach(p=>{
    if(p.length===2){ stats[stemElement[p[0]]] += 1; Object.entries(branchHidden[p[1]]).forEach(([e,v])=>stats[e]+=v) }
  })
  if(unknownHour) Object.keys(stats).forEach(k=>stats[k]+=0.4)
  const total = Object.values(stats).reduce((a,b)=>a+b,0)
  const normalized = Object.fromEntries(Object.entries(stats).map(([k,v])=>[k, +(v/total*100).toFixed(1)]))
  return { pillars:{year:yearPillar,month:monthPillar,day:dayPillar,hour:hourPillar}, stats:normalized, rawStats:stats, note:'游戏内八字采用节气近似算法；用于文化娱乐，不作为专业命理依据。' }
}
export function deriveLinggen(stats){
  const sorted = Object.entries(stats).sort((a,b)=>b[1]-a[1])
  const [a,b,c] = sorted
  if(a[1] >= 36) return `${a[0]}系天灵根`
  if(a[1]+b[1] >= 55) return `${a[0]}${b[0]}双灵根`
  if(c[1] >= 16) return '五行杂灵根'
  return `${a[0]}${b[0]}${c[0]}三灵根`
}
export function deriveMingge(stats){
  const max = Object.entries(stats).sort((a,b)=>b[1]-a[1])[0]
  const min = Object.entries(stats).sort((a,b)=>a[1]-b[1])[0]
  const map = {木:'青木长生格',火:'离火明心格',土:'厚土载道格',金:'庚金剑骨格',水:'玄水通幽格'}
  return `${map[max[0]]}｜缺${min[0]}需补`
}
