// ═══════════════════════════════════════════════════════════
// RoomScene3D — React Three Fiber 3D Room Visualization
// Phase 4: Full 3D rendering of room + furniture
// Synced with Zustand store (same data as 2D canvas)
// ═══════════════════════════════════════════════════════════

import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  RoundedBox,
  Text,
  Grid,
} from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import type { FurnitureItem, PlacedFurniture, WallOpening } from '../db/db';

// ─── Color Utility ───
function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

function lightenColor(hex: string, amount: number): string {
  const color = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  hsl.l = Math.min(1, hsl.l + amount);
  color.setHSL(hsl.h, hsl.s, hsl.l);
  return '#' + color.getHexString();
}

// ─── Room Geometry ───
function Room() {
  const room = useAppStore(s => s.currentDesign.room);
  const { width, depth, height, wallColor, floorColor, floorType } = room;

  // Material properties based on floor type
  const floorRoughness = useMemo(() => {
    switch (floorType) {
      case 'marble': return 0.1;
      case 'tile': return 0.3;
      case 'hardwood': return 0.5;
      case 'carpet': return 0.9;
      default: return 0.5;
    }
  }, [floorType]);

  const floorMetalness = floorType === 'marble' ? 0.1 : 0;

  const wallMaterial = useMemo(() => (
    <meshStandardMaterial
      color={wallColor}
      roughness={0.85}
      metalness={0}
      side={THREE.DoubleSide}
    />
  ), [wallColor]);

  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[width / 2, 0, depth / 2]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={floorRoughness}
          metalness={floorMetalness}
        />
      </mesh>

      {/* Back Wall (z = 0) */}
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        {wallMaterial}
      </mesh>

      {/* Left Wall (x = 0) */}
      <mesh
        position={[0, height / 2, depth / 2]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[depth, height]} />
        {wallMaterial}
      </mesh>

      {/* Right Wall (x = width) — slightly transparent for visibility */}
      <mesh
        position={[width, height / 2, depth / 2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.85}
          metalness={0}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Front Wall (z = depth) — transparent for camera viewing */}
      <mesh
        position={[width / 2, height / 2, depth]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.85}
          metalness={0}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Room edge lines for definition */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#B8A88A" transparent opacity={0.3} />
      </lineSegments>
      <mesh position={[width / 2, height / 2, depth / 2]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Baseboard trim */}
      <mesh position={[width / 2, 0.03, 0.01]}>
        <boxGeometry args={[width, 0.06, 0.02]} />
        <meshStandardMaterial color={lightenColor(wallColor, -0.15)} roughness={0.6} />
      </mesh>
      <mesh position={[0.01, 0.03, depth / 2]}>
        <boxGeometry args={[0.02, 0.06, depth]} />
        <meshStandardMaterial color={lightenColor(wallColor, -0.15)} roughness={0.6} />
      </mesh>

      {/* Doors & Windows (FR-ROOM-05) */}
      {(room.openings || []).map((op: WallOpening) => {
        const isDoor = op.type === 'door';
        const opH = op.height;
        const opW = op.width;
        const baseY = isDoor ? opH / 2 : height * 0.55;

        // Compute 3D position along the wall
        let pos: [number, number, number] = [0, 0, 0];
        let rot: [number, number, number] = [0, 0, 0];
        if (op.wall === 'north') {
          pos = [op.position, baseY, 0.01];
          rot = [0, 0, 0];
        } else if (op.wall === 'south') {
          pos = [op.position, baseY, depth - 0.01];
          rot = [0, Math.PI, 0];
        } else if (op.wall === 'west') {
          pos = [0.01, baseY, op.position];
          rot = [0, Math.PI / 2, 0];
        } else {
          pos = [width - 0.01, baseY, op.position];
          rot = [0, -Math.PI / 2, 0];
        }

        return (
          <group key={op.id} position={pos} rotation={rot}>
            {isDoor ? (
              <>
                {/* Door panel */}
                <mesh castShadow>
                  <boxGeometry args={[opW, opH, 0.04]} />
                  <meshStandardMaterial
                    color="#8B6914"
                    roughness={0.5}
                    metalness={0.1}
                  />
                </mesh>
                {/* Door handle */}
                <mesh position={[opW * 0.35, 0, 0.03]}>
                  <sphereGeometry args={[0.025, 8, 8]} />
                  <meshStandardMaterial color="#C49A3C" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Frame */}
                <mesh>
                  <boxGeometry args={[opW + 0.06, opH + 0.03, 0.05]} />
                  <meshStandardMaterial color="#6B4E1B" roughness={0.6} />
                </mesh>
              </>
            ) : (
              <>
                {/* Window glass */}
                <mesh>
                  <boxGeometry args={[opW, opH, 0.02]} />
                  <meshStandardMaterial
                    color="#87CEEB"
                    transparent
                    opacity={0.3}
                    roughness={0.05}
                    metalness={0.1}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Window frame */}
                <mesh>
                  <boxGeometry args={[opW + 0.04, opH + 0.04, 0.03]} />
                  <meshStandardMaterial color="#E8E0D4" roughness={0.5} />
                </mesh>
                {/* Center mullion */}
                <mesh>
                  <boxGeometry args={[0.02, opH, 0.025]} />
                  <meshStandardMaterial color="#E8E0D4" roughness={0.5} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ─── Furniture Shape Mapping ───
// Since we don't have GLB models yet, render category-appropriate shapes
function FurniturePiece({
  placed,
  item,
  isSelected,
  onSelect,
}: {
  placed: PlacedFurniture;
  item: FurnitureItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { width: w, height: h, depth: d } = item.dimensions;
  const scale = placed.scale;

  // Subtle hover glow animation for selected items
  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isSelected) {
      mat.emissiveIntensity = 0.08 + Math.sin(Date.now() * 0.003) * 0.04;
    } else {
      mat.emissiveIntensity = 0;
    }
  });

  // Position: place.x/z are in room coords, y is the vertical offset
  // In 3D, x stays x, z stays z, and y = half height (ground placement)
  const posX = placed.x;
  const posY = (h * scale) / 2;
  const posZ = placed.z;
  const rotY = -(placed.rotation * Math.PI) / 180;

  // Category-based shape rendering
  const renderShape = () => {
    const color = hexToThreeColor(placed.color);
    const emissive = isSelected ? new THREE.Color('#C49A3C') : new THREE.Color('#000000');

    switch (item.category) {
      case 'sofa':
        return (
          <group>
            {/* Seat base */}
            <RoundedBox
              ref={meshRef}
              args={[w * scale, h * scale * 0.45, d * scale]}
              radius={0.04}
              smoothness={4}
              castShadow
              receiveShadow
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <meshStandardMaterial
                color={color}
                roughness={0.7}
                metalness={0.05}
                emissive={emissive}
                emissiveIntensity={0}
              />
            </RoundedBox>
            {/* Back rest */}
            <RoundedBox
              args={[w * scale, h * scale * 0.55, d * scale * 0.25]}
              position={[0, h * scale * 0.25, -(d * scale) * 0.375]}
              radius={0.04}
              smoothness={4}
              castShadow
            >
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
            </RoundedBox>
            {/* Armrests */}
            <RoundedBox
              args={[w * scale * 0.08, h * scale * 0.35, d * scale * 0.7]}
              position={[-(w * scale) / 2 + (w * scale * 0.04), h * scale * 0.05, d * scale * 0.05]}
              radius={0.02}
              smoothness={4}
              castShadow
            >
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
            </RoundedBox>
            <RoundedBox
              args={[w * scale * 0.08, h * scale * 0.35, d * scale * 0.7]}
              position={[(w * scale) / 2 - (w * scale * 0.04), h * scale * 0.05, d * scale * 0.05]}
              radius={0.02}
              smoothness={4}
              castShadow
            >
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
            </RoundedBox>
          </group>
        );

      case 'chair':
        return (
          <group>
            {/* Seat */}
            <RoundedBox
              ref={meshRef}
              args={[w * scale, h * scale * 0.05, d * scale]}
              position={[0, h * scale * 0.05, 0]}
              radius={0.01}
              smoothness={4}
              castShadow
              receiveShadow
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <meshStandardMaterial
                color={color}
                roughness={0.5}
                metalness={0.1}
                emissive={emissive}
                emissiveIntensity={0}
              />
            </RoundedBox>
            {/* Back */}
            <RoundedBox
              args={[w * scale * 0.9, h * scale * 0.45, 0.03 * scale]}
              position={[0, h * scale * 0.3, -(d * scale) / 2 + 0.02]}
              radius={0.01}
              smoothness={4}
              castShadow
            >
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
            </RoundedBox>
            {/* Legs */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
              <mesh
                key={i}
                position={[
                  lx * (w * scale * 0.4),
                  -(h * scale * 0.22),
                  lz * (d * scale * 0.4),
                ]}
                castShadow
              >
                <cylinderGeometry args={[0.015 * scale, 0.015 * scale, h * scale * 0.5, 8]} />
                <meshStandardMaterial color={lightenColor(placed.color, -0.2)} roughness={0.4} metalness={0.3} />
              </mesh>
            ))}
          </group>
        );

      case 'dining_table':
      case 'side_table':
        return (
          <group>
            {/* Table top */}
            <RoundedBox
              ref={meshRef}
              args={[w * scale, 0.04 * scale, d * scale]}
              position={[0, h * scale * 0.05, 0]}
              radius={0.01}
              smoothness={4}
              castShadow
              receiveShadow
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <meshStandardMaterial
                color={color}
                roughness={0.35}
                metalness={0.05}
                emissive={emissive}
                emissiveIntensity={0}
              />
            </RoundedBox>
            {/* Legs */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
              <mesh
                key={i}
                position={[
                  lx * (w * scale * 0.42),
                  -(h * scale * 0.45),
                  lz * (d * scale * 0.42),
                ]}
                castShadow
              >
                <cylinderGeometry args={[0.025 * scale, 0.025 * scale, h * scale * 0.9, 8]} />
                <meshStandardMaterial color={lightenColor(placed.color, -0.15)} roughness={0.4} metalness={0.2} />
              </mesh>
            ))}
          </group>
        );

      case 'lamp':
        return (
          <group>
            {/* Base */}
            <mesh
              ref={meshRef}
              position={[0, -(h * scale) / 2 + 0.02 * scale, 0]}
              castShadow
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <cylinderGeometry args={[w * scale * 0.35, w * scale * 0.4, 0.04 * scale, 16]} />
              <meshStandardMaterial
                color={color}
                roughness={0.3}
                metalness={0.4}
                emissive={emissive}
                emissiveIntensity={0}
              />
            </mesh>
            {/* Pole */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.015 * scale, 0.015 * scale, h * scale * 0.7, 8]} />
              <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Shade */}
            <mesh position={[0, h * scale * 0.35, 0]}>
              <cylinderGeometry args={[w * scale * 0.12, w * scale * 0.3, h * scale * 0.22, 16, 1, true]} />
              <meshStandardMaterial
                color="#FFF8EB"
                roughness={0.8}
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Light glow */}
            <pointLight
              position={[0, h * scale * 0.3, 0]}
              color="#FFE4B5"
              intensity={0.6}
              distance={3}
              castShadow={false}
            />
          </group>
        );

      case 'shelf':
        const shelfCount = Math.max(2, Math.round(h / 0.4));
        return (
          <group>
            {/* Vertical sides */}
            <RoundedBox
              ref={meshRef}
              args={[0.025 * scale, h * scale, d * scale]}
              position={[-(w * scale) / 2 + 0.012 * scale, 0, 0]}
              radius={0.005}
              smoothness={2}
              castShadow
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <meshStandardMaterial
                color={color}
                roughness={0.5}
                metalness={0.05}
                emissive={emissive}
                emissiveIntensity={0}
              />
            </RoundedBox>
            <RoundedBox
              args={[0.025 * scale, h * scale, d * scale]}
              position={[(w * scale) / 2 - 0.012 * scale, 0, 0]}
              radius={0.005}
              smoothness={2}
              castShadow
            >
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
            </RoundedBox>
            {/* Shelves */}
            {Array.from({ length: shelfCount }).map((_, i) => (
              <RoundedBox
                key={i}
                args={[w * scale * 0.95, 0.02 * scale, d * scale]}
                position={[0, -(h * scale) / 2 + (h * scale / (shelfCount - 1)) * i, 0]}
                radius={0.005}
                smoothness={2}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
              </RoundedBox>
            ))}
            {/* Back panel */}
            <mesh position={[0, 0, -(d * scale) / 2 + 0.005]}>
              <boxGeometry args={[w * scale, h * scale, 0.008 * scale]} />
              <meshStandardMaterial color={lightenColor(placed.color, -0.1)} roughness={0.6} />
            </mesh>
          </group>
        );

      case 'decor':
        return (
          <group>
            {/* Pot */}
            <mesh
              ref={meshRef}
              position={[0, -(h * scale) / 2 + (h * scale * 0.12), 0]}
              castShadow
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <cylinderGeometry args={[w * scale * 0.2, w * scale * 0.15, h * scale * 0.25, 12]} />
              <meshStandardMaterial
                color="#A0522D"
                roughness={0.7}
                metalness={0}
                emissive={emissive}
                emissiveIntensity={0}
              />
            </mesh>
            {/* Foliage sphere */}
            <mesh position={[0, h * scale * 0.15, 0]} castShadow>
              <sphereGeometry args={[w * scale * 0.35, 16, 12]} />
              <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
            </mesh>
            {/* Additional smaller sphere for depth */}
            <mesh position={[w * scale * 0.12, h * scale * 0.28, w * scale * 0.08]} castShadow>
              <sphereGeometry args={[w * scale * 0.2, 12, 10]} />
              <meshStandardMaterial color={lightenColor(placed.color, 0.08)} roughness={0.85} />
            </mesh>
          </group>
        );

      default:
        // Generic box fallback
        return (
          <RoundedBox
            ref={meshRef}
            args={[w * scale, h * scale, d * scale]}
            radius={0.02}
            smoothness={4}
            castShadow
            receiveShadow
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            <meshStandardMaterial
              color={color}
              roughness={0.5}
              metalness={0.1}
              emissive={emissive}
              emissiveIntensity={0}
            />
          </RoundedBox>
        );
    }
  };

  return (
    <group
      position={[posX, posY, posZ]}
      rotation={[0, rotY, 0]}
    >
      {renderShape()}
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -posY + 0.005, 0]}>
          <ringGeometry args={[
            Math.max(w, d) * scale * 0.55,
            Math.max(w, d) * scale * 0.6,
            32,
          ]} />
          <meshBasicMaterial color="#C49A3C" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Label */}
      {isSelected && (
        <Text
          position={[0, (h * scale) / 2 + 0.15, 0]}
          fontSize={0.1}
          color="#C49A3C"
          anchorX="center"
          anchorY="bottom"
          font="https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriCZa4.woff2"
        >
          {item.name}
        </Text>
      )}
    </group>
  );
}

// ─── Scene Lighting ───
function SceneLighting({ roomWidth, roomDepth, roomHeight }: { roomWidth: number; roomDepth: number; roomHeight: number }) {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.4} color="#FFF8EB" />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[roomWidth * 0.8, roomHeight * 1.5, roomDepth * 0.8]}
        intensity={1.2}
        color="#FFFAF0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-roomWidth}
        shadow-camera-right={roomWidth}
        shadow-camera-top={roomDepth}
        shadow-camera-bottom={-roomDepth}
        shadow-camera-near={0.1}
        shadow-camera-far={roomHeight * 4}
        shadow-bias={-0.001}
      />

      {/* Warm fill from opposite direction */}
      <directionalLight
        position={[-roomWidth * 0.5, roomHeight, -roomDepth * 0.3]}
        intensity={0.3}
        color="#FFE4B5"
      />

      {/* Subtle blue-ish bounce light from floor */}
      <hemisphereLight
        args={['#FFF8EB', '#D4B896', 0.3]}
      />
    </>
  );
}

// ─── Main Scene Content ───
function SceneContent({ catalogueItems }: { catalogueItems: FurnitureItem[] }) {
  const room = useAppStore(s => s.currentDesign.room);
  const furniture = useAppStore(s => s.currentDesign.furniture);
  const selectedItemId = useAppStore(s => s.currentDesign.selectedItemId);
  const selectItem = useAppStore(s => s.selectItem);
  const theme = useAppStore(s => s.theme);

  return (
    <>
      {/* Lighting */}
      <SceneLighting
        roomWidth={room.width}
        roomDepth={room.depth}
        roomHeight={room.height}
      />

      {/* Environment map for reflections */}
      <Environment preset="apartment" />

      {/* Room geometry */}
      <Room />

      {/* Contact shadows on the floor */}
      <ContactShadows
        position={[room.width / 2, 0.001, room.depth / 2]}
        opacity={0.35}
        width={room.width * 1.5}
        height={room.depth * 1.5}
        blur={2}
        far={room.height * 2}
        color="#2C1810"
      />

      {/* Floor grid for spatial reference */}
      <Grid
        position={[room.width / 2, 0.002, room.depth / 2]}
        args={[room.width, room.depth]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor={theme === 'dark' ? '#554433' : '#D4C8B8'}
        sectionSize={1}
        sectionThickness={1}
        sectionColor={theme === 'dark' ? '#776655' : '#B8A88A'}
        fadeDistance={Math.max(room.width, room.depth) * 2}
        infiniteGrid={false}
      />

      {/* Furniture */}
      {furniture.map(placed => {
        const item = catalogueItems.find(i => i.id === placed.modelId);
        if (!item) return null;
        return (
          <FurniturePiece
            key={placed.id}
            placed={placed}
            item={item}
            isSelected={selectedItemId === placed.id}
            onSelect={() => selectItem(placed.id)}
          />
        );
      })}

      {/* Click empty space to deselect */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[room.width / 2, -0.01, room.depth / 2]}
        onClick={() => selectItem(null)}
        visible={false}
      >
        <planeGeometry args={[room.width * 3, room.depth * 3]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

// ─── Exported Component ───
interface RoomScene3DProps {
  catalogueItems: FurnitureItem[];
}

export default function RoomScene3D({ catalogueItems }: RoomScene3DProps) {
  const room = useAppStore(s => s.currentDesign.room);
  const theme = useAppStore(s => s.theme);

  // Camera position: slightly above and behind, looking at room center
  const cameraPos: [number, number, number] = [
    room.width * 1.2,
    room.height * 1.5,
    room.depth * 1.8,
  ];
  const cameraTarget: [number, number, number] = [
    room.width / 2,
    room.height * 0.3,
    room.depth / 2,
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{
          position: cameraPos,
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(180deg, #1A1210 0%, #0F0A06 100%)'
            : 'linear-gradient(180deg, #F0E6D3 0%, #E8DCC8 100%)',
        }}
      >
        <Suspense fallback={null}>
          <SceneContent catalogueItems={catalogueItems} />
        </Suspense>

        {/* OrbitControls — FR-3D-02, FR-3D-03, FR-3D-04 */}
        <OrbitControls
          target={cameraTarget}
          enableDamping
          dampingFactor={0.08}
          minDistance={1}
          maxDistance={Math.max(room.width, room.depth) * 4}
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={0.1}
          enablePan
          panSpeed={0.8}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
        />
      </Canvas>

      {/* 3D View HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          display: 'flex',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            color: '#DDD',
            letterSpacing: 0.3,
          }}
        >
          Orbit: Drag • Zoom: Scroll • Pan: Right-Click
        </div>
      </div>
    </div>
  );
}
