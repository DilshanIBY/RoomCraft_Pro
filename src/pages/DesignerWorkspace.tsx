import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Undo2, Redo2, Grid3x3,
  Boxes, Box, Search, Trash2, RotateCw, Move, Palette,
  ChevronLeft, ChevronRight, Sun, Moon, Magnet,
  ZoomIn, ZoomOut, Maximize2,
  ChevronDown, GripVertical, Clock,
} from 'lucide-react';
import { useAppStore, PALETTE_PRESETS } from '../store/useAppStore';
import { db } from '../db/db';
import type { FurnitureItem, FurnitureCategory } from '../db/db';
import FloorPlanCanvas from '../components/FloorPlanCanvas';
import RoomScene3D from '../components/RoomScene3D';

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

const GRID_OPTIONS = [0.25, 0.5, 1];

export default function DesignerWorkspace() {
  const nav = useNavigate();
  const store = useAppStore();
  const { currentDesign, viewMode, setViewMode, undo, redo,
    undoStack, redoStack, addFurniture, removeFurniture,
    leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar,
    theme, toggleTheme,
    gridSize, setGridSize, snapEnabled, toggleSnap, showGrid, toggleGrid,
    moveFurniture, rotateFurniture, scaleFurniture, colorFurniture,
    colorAllFurniture, applyShade, applyPalette,
  } = store;

  const [shadeValue, setShadeValue] = useState(0.5);

  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FurnitureCategory | 'all'>('all');
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFurnitureRef = useRef<string>('');

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

  // ─── Auto-save timer (FR-DES-04) ───
  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    autoSaveRef.current = setInterval(async () => {
      if (!currentDesign.id) return;
      // Check if anything changed since last save
      const currentHash = JSON.stringify(currentDesign.furniture) + JSON.stringify(currentDesign.room);
      if (currentHash === lastFurnitureRef.current) return;
      lastFurnitureRef.current = currentHash;
      try {
        await db.designs.update(currentDesign.id, {
          furniture: currentDesign.furniture,
          roomConfig: currentDesign.room,
          name: currentDesign.name,
          updatedAt: new Date(),
        });
        setLastAutoSave(new Date());
      } catch (e) {
        console.warn('Auto-save failed:', e);
      }
    }, 60000); // 60 seconds
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
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
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // ─── Drag-and-drop from catalogue ───
  const handleDragStart = (e: React.DragEvent, item: FurnitureItem) => {
    e.dataTransfer.setData('application/roomcraft-item', item.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('application/roomcraft-item');
    if (!itemId) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    // Get stage info from the canvas to do proper coordinate transform
    // Simple center placement if coords unavailable
    const PIXELS_PER_METER = 80;
    const roomW = currentDesign.room.width * PIXELS_PER_METER;
    const roomD = currentDesign.room.depth * PIXELS_PER_METER;
    const containerW = rect.width;
    const containerH = rect.height;
    const roomOffsetX = (containerW - roomW) / 2;
    const roomOffsetY = (containerH - roomD) / 2;

    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    // Convert to world coordinates (meters)
    let worldX = (dropX - roomOffsetX) / PIXELS_PER_METER;
    let worldZ = (dropY - roomOffsetY) / PIXELS_PER_METER;

    // Clamp within room
    const halfW = item.dimensions.width / 2;
    const halfD = item.dimensions.depth / 2;
    worldX = Math.max(halfW, Math.min(currentDesign.room.width - halfW, worldX));
    worldZ = Math.max(halfD, Math.min(currentDesign.room.depth - halfD, worldZ));

    addFurniture(item, worldX, worldZ);
  }, [items, currentDesign.room, addFurniture]);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // ─── Click to add (fallback) ───
  const handleAddItem = (item: FurnitureItem) => {
    const x = currentDesign.room.width / 2;
    const y = currentDesign.room.depth / 2;
    addFurniture(item, x, y);
  };

  // ─── Canvas commands ───
  const sendCanvasCommand = (cmd: string) => {
    const el = canvasContainerRef.current?.querySelector('.konvajs-content');
    if (el) el.dispatchEvent(new CustomEvent('canvas-command', { detail: cmd }));
  };

  // ─── Editable property handlers ───
  const handlePropChange = (prop: 'x' | 'z' | 'rotation' | 'scale', value: string) => {
    if (!selectedFurniture) return;
    const num = parseFloat(value);
    if (isNaN(num)) return;
    if (prop === 'x') moveFurniture(selectedFurniture.id, num, selectedFurniture.z);
    if (prop === 'z') moveFurniture(selectedFurniture.id, selectedFurniture.x, num);
    if (prop === 'rotation') rotateFurniture(selectedFurniture.id, ((num % 360) + 360) % 360);
    if (prop === 'scale') scaleFurniture(selectedFurniture.id, Math.max(0.1, Math.min(5, num)));
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
          <button className="btn btn-icon btn-ghost" onClick={undo} disabled={undoStack.length===0} title="Undo (Ctrl+Z)"><Undo2 size={16}/></button>
          <button className="btn btn-icon btn-ghost" onClick={redo} disabled={redoStack.length===0} title="Redo (Ctrl+Y)"><Redo2 size={16}/></button>
          <div className="toolbar-divider"/>
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme} title="Toggle theme">{theme==='light'?<Moon size={16}/>:<Sun size={16}/>}</button>
          <button className="btn btn-gold btn-sm" onClick={handleSave}><Save size={14}/> Save</button>
        </div>
      </div>

      {/* Save Toast */}
      {saveToast && (
        <div className="save-toast">✓ Design saved</div>
      )}

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
                  <div
                    key={item.id}
                    className="catalogue-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleAddItem(item)}
                    title={`Drag or click to add ${item.name}`}
                  >
                    <div className="catalogue-item-drag"><GripVertical size={10} /></div>
                    <div className="catalogue-item-thumb">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="catalogue-item-thumb-img"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = 'none';
                          el.parentElement!.textContent = categoryEmoji[item.category] || '📦';
                        }}
                      />
                    </div>
                    <div className="catalogue-item-info">
                      <div className="catalogue-item-name">{item.name}</div>
                      <div className="catalogue-item-dims">{item.dimensions.width}×{item.dimensions.depth}m</div>
                    </div>
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
        <div
          className="workspace-canvas"
          ref={canvasContainerRef}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
        >
          {viewMode === '2d' ? (
            <FloorPlanCanvas
              catalogueItems={items}
              containerWidth={canvasSize.width}
              containerHeight={canvasSize.height}
            />
          ) : (
            <RoomScene3D catalogueItems={items} />
          )}

          {/* Canvas Toolbar */}
          {viewMode === '2d' && (
            <div className="canvas-toolbar">
              <button
                className={`canvas-tool-btn ${showGrid ? 'active' : ''}`}
                onClick={toggleGrid}
                title="Toggle Grid (G)"
              >
                <Grid3x3 size={14}/>
              </button>

              <button
                className={`canvas-tool-btn ${snapEnabled ? 'active' : ''}`}
                onClick={toggleSnap}
                title="Toggle Snap-to-Grid"
              >
                <Magnet size={14}/>
              </button>

              <div className="canvas-tool-divider"/>

              <div className="grid-size-dropdown" style={{position:'relative'}}>
                <button
                  className="canvas-tool-btn"
                  onClick={() => setShowGridMenu(!showGridMenu)}
                  title="Grid Size"
                >
                  {gridSize}m <ChevronDown size={10}/>
                </button>
                {showGridMenu && (
                  <div className="grid-size-menu">
                    {GRID_OPTIONS.map(s => (
                      <button
                        key={s}
                        className={`grid-size-option ${gridSize === s ? 'active' : ''}`}
                        onClick={() => { setGridSize(s); setShowGridMenu(false); }}
                      >
                        {s}m
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="canvas-tool-divider"/>

              <button className="canvas-tool-btn" onClick={() => sendCanvasCommand('zoomOut')} title="Zoom Out"><ZoomOut size={14}/></button>
              <button className="canvas-tool-btn" onClick={() => sendCanvasCommand('zoomIn')} title="Zoom In"><ZoomIn size={14}/></button>
              <button className="canvas-tool-btn" onClick={() => sendCanvasCommand('fit')} title="Fit to Room"><Maximize2 size={14}/></button>
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
                      <div className="property-input">
                        <span className="property-label">X</span>
                        <input
                          className="glass-input"
                          type="number"
                          step="0.1"
                          value={selectedFurniture.x.toFixed(2)}
                          onChange={(e) => handlePropChange('x', e.target.value)}
                        />
                        <span className="property-unit">m</span>
                      </div>
                      <div className="property-input">
                        <span className="property-label">Z</span>
                        <input
                          className="glass-input"
                          type="number"
                          step="0.1"
                          value={selectedFurniture.z.toFixed(2)}
                          onChange={(e) => handlePropChange('z', e.target.value)}
                        />
                        <span className="property-unit">m</span>
                      </div>
                    </div>
                  </div>
                  <div className="properties-section">
                    <h4><RotateCw size={12} style={{marginRight:4}}/> Transform</h4>
                    <div className="properties-grid">
                      <div className="property-input">
                        <span className="property-label">Rotation</span>
                        <input
                          className="glass-input"
                          type="number"
                          step="15"
                          value={selectedFurniture.rotation}
                          onChange={(e) => handlePropChange('rotation', e.target.value)}
                        />
                        <span className="property-unit">°</span>
                      </div>
                      <div className="property-input">
                        <span className="property-label">Scale</span>
                        <input
                          className="glass-input"
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="5"
                          value={selectedFurniture.scale}
                          onChange={(e) => handlePropChange('scale', e.target.value)}
                        />
                        <span className="property-unit">×</span>
                      </div>
                    </div>
                  </div>
                  <div className="properties-section">
                    <h4><Palette size={12} style={{marginRight:4}}/> Appearance</h4>
                    <div style={{display:'flex',gap:'var(--space-2)',flexWrap:'wrap'}}>
                      {selectedItem.availableColors.map(c=>(
                        <div key={c} className={`wizard-swatch ${selectedFurniture.color===c?'selected':''}`} style={{background:c,width:28,height:28}} onClick={()=>colorFurniture(selectedFurniture.id,c)}/>
                      ))}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{marginTop:'var(--space-2)',width:'100%',fontSize:'var(--text-xs)'}}
                      onClick={() => colorAllFurniture(selectedFurniture.color)}
                      title="Apply this color to all furniture"
                    >
                      <Palette size={12}/> Apply to All Items
                    </button>
                  </div>
                  <div className="properties-section">
                    <h4>Shade / Tint</h4>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={shadeValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setShadeValue(val);
                        applyShade(selectedFurniture.id, val);
                      }}
                      style={{width:'100%',accentColor:'var(--accent-gold)'}}
                    />
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>
                      <span>Darker</span>
                      <span>Lighter</span>
                    </div>
                  </div>
                  <div className="properties-section" style={{display:'flex',gap:'var(--space-2)'}}>
                    <button className="btn btn-danger btn-sm" style={{flex:1}} onClick={()=>removeFurniture(selectedFurniture.id)}><Trash2 size={14}/> Remove</button>
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
                  <div className="properties-section">
                    <h4><Palette size={12} style={{marginRight:4}}/> Color Palettes</h4>
                    <div style={{display:'flex',flexDirection:'column',gap:'var(--space-2)'}}>
                      {PALETTE_PRESETS.map(p => (
                        <button
                          key={p.name}
                          className="btn btn-ghost btn-sm"
                          style={{
                            justifyContent:'flex-start',
                            gap:'var(--space-2)',
                            padding:'6px 8px',
                            fontSize:'var(--text-xs)',
                          }}
                          onClick={() => applyPalette(p)}
                        >
                          <div style={{display:'flex',gap:2}}>
                            {[p.wallColor, p.floorColor, ...p.furnitureColors.slice(0, 3)].map((c, i) => (
                              <div key={i} style={{width:14,height:14,borderRadius:3,background:c,border:'1px solid var(--border-glass)'}}/>
                            ))}
                          </div>
                          {p.name}
                        </button>
                      ))}
                    </div>
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
        <span style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'var(--space-2)'}}>
          {lastAutoSave && (
            <span className="status-badge" style={{display:'flex',alignItems:'center',gap:3}}>
              <Clock size={9}/> Saved {Math.round((Date.now() - lastAutoSave.getTime()) / 1000)}s ago
            </span>
          )}
          {snapEnabled && <span className="status-badge status-badge-gold">Snap</span>}
          {showGrid && <span className="status-badge">Grid {gridSize}m</span>}
          Shape: {currentDesign.room.shape}
        </span>
      </div>
    </div>
  );
}
