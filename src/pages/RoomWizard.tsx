import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../db/db';
import type { RoomShape, FloorType } from '../db/db';

const shapes: { id: RoomShape; label: string }[] = [
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'l-shaped', label: 'L-Shaped' },
  { id: 'open-plan', label: 'Open Plan' },
  { id: 'studio', label: 'Studio' },
  { id: 'irregular', label: 'Irregular' },
];

const wallColors = ['#F5F0EB','#FFF8EB','#E8E4DE','#D4C5A9','#B8C5D6','#C5D6B8','#D6C5B8','#E8D6C5'];
const floorTypeList: { id: FloorType; label: string; emoji: string }[] = [
  { id: 'hardwood', label: 'Hardwood', emoji: '🪵' },
  { id: 'tile', label: 'Tile', emoji: '🔲' },
  { id: 'carpet', label: 'Carpet', emoji: '🧶' },
  { id: 'marble', label: 'Marble', emoji: '💎' },
];
const floorColorMap: Record<FloorType, string[]> = {
  hardwood: ['#A0522D','#8B6914','#D2B48C','#5C3317'],
  tile: ['#D3D3D3','#FAF7F2','#B8B8B8','#2C1810'],
  carpet: ['#D4B896','#8B7355','#A9C4A9','#B8A0C8'],
  marble: ['#F5F0EB','#E0D5C5','#D3D3D3','#FFF8EB'],
};

export default function RoomWizard() {
  const nav = useNavigate();
  const { loadDesign } = useAppStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [shape, setShape] = useState<RoomShape>('rectangular');
  const [w, setW] = useState(5); const [d, setD] = useState(4); const [h, setH] = useState(2.8);
  const [wc, setWc] = useState('#F5F0EB');
  const [ft, setFt] = useState<FloorType>('hardwood');
  const [fc, setFc] = useState('#A0522D');
  const labels = ['Shape','Dimensions','Style','Review'];
  const sv = { enter:{opacity:0,x:40}, center:{opacity:1,x:0}, exit:{opacity:0,x:-40} };

  const finish = async () => {
    const room = { shape,width:w,depth:d,height:h,wallColor:wc,floorType:ft,floorColor:fc };
    const id = crypto.randomUUID(); const now = new Date();
    const name = `${shape.charAt(0).toUpperCase()+shape.slice(1)} Room — ${w}m × ${d}m`;
    await db.designs.add({ id, userId:user!.id, name, roomConfig:room, furniture:[], tags:[shape,ft], isPublic:false, createdAt:now, updatedAt:now });
    loadDesign({ id, name, room, furniture:[], selectedItemId:null });
    nav('/designer');
  };

  return (
    <div className="wizard-page">
      <header className="wizard-header">
        <div className="wizard-header-left">
          <button className="btn btn-ghost" onClick={() => nav('/dashboard')}><ArrowLeft size={18}/> Back</button>
          <div className="wizard-title">Room Setup</div>
        </div>
        <div className="wizard-stepper">
          {labels.map((l,i)=>(
            <div key={l} className="wizard-step">
              <div className={`wizard-step-dot ${step===i?'active':''} ${step>i?'completed':''}`}>{step>i?<Check size={14}/>:i+1}</div>
              <span className={`wizard-step-label ${step===i?'active':''}`}>{l}</span>
              {i<3&&<div className={`wizard-step-connector ${step>i?'active':''}`}/>}
            </div>
          ))}
        </div>
        <div style={{width:100}}/>
      </header>
      <div className="wizard-body">
        <AnimatePresence mode="wait">
          {step===0&&(
            <motion.div key="s0" className="wizard-content" variants={sv} initial="enter" animate="center" exit="exit" transition={{duration:0.25}}>
              <h2>Choose Room Shape</h2><p>Select the layout that best matches your space.</p>
              <div className="wizard-shapes">
                {shapes.map(s=>(
                  <div key={s.id} className={`wizard-shape-card ${shape===s.id?'selected':''}`} onClick={()=>setShape(s.id)}>
                    <div className="wizard-shape-preview"/><h4>{s.label}</h4>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {step===1&&(
            <motion.div key="s1" className="wizard-content" variants={sv} initial="enter" animate="center" exit="exit" transition={{duration:0.25}}>
              <h2>Set Dimensions</h2><p>Enter room measurements in meters.</p>
              <div className="wizard-dims">
                {[{l:'Width',v:w,s:setW},{l:'Depth',v:d,s:setD},{l:'Height',v:h,s:setH}].map(x=>(
                  <div key={x.l} className="wizard-dim-group">
                    <label>{x.l}</label>
                    <input className="glass-input" type="number" value={x.v} onChange={e=>x.s(+e.target.value)} min={1} max={20} step={0.1}/>
                    <span className="wizard-dim-unit">meters</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:'var(--space-8)',display:'flex',justifyContent:'center'}}>
                <div style={{width:Math.min(w*40,300),height:Math.min(d*40,200),border:'2px solid var(--accent-gold)',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)',color:'var(--text-secondary)',background:'var(--surface-glass)',transition:'all 0.3s var(--ease-spring)'}}>{w}m × {d}m</div>
              </div>
            </motion.div>
          )}
          {step===2&&(
            <motion.div key="s2" className="wizard-content" variants={sv} initial="enter" animate="center" exit="exit" transition={{duration:0.25}}>
              <h2>Wall & Floor Style</h2><p>Choose colors and materials.</p>
              <div className="wizard-colors">
                <div className="wizard-color-section">
                  <h4>Wall Color</h4>
                  <div className="wizard-swatches">{wallColors.map(c=><div key={c} className={`wizard-swatch ${wc===c?'selected':''}`} style={{background:c}} onClick={()=>setWc(c)}/>)}</div>
                </div>
                <div className="wizard-color-section">
                  <h4>Floor Type</h4>
                  <div className="wizard-floor-types">{floorTypeList.map(x=><div key={x.id} className={`wizard-floor-type ${ft===x.id?'selected':''}`} onClick={()=>{setFt(x.id);setFc(floorColorMap[x.id][0])}}>{x.emoji} {x.label}</div>)}</div>
                  <h4>Floor Color</h4>
                  <div className="wizard-swatches">{(floorColorMap[ft]||[]).map(c=><div key={c} className={`wizard-swatch ${fc===c?'selected':''}`} style={{background:c}} onClick={()=>setFc(c)}/>)}</div>
                </div>
              </div>
            </motion.div>
          )}
          {step===3&&(
            <motion.div key="s3" className="wizard-content" variants={sv} initial="enter" animate="center" exit="exit" transition={{duration:0.25}}>
              <h2>Review & Start</h2><p>Everything looks good? Let's start designing!</p>
              <div className="wizard-summary">
                <div className="wizard-summary-section">
                  <h4>Room Setup</h4>
                  <div className="wizard-summary-row"><span>Shape</span><span style={{textTransform:'capitalize'}}>{shape}</span></div>
                  <div className="wizard-summary-row"><span>Dimensions</span><span>{w}m × {d}m × {h}m</span></div>
                  <div className="wizard-summary-row"><span>Area</span><span>{(w*d).toFixed(1)}m²</span></div>
                </div>
                <div className="wizard-summary-section">
                  <h4>Style</h4>
                  <div className="wizard-summary-row"><span>Wall</span><span><span className="wizard-summary-color" style={{background:wc}}/>{wc}</span></div>
                  <div className="wizard-summary-row"><span>Floor</span><span style={{textTransform:'capitalize'}}>{ft}</span></div>
                  <div className="wizard-summary-row"><span>Floor Color</span><span><span className="wizard-summary-color" style={{background:fc}}/>{fc}</span></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <footer className="wizard-footer">
        <button className="btn btn-glass" onClick={()=>step>0?setStep(s=>s-1):nav('/dashboard')}><ArrowLeft size={16}/> {step===0?'Cancel':'Back'}</button>
        <div style={{display:'flex',gap:'var(--space-2)'}}>{labels.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:i===step?'var(--accent-gold)':'var(--border-glass)'}}/>)}</div>
        {step<3?<button className="btn btn-gold" onClick={()=>setStep(s=>s+1)}>Next <ArrowRight size={16}/></button>
        :<button className="btn btn-gold" onClick={finish}><Sparkles size={16}/> Start Designing</button>}
      </footer>
    </div>
  );
}
