import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Undo2, Redo2, Grid3x3,
  Boxes, Box, Search, Trash2, RotateCw, Move, Palette,
  ChevronLeft, ChevronRight, Sun, Moon,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import type { FurnitureItem, FurnitureCategory } from '../db/db';
import FloorPlanCanvas from '../components/FloorPlanCanvas';

const categories: { id: FurnitureCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chair', label: 'Chairs' },
  { id: 'dining_table', label: 'Tables' },
  { id: 'sofa', label: 'Sofas' },
  { id: 'lamp', label: 'Lamps' },
  { id: 'shelf', label: 'Shelves' },
  { id: 'decor', label: 'Decor' },
];

const categoryEmoji: Record<string, string> = {
  chair: '🪑', dining_table: '🍽️', side_table: '☕', sofa: '🛋️',
  lamp: '💡', shelf: '📚', decor: '🌿',
};

export default function DesignerWorkspace() {
  const nav = useNavigate();
  const store = useAppStore();
  const { currentDesign, viewMode, setViewMode, undo, redo,
    undoStack, redoStack, addFurniture, removeFurniture,
    leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar,
    theme, toggleTheme } = store;

  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FurnitureCategory | 'all'>('all');
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    db.furnitureItems.toArray().then(setItems);
  }, []);

  // Measure canvas container
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(el);
    setCanvasSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const filtered = items.filter(i => {
    if (activeTab !== 'all' && i.category !== activeTab) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedFurniture = currentDesign.furniture.find(f => f.id === currentDesign.selectedItemId);
  const selectedItem = selectedFurniture ? items.find(i => i.id === selectedFurniture.modelId) : null;

  const handleSave = async () => {
    if (!currentDesign.id) return;
    await db.designs.update(currentDesign.id, {
      furniture: currentDesign.furniture,
      roomConfig: currentDesign.room,
      updatedAt: new Date(),
    });
  };

  const handleAddItem = (item: FurnitureItem) => {
    const x = currentDesign.room.width / 2;
    const y = currentDesign.room.depth / 2;
    addFurniture(item, x, y);
  };

  return (
    <div className="workspace-layout">
      {/* Toolbar */}
      <div className="workspace-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-logo">
            <div className="toolbar-logo-icon"><Boxes size={14} color="#1A1210"/></div>
            <span className="toolbar-logo-text">RC</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/dashboard')}><ArrowLeft size={14}/> Back</button>
          <div className="toolbar-divider"/>
          <span style={{fontSize:'var(--text-sm)',fontWeight:600,fontFamily:'var(--font-heading)'}}>{currentDesign.name}</span>
        </div>
        <div className="toolbar-center">
          <div className="view-toggle">
            <button className={`view-toggle-btn ${viewMode==='2d'?'active':''}`} onClick={()=>setViewMode('2d')}><Grid3x3 size={14}/> 2D</button>
            <button className={`view-toggle-btn ${viewMode==='3d'?'active':''}`} onClick={()=>setViewMode('3d')}><Box size={14}/> 3D</button>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-icon btn-ghost" onClick={undo} disabled={undoStack.length===0} title="Undo"><Undo2 size={16}/></button>
          <button className="btn btn-icon btn-ghost" onClick={redo} disabled={redoStack.length===0} title="Redo"><Redo2 size={16}/></button>
          <div className="toolbar-divider"/>
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme} title="Toggle theme">{theme==='light'?<Moon size={16}/>:<Sun size={16}/>}</button>
          <button className="btn btn-gold btn-sm" onClick={handleSave}><Save size={14}/> Save</button>
        </div>
      </div>

      {/* Body */}
      <div className="workspace-body">
        {/* Left Sidebar — Catalogue */}
        <div className={`workspace-sidebar-left ${leftSidebarOpen?'':'collapsed'}`}>
          {leftSidebarOpen ? (
            <>
              <div className="catalogue-header">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3>Catalogue</h3>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={toggleLeftSidebar}><ChevronLeft size={14}/></button>
                </div>
                <div style={{position:'relative',marginTop:'var(--space-2)'}}>
                  <input className="glass-input catalogue-search" placeholder="Search furniture..." value={search} onChange={e=>setSearch(e.target.value)}/>
                  <Search size={12} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
                </div>
              </div>
              <div className="catalogue-tabs">
                {categories.map(c=>(
                  <button key={c.id} className={`catalogue-tab ${activeTab===c.id?'active':''}`} onClick={()=>setActiveTab(c.id)}>{c.label}</button>
                ))}
              </div>
              <div className="catalogue-items">
                {filtered.map(item=>(
                  <div key={item.id} className="catalogue-item" onClick={()=>handleAddItem(item)} title={`Click to add ${item.name}`}>
                    <div className="catalogue-item-thumb">{categoryEmoji[item.category]||'📦'}</div>
                    <div className="catalogue-item-name">{item.name}</div>
                    <div className="catalogue-item-dims">{item.dimensions.width}×{item.dimensions.depth}m</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'var(--space-4)'}}>
              <button className="btn btn-icon btn-ghost" onClick={toggleLeftSidebar}><ChevronRight size={14}/></button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="workspace-canvas" ref={canvasContainerRef}>
          {viewMode === '2d' ? (
            <FloorPlanCanvas
              catalogueItems={items}
              containerWidth={canvasSize.width}
              containerHeight={canvasSize.height}
            />
          ) : (
            <div className="canvas-placeholder">
              <Box size={64}/>
              <h3>3D View</h3>
              <p style={{fontSize:'var(--text-sm)'}}>Three.js / R3F viewport — coming in Phase 4</p>
            </div>
          )}
        </div>

        {/* Right Sidebar — Properties */}
        <div className={`workspace-sidebar-right ${rightSidebarOpen?'':'collapsed'}`}>
          {rightSidebarOpen && (
            <>
              <div className="properties-header">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3>{selectedFurniture ? 'Item Properties' : 'Room Properties'}</h3>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={toggleRightSidebar}><ChevronRight size={14}/></button>
                </div>
              </div>
              {selectedFurniture && selectedItem ? (
                <>
                  <div className="properties-section">
                    <h4>Selected Item</h4>
                    <p style={{fontSize:'var(--text-sm)',fontWeight:600}}>{selectedItem.name}</p>
                    <p style={{fontSize:'var(--text-xs)',color:'var(--text-muted)',textTransform:'capitalize'}}>{selectedItem.category.replace('_',' ')}</p>
                  </div>
                  <div className="properties-section">
                    <h4><Move size={12} style={{marginRight:4}}/> Position</h4>
                    <div className="properties-grid">
                      <div className="property-input"><span className="property-label">X</span><input className="glass-input" type="number" value={selectedFurniture.x.toFixed(2)} readOnly/></div>
                      <div className="property-input"><span className="property-label">Z</span><input className="glass-input" type="number" value={selectedFurniture.z.toFixed(2)} readOnly/></div>
                    </div>
                  </div>
                  <div className="properties-section">
                    <h4><RotateCw size={12} style={{marginRight:4}}/> Transform</h4>
                    <div className="properties-grid">
                      <div className="property-input"><span className="property-label">Rotation</span><input className="glass-input" type="number" value={selectedFurniture.rotation} readOnly/></div>
                      <div className="property-input"><span className="property-label">Scale</span><input className="glass-input" type="number" value={selectedFurniture.scale} readOnly/></div>
                    </div>
                  </div>
                  <div className="properties-section">
                    <h4><Palette size={12} style={{marginRight:4}}/> Appearance</h4>
                    <div style={{display:'flex',gap:'var(--space-2)',flexWrap:'wrap'}}>
                      {selectedItem.availableColors.map(c=>(
                        <div key={c} className={`wizard-swatch ${selectedFurniture.color===c?'selected':''}`} style={{background:c,width:28,height:28}} onClick={()=>store.colorFurniture(selectedFurniture.id,c)}/>
                      ))}
                    </div>
                  </div>
                  <div className="properties-section">
                    <button className="btn btn-danger btn-sm" style={{width:'100%'}} onClick={()=>removeFurniture(selectedFurniture.id)}><Trash2 size={14}/> Remove Item</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="properties-section">
                    <h4>Room Info</h4>
                    <div className="wizard-summary-row"><span>Shape</span><span style={{textTransform:'capitalize'}}>{currentDesign.room.shape}</span></div>
                    <div className="wizard-summary-row"><span>Size</span><span>{currentDesign.room.width}m × {currentDesign.room.depth}m</span></div>
                    <div className="wizard-summary-row"><span>Height</span><span>{currentDesign.room.height}m</span></div>
                    <div className="wizard-summary-row"><span>Area</span><span>{(currentDesign.room.width*currentDesign.room.depth).toFixed(1)}m²</span></div>
                  </div>
                  <div className="properties-section">
                    <h4>Wall Color</h4>
                    <div style={{width:32,height:32,borderRadius:'var(--radius-sm)',background:currentDesign.room.wallColor,border:'2px solid var(--border-glass)'}}/>
                  </div>
                  <div className="properties-section">
                    <h4>Floor</h4>
                    <p style={{fontSize:'var(--text-sm)',textTransform:'capitalize'}}>{currentDesign.room.floorType}</p>
                    <div style={{width:32,height:32,borderRadius:'var(--radius-sm)',background:currentDesign.room.floorColor,border:'2px solid var(--border-glass)',marginTop:'var(--space-2)'}}/>
                  </div>
                  <div className="properties-section">
                    <h4>Items Placed</h4>
                    <p style={{fontSize:'var(--text-2xl)',fontFamily:'var(--font-display)',fontWeight:700}}>{currentDesign.furniture.length}</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="workspace-statusbar">
        <span>Room: {currentDesign.room.width}m × {currentDesign.room.depth}m × {currentDesign.room.height}m</span>
        <span>Items: {currentDesign.furniture.length}</span>
        <span>View: {viewMode.toUpperCase()}</span>
        <span style={{marginLeft:'auto'}}>Shape: {currentDesign.room.shape}</span>
      </div>
    </div>
  );
}
