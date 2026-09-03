import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Worker, Zone, SafetyAlert } from '../../types/safety';

interface MineDigitalTwinProps {
  workers: Worker[];
  zones: Zone[];
  alerts?: SafetyAlert[];
  selectedWorkerId?: string;
  onSelectWorker?: (workerId: string) => void;
  fullScreen?: boolean;
}

// =============================================================================
// 1. REALISTIC CUTAWAY UNDERGROUND DRIFT (Tunnels, Steel Arch Ribs & Tracks)
// High-contrast charcoal/slate tones for clear visibility against light background
// =============================================================================
interface PassagewayProps {
  start: [number, number, number];
  end: [number, number, number];
  width?: number;
  hasTrack?: boolean;
  color?: string;
}

const UndergroundDrift: React.FC<PassagewayProps> = ({
  start,
  end,
  width = 3.2,
  hasTrack = true,
  color = '#1e2329',
}) => {
  const pStart = useMemo(() => new THREE.Vector3(...start), [start]);
  const pEnd = useMemo(() => new THREE.Vector3(...end), [end]);
  const distance = useMemo(() => pStart.distanceTo(pEnd), [pStart, pEnd]);
  const center = useMemo(() => pStart.clone().add(pEnd).multiplyScalar(0.5), [pStart, pEnd]);
  const direction = useMemo(() => pEnd.clone().sub(pStart).normalize(), [pStart, pEnd]);

  const orientation = useMemo(() => {
    const matrix = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    const adjustedUp = Math.abs(direction.y) > 0.99 ? new THREE.Vector3(0, 0, 1) : up;
    matrix.lookAt(pStart, pEnd, adjustedUp);
    return matrix;
  }, [pStart, pEnd, direction]);

  const rotation = useMemo(() => {
    const euler = new THREE.Euler();
    euler.setFromRotationMatrix(orientation);
    return euler;
  }, [orientation]);

  // Steel Arch Sets spaced every 2.4 units along drift
  const archCount = Math.floor(distance / 2.4);
  const archOffsets = useMemo(() => {
    const offsets: number[] = [];
    for (let i = 1; i < archCount; i++) {
      offsets.push(i * 2.4 - distance / 2);
    }
    return offsets;
  }, [archCount, distance]);

  // Railway ties along track
  const tieCount = Math.floor(distance / 0.9);
  const tieOffsets = useMemo(() => {
    const offsets: number[] = [];
    for (let i = 0; i <= tieCount; i++) {
      offsets.push(i * 0.9 - distance / 2);
    }
    return offsets;
  }, [tieCount, distance]);

  return (
    <group position={center} rotation={rotation}>
      {/* Tunnel Flat Floor with Dark Ballast Bed (High Contrast against Light CAD Canvas) */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[width, 0.12, distance]} />
        <meshStandardMaterial color="#1c2026" roughness={0.88} metalness={0.12} />
      </mesh>

      {/* Low Side Rib Walls (Defines subterranean corridor without blocking worker view) */}
      <mesh position={[-width / 2 + 0.05, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.7, distance]} />
        <meshStandardMaterial color={color} roughness={0.92} metalness={0.08} />
      </mesh>
      <mesh position={[width / 2 - 0.05, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.7, distance]} />
        <meshStandardMaterial color={color} roughness={0.92} metalness={0.08} />
      </mesh>

      {/* Mining Steel Arch Sets (Structural I-beam support ribs) */}
      {archOffsets.map((zOffset, idx) => (
        <group key={`arch-${idx}`} position={[0, 0, zOffset]}>
          {/* Arched Steel Crown */}
          <mesh position={[0, 0.6, 0]}>
            <torusGeometry args={[width / 2 - 0.08, 0.065, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Left Steel Leg */}
          <mesh position={[-width / 2 + 0.12, 0.25, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Right Steel Leg */}
          <mesh position={[width / 2 - 0.12, 0.25, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Caged Warm LED Work Lights along the drift */}
      {archOffsets.filter((_, idx) => idx % 2 === 0).map((zOffset, idx) => (
        <group key={`light-${idx}`} position={[0, width / 2 + 0.35, zOffset]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <pointLight color="#fef9c3" intensity={0.4} distance={4.5} />
        </group>
      ))}

      {/* Haulage Dual Steel Railway Track */}
      {hasTrack && (
        <group position={[0, 0.02, 0]}>
          {tieOffsets.map((zOffset, idx) => (
            <mesh key={`tie-${idx}`} position={[0, 0, zOffset]}>
              <boxGeometry args={[1.2, 0.05, 0.18]} />
              <meshStandardMaterial color="#26221c" roughness={0.9} />
            </mesh>
          ))}
          {/* Left Rail */}
          <mesh position={[-0.45, 0.05, 0]}>
            <boxGeometry args={[0.05, 0.05, distance]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Right Rail */}
          <mesh position={[0.45, 0.05, 0]}>
            <boxGeometry args={[0.05, 0.05, distance]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// =============================================================================
// 2. INDUSTRIAL BELT CONVEYOR (Zone B Drift)
// =============================================================================
const IndustrialConveyor: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
}> = ({ start, end }) => {
  const pStart = useMemo(() => new THREE.Vector3(...start), [start]);
  const pEnd = useMemo(() => new THREE.Vector3(...end), [end]);
  const distance = useMemo(() => pStart.distanceTo(pEnd), [pStart, pEnd]);
  const center = useMemo(() => pStart.clone().add(pEnd).multiplyScalar(0.5), [pStart, pEnd]);

  const orientation = useMemo(() => {
    const matrix = new THREE.Matrix4();
    matrix.lookAt(pStart, pEnd, new THREE.Vector3(0, 1, 0));
    return matrix;
  }, [pStart, pEnd]);

  const rotation = useMemo(() => {
    const euler = new THREE.Euler();
    euler.setFromRotationMatrix(orientation);
    return euler;
  }, [orientation]);

  // Support frames along the conveyor
  const frameCount = Math.floor(distance / 2.5);
  const frameOffsets = useMemo(() => {
    const offsets: number[] = [];
    for (let i = 0; i <= frameCount; i++) {
      offsets.push(i * 2.5 - distance / 2);
    }
    return offsets;
  }, [frameCount, distance]);

  // Extracted coal chunks riding on the belt
  const coalChunks = useMemo(() => {
    const chunks: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < Math.floor(distance * 1.5); i++) {
      chunks.push({
        pos: [(Math.random() - 0.5) * 0.35, 0.42, (Math.random() - 0.5) * distance],
        scale: 0.07 + Math.random() * 0.07,
      });
    }
    return chunks;
  }, [distance]);

  return (
    <group position={center} rotation={rotation}>
      {/* Conveyor Frame Stands & Idler Rollers */}
      {frameOffsets.map((zOffset, idx) => (
        <group key={`conveyor-frame-${idx}`} position={[0.7, 0, zOffset]}>
          <mesh position={[-0.35, 0.15, 0]}>
            <boxGeometry args={[0.05, 0.38, 0.05]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0.35, 0.15, 0]}>
            <boxGeometry args={[0.05, 0.38, 0.05]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.78, 0.05, 0.05]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Top Heavy Rubber Belt */}
      <mesh position={[0.7, 0.36, 0]}>
        <boxGeometry args={[0.65, 0.03, distance]} />
        <meshStandardMaterial color="#111317" roughness={0.8} />
      </mesh>

      {/* Coal Chunks */}
      {coalChunks.map((chunk, idx) => (
        <mesh key={`coal-${idx}`} position={[chunk.pos[0] + 0.7, chunk.pos[1], chunk.pos[2]]}>
          <dodecahedronGeometry args={[chunk.scale, 0]} />
          <meshStandardMaterial color="#090a0c" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
};

// =============================================================================
// 3. LONGWALL COAL EXTRACTION FACE (Zone C Face, Shields & Shearer)
// =============================================================================
const LongwallFace: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  return (
    <group position={position}>
      {/* Exposed Solid Black Coal Seam Face Wall */}
      <mesh position={[0, 0.6, 1.8]}>
        <boxGeometry args={[10.5, 1.8, 0.5]} />
        <meshStandardMaterial color="#090a0c" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* Armored Face Conveyor (AFC) */}
      <mesh position={[0, 0.1, 1.0]}>
        <boxGeometry args={[9.8, 0.18, 0.65]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Coal Shearer Mining Machine Body */}
      <group position={[1.2, 0.45, 1.0]}>
        <mesh>
          <boxGeometry args={[1.8, 0.5, 0.55]} />
          <meshStandardMaterial color="#c2410c" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Left Cutting Drum with Teeth */}
        <mesh position={[-1.3, 0.15, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.35, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Right Cutting Drum with Teeth */}
        <mesh position={[1.3, -0.05, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.35, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// =============================================================================
// 4. MAIN SHAFT HOIST (Zone A Subterranean Entry Point)
// =============================================================================
const VerticalHoistShaft: React.FC<{
  position: [number, number, number];
  height?: number;
}> = ({ position, height = 5.5 }) => {
  return (
    <group position={position}>
      {/* Concrete Shaft Lining Tube */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[1.6, 1.6, height, 24, 1, true]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.7}
          metalness={0.3}
          side={THREE.DoubleSide}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* Vertical Steel Guide Rails */}
      <mesh position={[-1.4, height / 2, 0]}>
        <boxGeometry args={[0.06, height, 0.06]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[1.4, height / 2, 0]}>
        <boxGeometry args={[0.06, height, 0.06]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      {/* Hoist Steel Cage Conveyance at Level 1 */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.5, 1.8, 1.3]} />
        <meshStandardMaterial color="#ca8a04" wireframe />
      </mesh>
    </group>
  );
};

// =============================================================================
// 5. PROMINENT 3D MINER FIGURE (Visually Obvious, Anchored on Floor)
// =============================================================================
interface MinerFigureProps {
  worker: Worker;
  isSelected: boolean;
  onSelect: () => void;
}

const HumanMinerFigure: React.FC<MinerFigureProps> = ({
  worker,
  isSelected,
  onSelect,
}) => {
  const statusColor = useMemo(() => {
    if (worker.status === 'critical') return '#A83D45';
    if (worker.status === 'attention') return '#B47A18';
    return '#2D8A61';
  }, [worker.status]);

  return (
    <group
      position={worker.coordinates}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Grounding Contact Shadow so workers stand out firmly on light CAD background */}
      <mesh position={[0, 0.008, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.52, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      {/* Ground Anchor Status Ring on the Tunnel Floor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.58, 24]} />
        <meshBasicMaterial
          color={statusColor}
          side={THREE.DoubleSide}
          transparent
          opacity={isSelected ? 0.98 : 0.85}
        />
      </mesh>

      {/* Selected Highlight Vertical Indicator Ring */}
      {isSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.72, 24]} />
          <meshBasicMaterial color="#176B4D" />
        </mesh>
      )}

      {/* 3D Human Miner Figure (Standing firmly on Floor) */}
      <group position={[0, 0, 0]}>
        {/* Safety Boots (Tan/Dark Leather) */}
        <mesh position={[-0.16, 0.12, 0.06]}>
          <boxGeometry args={[0.18, 0.22, 0.36]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        <mesh position={[0.16, 0.12, 0.06]}>
          <boxGeometry args={[0.18, 0.22, 0.36]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>

        {/* Industrial Navy Work Trousers */}
        <mesh position={[-0.16, 0.58, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.75, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
        <mesh position={[0.16, 0.58, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.75, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
        {/* Reflective Leg Stripes */}
        <mesh position={[-0.16, 0.45, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.05, 12]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        <mesh position={[0.16, 0.45, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.05, 12]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>

        {/* Heavy Duty Work Belt & Battery Pack */}
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.08, 14]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
        {/* Cap Lamp Battery Pack at Waist */}
        <mesh position={[0.22, 0.98, -0.15]}>
          <boxGeometry args={[0.12, 0.14, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* High-Vis Orange Safety Vest & Torso */}
        <mesh position={[0, 1.34, 0]}>
          <boxGeometry args={[0.48, 0.65, 0.32]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>

        {/* Silver Reflective Vest Harness Stripes */}
        <mesh position={[0, 1.48, 0.165]}>
          <boxGeometry args={[0.42, 0.045, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 1.25, 0.165]}>
          <boxGeometry args={[0.42, 0.045, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.14, 1.36, 0.165]}>
          <boxGeometry args={[0.045, 0.28, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.14, 1.36, 0.165]}>
          <boxGeometry args={[0.045, 0.28, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Left Arm & Protective Glove */}
        <mesh position={[-0.32, 1.26, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.085, 0.08, 0.52, 10]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
        <mesh position={[-0.36, 0.92, 0.02]}>
          <boxGeometry args={[0.1, 0.16, 0.1]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.7} />
        </mesh>

        {/* Right Arm & Protective Glove */}
        <mesh position={[0.32, 1.26, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.085, 0.08, 0.52, 10]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
        <mesh position={[0.36, 0.92, 0.02]}>
          <boxGeometry args={[0.1, 0.16, 0.1]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.7} />
        </mesh>

        {/* Neck & Face */}
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.12, 10]} />
          <meshStandardMaterial color="#e8b796" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.82, 0]}>
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshStandardMaterial color="#e8b796" roughness={0.8} />
        </mesh>

        {/* Yellow Safety Helmet with Cap Lamp */}
        <mesh position={[0, 1.94, 0]}>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#facc15" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Helmet Protective Brim */}
        <mesh position={[0, 1.91, 0.04]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.03, 16]} />
          <meshStandardMaterial color="#facc15" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* LED Cap Lamp Unit */}
        <mesh position={[0, 1.96, 0.23]}>
          <boxGeometry args={[0.08, 0.08, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.96, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Clean, Minimal Worker Identification Tag */}
      <Html position={[0, 2.45, 0]} center distanceFactor={14}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`cursor-pointer transition-transform select-none ${
            isSelected ? 'scale-110 z-40' : 'hover:scale-105 z-20'
          }`}
        >
          <div
            className={`px-2.5 py-1 rounded-lg border backdrop-blur-md flex items-center space-x-1.5 shadow-sm whitespace-nowrap text-xs transition-colors ${
              isSelected
                ? 'bg-white border-[#176B4D] ring-2 ring-[#176B4D]/30 text-[#151713]'
                : worker.status === 'critical'
                ? 'bg-[#FDF2F2] border-[#A83D45] text-[#A83D45]'
                : worker.status === 'attention'
                ? 'bg-[#FEF9E7] border-[#B47A18] text-[#B47A18]'
                : 'bg-white/95 border-[#DCDAD4] text-[#151713] hover:border-[#176B4D]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: statusColor }}
            />
            <div className="flex flex-col text-left leading-tight">
              <span className="font-serif font-bold text-[11px] text-[#151713]">
                {worker.name}
              </span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="font-mono text-[9px] text-[#666861]">
                  {worker.id}
                </span>
                <span
                  className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded uppercase ${
                    worker.status === 'critical'
                      ? 'bg-[#A83D45] text-white animate-pulse'
                      : worker.status === 'attention'
                      ? 'bg-[#FEF9E7] text-[#B47A18] border border-[#B47A18]/30'
                      : 'bg-[#EAF3EF] text-[#2D8A61]'
                  }`}
                >
                  {worker.status === 'critical'
                    ? 'CRITICAL'
                    : worker.status === 'attention'
                    ? 'ATTN'
                    : 'SAFE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

// =============================================================================
// 6. MAIN DIGITAL TWIN 3D CANVAS COMPONENT (Professional Engineering Site Plan)
// =============================================================================
export const MineDigitalTwin: React.FC<MineDigitalTwinProps> = ({
  workers,
  zones,
  selectedWorkerId,
  onSelectWorker,
  fullScreen = false,
}) => {
  const controlsRef = useRef<any>(null);
  const [activeZoneId, setActiveZoneId] = useState<string>('all');

  // Reset camera to show full subterranean mine overview
  const resetToOverview = () => {
    setActiveZoneId('all');
    if (controlsRef.current) {
      controlsRef.current.target.set(0, -2, 0);
      controlsRef.current.object.position.set(20, 18, 24);
      controlsRef.current.update();
    }
  };

  // Focus on a specific zone smoothly
  const focusZone = (coords: [number, number, number], zoneId: string) => {
    setActiveZoneId(zoneId);
    if (controlsRef.current) {
      controlsRef.current.target.set(coords[0], coords[1], coords[2]);
      controlsRef.current.object.position.set(
        coords[0] + 7,
        coords[1] + 9,
        coords[2] + 13
      );
      controlsRef.current.update();
    }
  };

  return (
    <div
      className={`relative w-full ${
        fullScreen ? 'h-[calc(100vh-140px)]' : 'h-[500px] sm:h-[620px]'
      } bg-[#F6F5F1] rounded-2xl overflow-hidden border border-[#DCDAD4] shadow-sm flex flex-col`}
    >
      {/* ==================== TOP FLOATING ZONE SELECTOR BUTTONS (ALL, ZONE A, ZONE B, ZONE C, ZONE D) ==================== */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#DCDAD4] shadow-sm">
        <button
          type="button"
          onClick={resetToOverview}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-xs ${
            activeZoneId === 'all'
              ? 'bg-[#176B4D] text-white'
              : 'bg-white hover:bg-[#FAF9F6] text-[#151713] border border-[#ECEBE6]'
          }`}
        >
          ALL
        </button>
        {zones.map((zone) => {
          const isZoneActive = activeZoneId === zone.id;
          const label = zone.shortCode || zone.name.split('—')[0].trim().toUpperCase();
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => focusZone(zone.coordinates, zone.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-xs ${
                isZoneActive
                  ? 'bg-[#176B4D] text-white'
                  : 'bg-white hover:bg-[#FAF9F6] text-[#151713] border border-[#ECEBE6]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ==================== MINIMAL BOTTOM LEGEND ONLY ==================== */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
        {/* Simple Status & Elements Legend */}
        <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DCDAD4] text-xs shadow-sm pointer-events-auto">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
            <span className="text-[#151713] font-medium">Safe</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B47A18]" />
            <span className="text-[#151713] font-medium">Attention</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A83D45]" />
            <span className="text-[#151713] font-medium">Critical</span>
          </div>

          <span className="h-3 w-px bg-[#DCDAD4]" />

          <div className="flex items-center space-x-3 text-[11px] text-[#666861]">
            <span>● Worker</span>
            <span>━ Tunnel</span>
            <span>━ Conveyor</span>
          </div>
        </div>

        {/* Personnel Count Badge */}
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#DCDAD4] text-xs shadow-sm pointer-events-auto">
          <span className="text-[#151713]">
            Active Underground: <strong>{workers.length} Personnel</strong>
          </span>
        </div>
      </div>

      {/* ==================== THREE.JS CANVAS (LIGHT INDUSTRIAL CAD AMBIENCE) ==================== */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [20, 18, 24], fov: 38 }}
          gl={{ antialias: true, alpha: false }}
        >
          {/* Professional Engineering Technical Drawing / CAD Background */}
          <color attach="background" args={['#F6F5F1']} />
          <fog attach="fog" args={['#F6F5F1', 35, 95]} />

          {/* Thin, subtle technical CAD grid on the lowest ground plane */}
          <gridHelper
            args={[80, 80, '#D1CFCA', '#E4E2DC']}
            position={[0, -4.05, 0]}
          />

          {/* Natural Industrial Engineering Lighting */}
          <ambientLight intensity={1.15} />
          <directionalLight position={[20, 35, 25]} intensity={1.3} />
          <directionalLight position={[-15, 20, -15]} intensity={0.5} color="#94a3b8" />

          <OrbitControls
            ref={controlsRef}
            target={[0, -2, 0]}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={6}
            maxDistance={75}
          />

          {/* 1. Main Hoist Shaft (Zone A Entry) */}
          <VerticalHoistShaft position={[-12, 0, -4]} height={5.5} />

          {/* 2. Underground Tunnels & Drifts (Dark Neutral Charcoal Cutaways for High Contrast) */}
          {/* Main Haulage Drift: Zone A (-12, 0, -4) to Zone B (-4, -2, 4) */}
          <UndergroundDrift
            start={[-12, 0, -4]}
            end={[-4, -2, 4]}
            width={3.2}
            hasTrack={true}
          />

          {/* Conveyor Drift: Zone B (-4, -2, 4) to Zone C (11, -4, 7) */}
          <UndergroundDrift
            start={[-4, -2, 4]}
            end={[11, -4, 7]}
            width={3.4}
            hasTrack={false}
          />
          <IndustrialConveyor start={[-4, -2, 4]} end={[11, -4, 7]} />

          {/* Longwall Coal Extraction Face Corridor: Zone C */}
          <LongwallFace position={[11, -4, 7]} />

          {/* Crosscut Return Airway: Zone C (11, -4, 7) to Zone D (6, -3, -10) */}
          <UndergroundDrift
            start={[11, -4, 7]}
            end={[6, -3, -10]}
            width={2.8}
            hasTrack={false}
          />

          {/* Return Airway back to Shaft: Zone D (6, -3, -10) to Shaft Station (-12, 0, -4) */}
          <UndergroundDrift
            start={[6, -3, -10]}
            end={[-12, 0, -4]}
            width={2.8}
            hasTrack={false}
          />

          {/* 3. Clean Zone Boundaries & Engineering CAD Labels */}
          {zones.map((zone) => {
            const isZoneActive = activeZoneId === zone.id;
            const label = zone.shortCode || zone.name.split('—')[0].trim().toUpperCase();
            return (
              <group key={zone.id} position={zone.coordinates}>
                {/* Boundary ring on tunnel floor */}
                <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[3.2, 3.45, 32]} />
                  <meshBasicMaterial
                    color={isZoneActive ? '#176B4D' : '#94a3b8'}
                    transparent
                    opacity={isZoneActive ? 0.9 : 0.4}
                  />
                </mesh>

                {/* 3D Zone Technical Tag Billboard */}
                <Html position={[0, 1.4, 0]} center distanceFactor={24}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      focusZone(zone.coordinates, zone.id);
                    }}
                    className={`cursor-pointer px-2 py-0.5 rounded-md border font-mono text-[9px] font-bold select-none transition-all shadow-2xs whitespace-nowrap ${
                      isZoneActive
                        ? 'bg-[#176B4D] text-white border-[#176B4D]'
                        : 'bg-white/95 text-[#151713] border-[#DCDAD4] hover:border-[#176B4D]'
                    }`}
                  >
                    {label}
                  </div>
                </Html>
              </group>
            );
          })}

          {/* 4. Human Miner Figures (Visually Prominent, Anchored on Tunnel Floor with subtle grounding) */}
          {workers.map((worker) => (
            <HumanMinerFigure
              key={worker.id}
              worker={worker}
              isSelected={worker.id === selectedWorkerId}
              onSelect={() => {
                if (onSelectWorker) onSelectWorker(worker.id);
              }}
            />
          ))}
        </Canvas>
      </div>
    </div>
  );
};
