// ═══════════════════════════════════════════════════════════
// FloorPlanCanvas — Konva.js 2D Room Editor (Phase 3 Complete)
// Renders the room, furniture, grid, measurements
// Supports drag, rotate, resize, select, zoom, pan, snap
// ═══════════════════════════════════════════════════════════

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Transformer, Arc } from 'react-konva';
import { useAppStore } from '../store/useAppStore';
import type { FurnitureItem, PlacedFurniture, WallOpening } from '../db/db';
import Konva from 'konva';

interface Props {
  catalogueItems: FurnitureItem[];
  containerWidth: number;
  containerHeight: number;
}

const PIXELS_PER_METER = 80;
const WALL_THICKNESS = 8;

export default function FloorPlanCanvas({ catalogueItems, containerWidth, containerHeight }: Props) {
  const store = useAppStore();
  const { currentDesign, moveFurniture, rotateFurniture, scaleFurniture,
    selectItem, pushSnapshot, gridSize, snapEnabled, showGrid, toggleGrid } = store;
  const { room, furniture, selectedItemId } = currentDesign;

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [dragMeasure, setDragMeasure] = useState<{
    id: string; left: number; right: number; top: number; bottom: number;
  } | null>(null);
  const [snapLines, setSnapLines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const roomW = room.width * PIXELS_PER_METER;
  const roomD = room.depth * PIXELS_PER_METER;
  const offsetX = (containerWidth - roomW) / 2;
  const offsetY = (containerHeight - roomD) / 2;
  const gridPx = gridSize * PIXELS_PER_METER;

  // ─── Transformer for selected item ───
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    if (selectedItemId) {
      const node = stage.findOne(`#furniture-${selectedItemId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
        return;
      }
    }
    transformerRef.current.nodes([]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedItemId]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't capture keys if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemId) store.removeFurniture(selectedItemId);
      }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); store.undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); store.redo(); }
      if (e.key === 'g') toggleGrid();
      if (e.key === 'Escape') selectItem(null);
      // Rotate selected 90°
      if (e.key === 'r' && selectedItemId) {
        const f = furniture.find(f => f.id === selectedItemId);
        if (f) rotateFurniture(selectedItemId, (f.rotation + 90) % 360);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedItemId, furniture]);

  // ─── Zoom with mousewheel ───
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.3, Math.min(3, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy));
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, []);

  // ─── Fit to room ───
  const fitToRoom = useCallback(() => {
    const padding = 80;
    const scaleX = (containerWidth - padding * 2) / roomW;
    const scaleY = (containerHeight - padding * 2) / roomD;
    const newScale = Math.min(scaleX, scaleY, 2);
    setStageScale(newScale);
    setStagePos({
      x: (containerWidth - roomW * newScale) / 2,
      y: (containerHeight - roomD * newScale) / 2,
    });
  }, [containerWidth, containerHeight, roomW, roomD]);

  // Expose fitToRoom and zoom controls to parent via custom event
  useEffect(() => {
    const el = stageRef.current?.container();
    if (!el) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'fit') fitToRoom();
      if (detail === 'zoomIn') {
        const newScale = Math.min(3, stageScale * 1.2);
        setStageScale(newScale);
        setStagePos({
          x: containerWidth / 2 - (containerWidth / 2 - stagePos.x) * (newScale / stageScale),
          y: containerHeight / 2 - (containerHeight / 2 - stagePos.y) * (newScale / stageScale),
        });
      }
      if (detail === 'zoomOut') {
        const newScale = Math.max(0.3, stageScale / 1.2);
        setStageScale(newScale);
        setStagePos({
          x: containerWidth / 2 - (containerWidth / 2 - stagePos.x) * (newScale / stageScale),
          y: containerHeight / 2 - (containerHeight / 2 - stagePos.y) * (newScale / stageScale),
        });
      }
    };
    el.addEventListener('canvas-command', handler);
    return () => el.removeEventListener('canvas-command', handler);
  }, [fitToRoom, stageScale, stagePos, containerWidth, containerHeight]);

  // ─── Click empty space to deselect ───
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === 'floor' || e.target.name() === 'wall') {
      selectItem(null);
    }
  };

  // ─── Compute snap guide lines for alignment ───
  const computeSnapGuides = useCallback((movingId: string, x: number, z: number) => {
    if (!snapEnabled) { setSnapLines({ x: [], y: [] }); return; }
    const threshold = 0.15; // meters
    const guides: { x: number[]; y: number[] } = { x: [], y: [] };

    // Snap to grid lines
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedZ = Math.round(z / gridSize) * gridSize;
    if (Math.abs(snappedX - x) < threshold) guides.x.push(snappedX);
    if (Math.abs(snappedZ - z) < threshold) guides.y.push(snappedZ);

    // Snap to other furniture centers
    for (const f of furniture) {
      if (f.id === movingId) continue;
      if (Math.abs(f.x - x) < threshold) guides.x.push(f.x);
      if (Math.abs(f.z - z) < threshold) guides.y.push(f.z);
    }

    setSnapLines(guides);
  }, [snapEnabled, gridSize, furniture]);

  // ─── Compute real-time measurements during drag ───
  const computeMeasurement = useCallback((placed: PlacedFurniture, item: FurnitureItem) => {
    const halfW = (item.dimensions.width * placed.scale) / 2;
    const halfD = (item.dimensions.depth * placed.scale) / 2;
    const left = placed.x - halfW;
    const right = room.width - (placed.x + halfW);
    const top = placed.z - halfD;
    const bottom = room.depth - (placed.z + halfD);
    setDragMeasure({ id: placed.id, left, right, top, bottom });
  }, [room.width, room.depth]);

  // ─── Build grid lines ───
  const gridLines = useMemo(() => {
    if (!showGrid) return [];
    const lines: React.ReactElement[] = [];
    for (let x = 0; x <= roomW; x += gridPx) {
      lines.push(
        <Line key={`gv${x}`} points={[offsetX + x, offsetY, offsetX + x, offsetY + roomD]}
          stroke="rgba(180,160,130,0.13)" strokeWidth={1} />
      );
    }
    for (let y = 0; y <= roomD; y += gridPx) {
      lines.push(
        <Line key={`gh${y}`} points={[offsetX, offsetY + y, offsetX + roomW, offsetY + y]}
          stroke="rgba(180,160,130,0.13)" strokeWidth={1} />
      );
    }
    return lines;
  }, [showGrid, roomW, roomD, gridPx, offsetX, offsetY]);

  // ─── Render furniture items ───
  const renderFurniture = (placed: PlacedFurniture) => {
    const item = catalogueItems.find(i => i.id === placed.modelId);
    if (!item) return null;
    const w = item.dimensions.width * PIXELS_PER_METER * placed.scale;
    const d = item.dimensions.depth * PIXELS_PER_METER * placed.scale;
    const px = offsetX + placed.x * PIXELS_PER_METER;
    const pz = offsetY + placed.z * PIXELS_PER_METER;
    const isSelected = selectedItemId === placed.id;

    return (
      <Group
        key={placed.id}
        id={`furniture-${placed.id}`}
        x={px}
        y={pz}
        rotation={placed.rotation}
        draggable
        onClick={(e) => { e.cancelBubble = true; selectItem(placed.id); }}
        onTap={(e) => { e.cancelBubble = true; selectItem(placed.id); }}
        onDragStart={() => { pushSnapshot(); }}
        onDragMove={(e) => {
          // Clamp within room boundaries
          const halfW = w / 2;
          const halfD = d / 2;
          let nx = e.target.x();
          let nz = e.target.y();

          // Boundary clamping
          nx = Math.max(offsetX + halfW + WALL_THICKNESS, Math.min(offsetX + roomW - halfW - WALL_THICKNESS, nx));
          nz = Math.max(offsetY + halfD + WALL_THICKNESS, Math.min(offsetY + roomD - halfD - WALL_THICKNESS, nz));

          // Snap to grid
          if (snapEnabled) {
            const worldX = (nx - offsetX) / PIXELS_PER_METER;
            const worldZ = (nz - offsetY) / PIXELS_PER_METER;
            const snappedX = Math.round(worldX / gridSize) * gridSize;
            const snappedZ = Math.round(worldZ / gridSize) * gridSize;
            nx = offsetX + snappedX * PIXELS_PER_METER;
            nz = offsetY + snappedZ * PIXELS_PER_METER;
          }

          e.target.x(nx);
          e.target.y(nz);

          // Compute live measurements
          const worldX = (nx - offsetX) / PIXELS_PER_METER;
          const worldZ = (nz - offsetY) / PIXELS_PER_METER;
          computeSnapGuides(placed.id, worldX, worldZ);
          computeMeasurement({ ...placed, x: worldX, z: worldZ }, item);
        }}
        onDragEnd={(e) => {
          const newX = (e.target.x() - offsetX) / PIXELS_PER_METER;
          const newZ = (e.target.y() - offsetY) / PIXELS_PER_METER;
          moveFurniture(placed.id, newX, newZ);
          setDragMeasure(null);
          setSnapLines({ x: [], y: [] });
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const rotation = Math.round(node.rotation());
          const scaleX = node.scaleX();

          // Update rotation
          rotateFurniture(placed.id, rotation >= 0 ? rotation % 360 : (rotation % 360) + 360);

          // Update scale
          if (Math.abs(scaleX - 1) > 0.01) {
            const newScale = Math.max(0.3, Math.min(3, placed.scale * scaleX));
            scaleFurniture(placed.id, Math.round(newScale * 100) / 100);
          }

          node.scaleX(1); node.scaleY(1);
        }}
      >
        {/* Shadow */}
        <Rect
          offsetX={w / 2} offsetY={d / 2}
          width={w} height={d}
          fill="rgba(0,0,0,0.06)"
          cornerRadius={4}
          x={3} y={3}
        />
        {/* Main body */}
        <Rect
          offsetX={w / 2} offsetY={d / 2}
          width={w} height={d}
          fill={placed.color}
          stroke={isSelected ? '#C6930A' : 'rgba(0,0,0,0.18)'}
          strokeWidth={isSelected ? 2.5 : 1}
          cornerRadius={4}
          shadowColor="rgba(0,0,0,0.12)"
          shadowBlur={isSelected ? 14 : 4}
          shadowOffsetY={2}
        />
        {/* Direction indicator (small triangle showing front) */}
        <Line
          points={[-4, -d / 2 + 2, 0, -d / 2 - 4, 4, -d / 2 + 2]}
          fill={isSelected ? '#C6930A' : 'rgba(0,0,0,0.25)'}
          closed
          listening={false}
        />
        {/* Label */}
        <Text
          offsetX={w / 2} offsetY={d / 2}
          width={w} height={d}
          text={item.name}
          fontSize={Math.min(11, w / 6)}
          fontFamily="DM Sans, sans-serif"
          fontStyle="600"
          fill={isLightColor(placed.color) ? '#333' : '#FFF'}
          align="center"
          verticalAlign="middle"
          padding={4}
          listening={false}
        />
        {/* Dimensions tooltip for selected */}
        {isSelected && (
          <Text
            offsetX={w / 2}
            y={d / 2 + 6}
            width={w}
            text={`${(item.dimensions.width * placed.scale).toFixed(2)}m × ${(item.dimensions.depth * placed.scale).toFixed(2)}m`}
            fontSize={9}
            fontFamily="JetBrains Mono, monospace"
            fill="#C6930A"
            align="center"
            listening={false}
          />
        )}
      </Group>
    );
  };

  // ─── Render snap guide lines ───
  const renderSnapGuides = () => {
    const lines: React.ReactElement[] = [];
    snapLines.x.forEach((x, i) => {
      const px = offsetX + x * PIXELS_PER_METER;
      lines.push(
        <Line key={`sx${i}`} points={[px, offsetY - 20, px, offsetY + roomD + 20]}
          stroke="rgba(196,154,60,0.5)" strokeWidth={1} dash={[6, 4]} />
      );
    });
    snapLines.y.forEach((y, i) => {
      const py = offsetY + y * PIXELS_PER_METER;
      lines.push(
        <Line key={`sy${i}`} points={[offsetX - 20, py, offsetX + roomW + 20, py]}
          stroke="rgba(196,154,60,0.5)" strokeWidth={1} dash={[6, 4]} />
      );
    });
    return lines;
  };

  // ─── Render real-time measurements ───
  const renderDragMeasurements = () => {
    if (!dragMeasure) return null;
    const placed = furniture.find(f => f.id === dragMeasure.id);
    const item = placed ? catalogueItems.find(i => i.id === placed.modelId) : null;
    if (!placed || !item) return null;

    const px = offsetX + placed.x * PIXELS_PER_METER;
    const pz = offsetY + placed.z * PIXELS_PER_METER;
    const halfW = (item.dimensions.width * placed.scale * PIXELS_PER_METER) / 2;
    const halfD = (item.dimensions.depth * placed.scale * PIXELS_PER_METER) / 2;
    const measureColor = '#C49A3C';
    const fontSize = 9;
    const font = 'JetBrains Mono, monospace';

    return (
      <Group listening={false}>
        {/* Left measurement */}
        {dragMeasure.left > 0.05 && (
          <>
            <Line points={[offsetX + WALL_THICKNESS, pz, px - halfW, pz]}
              stroke={measureColor} strokeWidth={1} dash={[3, 3]} />
            <Rect x={offsetX + WALL_THICKNESS + (px - halfW - offsetX - WALL_THICKNESS) / 2 - 18} y={pz - 9}
              width={36} height={16} fill="rgba(0,0,0,0.7)" cornerRadius={3} />
            <Text
              x={offsetX + WALL_THICKNESS + (px - halfW - offsetX - WALL_THICKNESS) / 2 - 18} y={pz - 7}
              width={36} text={`${dragMeasure.left.toFixed(2)}`}
              fontSize={fontSize} fontFamily={font} fill="#FFF" align="center" />
          </>
        )}
        {/* Right measurement */}
        {dragMeasure.right > 0.05 && (
          <>
            <Line points={[px + halfW, pz, offsetX + roomW - WALL_THICKNESS, pz]}
              stroke={measureColor} strokeWidth={1} dash={[3, 3]} />
            <Rect x={px + halfW + (offsetX + roomW - WALL_THICKNESS - px - halfW) / 2 - 18} y={pz - 9}
              width={36} height={16} fill="rgba(0,0,0,0.7)" cornerRadius={3} />
            <Text
              x={px + halfW + (offsetX + roomW - WALL_THICKNESS - px - halfW) / 2 - 18} y={pz - 7}
              width={36} text={`${dragMeasure.right.toFixed(2)}`}
              fontSize={fontSize} fontFamily={font} fill="#FFF" align="center" />
          </>
        )}
        {/* Top measurement */}
        {dragMeasure.top > 0.05 && (
          <>
            <Line points={[px, offsetY + WALL_THICKNESS, px, pz - halfD]}
              stroke={measureColor} strokeWidth={1} dash={[3, 3]} />
            <Rect x={px + 4} y={offsetY + WALL_THICKNESS + (pz - halfD - offsetY - WALL_THICKNESS) / 2 - 8}
              width={36} height={16} fill="rgba(0,0,0,0.7)" cornerRadius={3} />
            <Text
              x={px + 4} y={offsetY + WALL_THICKNESS + (pz - halfD - offsetY - WALL_THICKNESS) / 2 - 6}
              width={36} text={`${dragMeasure.top.toFixed(2)}`}
              fontSize={fontSize} fontFamily={font} fill="#FFF" align="center" />
          </>
        )}
        {/* Bottom measurement */}
        {dragMeasure.bottom > 0.05 && (
          <>
            <Line points={[px, pz + halfD, px, offsetY + roomD - WALL_THICKNESS]}
              stroke={measureColor} strokeWidth={1} dash={[3, 3]} />
            <Rect x={px + 4} y={pz + halfD + (offsetY + roomD - WALL_THICKNESS - pz - halfD) / 2 - 8}
              width={36} height={16} fill="rgba(0,0,0,0.7)" cornerRadius={3} />
            <Text
              x={px + 4} y={pz + halfD + (offsetY + roomD - WALL_THICKNESS - pz - halfD) / 2 - 6}
              width={36} text={`${dragMeasure.bottom.toFixed(2)}`}
              fontSize={fontSize} fontFamily={font} fill="#FFF" align="center" />
          </>
        )}
      </Group>
    );
  };

  // ─── Dimension lines ───
  const dimColor = '#B4A082';

  return (
    <Stage
      ref={stageRef}
      width={containerWidth}
      height={containerHeight}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      onWheel={handleWheel}
      onClick={handleStageClick}
      onTap={handleStageClick as any}
      draggable
      onDragEnd={(e) => {
        if (e.target === stageRef.current) {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }
      }}
      style={{ cursor: 'default' }}
    >
      {/* Grid Layer */}
      <Layer listening={false}>
        {gridLines}
      </Layer>

      {/* Room Layer */}
      <Layer>
        {/* Floor */}
        <Rect
          name="floor"
          x={offsetX} y={offsetY}
          width={roomW} height={roomD}
          fill={room.floorColor}
          cornerRadius={2}
        />

        {/* Walls */}
        <Rect name="wall" x={offsetX} y={offsetY} width={roomW} height={WALL_THICKNESS} fill={room.wallColor} stroke="#888" strokeWidth={0.5} />
        <Rect name="wall" x={offsetX} y={offsetY} width={WALL_THICKNESS} height={roomD} fill={room.wallColor} stroke="#888" strokeWidth={0.5} />
        <Rect name="wall" x={offsetX} y={offsetY + roomD - WALL_THICKNESS} width={roomW} height={WALL_THICKNESS} fill={room.wallColor} stroke="#888" strokeWidth={0.5} />
        <Rect name="wall" x={offsetX + roomW - WALL_THICKNESS} y={offsetY} width={WALL_THICKNESS} height={roomD} fill={room.wallColor} stroke="#888" strokeWidth={0.5} />

        {/* Doors & Windows (FR-ROOM-05) */}
        {(room.openings || []).map((op: WallOpening) => {
          const opW = op.width * PIXELS_PER_METER;
          const opPos = op.position * PIXELS_PER_METER;
          const isDoor = op.type === 'door';

          // Compute position on wall
          let x = 0, y = 0, w = 0, h = 0;
          if (op.wall === 'north') {
            x = offsetX + opPos - opW / 2;
            y = offsetY;
            w = opW; h = WALL_THICKNESS;
          } else if (op.wall === 'south') {
            x = offsetX + opPos - opW / 2;
            y = offsetY + roomD - WALL_THICKNESS;
            w = opW; h = WALL_THICKNESS;
          } else if (op.wall === 'west') {
            x = offsetX;
            y = offsetY + opPos - opW / 2;
            w = WALL_THICKNESS; h = opW;
          } else {
            x = offsetX + roomW - WALL_THICKNESS;
            y = offsetY + opPos - opW / 2;
            w = WALL_THICKNESS; h = opW;
          }

          return (
            <Group key={op.id}>
              {/* Clear wall segment */}
              <Rect x={x} y={y} width={w} height={h} fill={room.floorColor} />
              {isDoor ? (
                <>
                  {/* Door frame lines */}
                  {op.wall === 'north' || op.wall === 'south' ? (
                    <>
                      <Line points={[x, y, x, y + h]} stroke="#8B6914" strokeWidth={2} />
                      <Line points={[x + w, y, x + w, y + h]} stroke="#8B6914" strokeWidth={2} />
                      {/* Swing arc */}
                      <Arc
                        x={x}
                        y={op.wall === 'north' ? y + h : y}
                        innerRadius={0} outerRadius={opW * 0.9}
                        angle={90}
                        rotation={op.wall === 'north' ? 0 : -90}
                        stroke="#C49A3C" strokeWidth={1}
                        dash={[4, 4]}
                        listening={false}
                      />
                    </>
                  ) : (
                    <>
                      <Line points={[x, y, x + w, y]} stroke="#8B6914" strokeWidth={2} />
                      <Line points={[x, y + h, x + w, y + h]} stroke="#8B6914" strokeWidth={2} />
                      <Arc
                        x={op.wall === 'west' ? x + w : x}
                        y={y}
                        innerRadius={0} outerRadius={opW * 0.9}
                        angle={90}
                        rotation={op.wall === 'west' ? 0 : 90}
                        stroke="#C49A3C" strokeWidth={1}
                        dash={[4, 4]}
                        listening={false}
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Window — light blue fill with frame */}
                  <Rect
                    x={x} y={y} width={w} height={h}
                    fill="rgba(135,206,235,0.35)"
                    stroke="#5B9BD5" strokeWidth={1.5}
                  />
                  {/* Center line to indicate glass */}
                  {op.wall === 'north' || op.wall === 'south' ? (
                    <Line points={[x + w / 2, y, x + w / 2, y + h]} stroke="#5B9BD5" strokeWidth={1} />
                  ) : (
                    <Line points={[x, y + h / 2, x + w, y + h / 2]} stroke="#5B9BD5" strokeWidth={1} />
                  )}
                </>
              )}
              {/* Label */}
              <Text
                x={op.wall === 'west' || op.wall === 'east' ? x - 24 : x}
                y={op.wall === 'north' ? y - 14 : op.wall === 'south' ? y + h + 3 : y + h + 3}
                width={op.wall === 'north' || op.wall === 'south' ? w : 60}
                text={isDoor ? '🚪' : '🪟'}
                fontSize={10}
                align="center"
                listening={false}
              />
            </Group>
          );
        })}

        {/* Dimension labels */}
        <Text
          x={offsetX + roomW / 2 - 30}
          y={offsetY + roomD + 12}
          text={`${room.width} m`}
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          fill={dimColor}
        />
        <Line points={[offsetX, offsetY + roomD + 8, offsetX + roomW, offsetY + roomD + 8]} stroke={dimColor} strokeWidth={1} dash={[4, 4]} />
        {/* Vertical dim */}
        <Text
          x={offsetX + roomW + 14}
          y={offsetY + roomD / 2 - 6}
          text={`${room.depth} m`}
          fontSize={12}
          fontFamily="JetBrains Mono, monospace"
          fill={dimColor}
          rotation={90}
        />
        <Line points={[offsetX + roomW + 8, offsetY, offsetX + roomW + 8, offsetY + roomD]} stroke={dimColor} strokeWidth={1} dash={[4, 4]} />

        {/* Scale indicator */}
        <Group x={offsetX} y={offsetY + roomD + 30}>
          <Line points={[0, 0, PIXELS_PER_METER, 0]} stroke={dimColor} strokeWidth={2} />
          <Line points={[0, -4, 0, 4]} stroke={dimColor} strokeWidth={1.5} />
          <Line points={[PIXELS_PER_METER, -4, PIXELS_PER_METER, 4]} stroke={dimColor} strokeWidth={1.5} />
          <Text x={PIXELS_PER_METER / 2 - 10} y={4} text="1 m" fontSize={10} fontFamily="JetBrains Mono" fill={dimColor} />
        </Group>

        {/* Snap guide lines */}
        {renderSnapGuides()}

        {/* Real-time measurements */}
        {renderDragMeasurements()}

        {/* Furniture */}
        {furniture.map(renderFurniture)}

        {/* Transformer (rotation + scale handles) */}
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          resizeEnabled={true}
          keepRatio={true}
          borderStroke="#C6930A"
          borderStrokeWidth={2}
          anchorFill="#C6930A"
          anchorStroke="#FFF8EB"
          anchorSize={8}
          anchorCornerRadius={2}
          rotateAnchorOffset={22}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]}
          boundBoxFunc={(oldBox, newBox) => {
            const minSize = 16;
            if (Math.abs(newBox.width) < minSize || Math.abs(newBox.height) < minSize) return oldBox;
            return newBox;
          }}
        />
      </Layer>

      {/* HUD Layer — zoom/grid/snap info (positioned in screen-space) */}
      {/* <Layer listening={false}>
        <Group
          x={(10 - stagePos.x) / stageScale}
          y={(containerHeight - 60 - stagePos.y) / stageScale}
        >
          <Rect width={220} height={24} fill="rgba(0,0,0,0.55)" cornerRadius={4} />
          <Text x={8} y={5}
            text={`Zoom: ${(stageScale * 100).toFixed(0)}% | Grid: ${showGrid ? 'ON' : 'OFF'} (${gridSize}m) | Snap: ${snapEnabled ? 'ON' : 'OFF'}`}
            fontSize={9} fontFamily="JetBrains Mono" fill="#DDD" />
        </Group>
      </Layer> */}
    </Stage>
  );
}

function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return true;
  const rgb = parseInt(clean, 16);
  const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
