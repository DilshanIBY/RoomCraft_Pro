// ═══════════════════════════════════════════════════════════
// FloorPlanCanvas — Konva.js 2D Room Editor
// Renders the room, furniture, grid, measurements
// Supports drag, rotate, select, zoom, pan
// ═══════════════════════════════════════════════════════════

import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Transformer } from 'react-konva';
import { useAppStore } from '../store/useAppStore';
import type { FurnitureItem, PlacedFurniture } from '../db/db';
import Konva from 'konva';

interface Props {
  catalogueItems: FurnitureItem[];
  containerWidth: number;
  containerHeight: number;
}

const PIXELS_PER_METER = 80;
const WALL_THICKNESS = 8;
const GRID_SIZE = 0.5; // 0.5m grid

export default function FloorPlanCanvas({ catalogueItems, containerWidth, containerHeight }: Props) {
  const store = useAppStore();
  const { currentDesign, moveFurniture, rotateFurniture, selectItem, pushSnapshot } = store;
  const { room, furniture, selectedItemId } = currentDesign;

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const roomW = room.width * PIXELS_PER_METER;
  const roomD = room.depth * PIXELS_PER_METER;
  const offsetX = (containerWidth - roomW) / 2;
  const offsetY = (containerHeight - roomD) / 2;

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
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemId) store.removeFurniture(selectedItemId);
      }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); store.undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); store.redo(); }
      if (e.key === 'g') setShowGrid(v => !v);
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

  // ─── Click empty space to deselect ───
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === 'floor' || e.target.name() === 'wall') {
      selectItem(null);
    }
  };

  // ─── Build grid lines ───
  const gridLines: React.ReactElement[] = [];
  if (showGrid) {
    const gridPx = GRID_SIZE * PIXELS_PER_METER;
    for (let x = 0; x <= roomW; x += gridPx) {
      gridLines.push(
        <Line key={`gv${x}`} points={[offsetX + x, offsetY, offsetX + x, offsetY + roomD]}
          stroke="rgba(180,160,130,0.15)" strokeWidth={1} />
      );
    }
    for (let y = 0; y <= roomD; y += gridPx) {
      gridLines.push(
        <Line key={`gh${y}`} points={[offsetX, offsetY + y, offsetX + roomW, offsetY + y]}
          stroke="rgba(180,160,130,0.15)" strokeWidth={1} />
      );
    }
  }

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
        onDragEnd={(e) => {
          const newX = (e.target.x() - offsetX) / PIXELS_PER_METER;
          const newZ = (e.target.y() - offsetY) / PIXELS_PER_METER;
          moveFurniture(placed.id, newX, newZ);
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const rotation = Math.round(node.rotation());
          rotateFurniture(placed.id, rotation >= 0 ? rotation % 360 : (rotation % 360) + 360);
          node.scaleX(1); node.scaleY(1);
        }}
      >
        {/* Shadow */}
        <Rect
          offsetX={w / 2} offsetY={d / 2}
          width={w} height={d}
          fill="rgba(0,0,0,0.08)"
          cornerRadius={4}
          x={3} y={3}
        />
        {/* Main body */}
        <Rect
          offsetX={w / 2} offsetY={d / 2}
          width={w} height={d}
          fill={placed.color}
          stroke={isSelected ? '#C6930A' : 'rgba(0,0,0,0.2)'}
          strokeWidth={isSelected ? 2.5 : 1}
          cornerRadius={4}
          shadowColor="rgba(0,0,0,0.15)"
          shadowBlur={isSelected ? 12 : 4}
          shadowOffsetY={2}
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
            text={`${item.dimensions.width}m × ${item.dimensions.depth}m`}
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

        {/* Furniture */}
        {furniture.map(renderFurniture)}

        {/* Transformer (rotation / selection handles) */}
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          resizeEnabled={false}
          borderStroke="#C6930A"
          borderStrokeWidth={2}
          anchorFill="#C6930A"
          anchorStroke="#FFF8EB"
          anchorSize={8}
          anchorCornerRadius={2}
          rotateAnchorOffset={20}
          enabledAnchors={[]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      </Layer>

      {/* HUD Layer — zoom/grid info */}
      <Layer listening={false}>
        <Group x={10} y={containerHeight / stageScale - 40}>
          <Rect width={140} height={24} fill="rgba(0,0,0,0.5)" cornerRadius={4} />
          <Text x={8} y={5} text={`Zoom: ${(stageScale * 100).toFixed(0)}% | Grid: ${showGrid ? 'ON' : 'OFF'}`}
            fontSize={10} fontFamily="JetBrains Mono" fill="#CCC" />
        </Group>
      </Layer>
    </Stage>
  );
}

function isLightColor(hex: string): boolean {
  const rgb = parseInt(hex.replace('#', ''), 16);
  const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
