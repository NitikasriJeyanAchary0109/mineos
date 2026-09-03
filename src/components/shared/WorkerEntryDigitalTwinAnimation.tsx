import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Radio,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// =============================================================================
// TIMELINE & SMOOTH INTERPOLATION UTILITIES
// =============================================================================
const CYCLE_DURATION = 18; // 18 seconds for buttery smooth playback

// Cubic smoothstep easing
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

// Linear interpolation between two 3D vectors
function vLerp(v1: [number, number, number], v2: [number, number, number], t: number): [number, number, number] {
  return [
    v1[0] + (v2[0] - v1[0]) * t,
    v1[1] + (v2[1] - v1[1]) * t,
    v1[2] + (v2[2] - v1[2]) * t,
  ];
}

export interface WorkerEntryProps {
  className?: string;
  autoPlay?: boolean;
}

// -----------------------------------------------------------------------------
// 1. REALISTIC 3D MINER FIGURE WITH NATURAL STRIDE & COMPLETE INDUSTRIAL PPE
// -----------------------------------------------------------------------------
interface WorkerModelProps {
  progress: number;
  isPlaying: boolean;
  missingPpe: boolean;
  activeScene: number;
}

const AnimatedWorker: React.FC<WorkerModelProps> = ({
  progress,
  isPlaying,
  missingPpe,
  activeScene,
}) => {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Smooth continuous Z path along the mine adit & haulage drift
  // Scene 1: 0.00 -> 0.20 : Surface approach (z: 8.5 -> 3.0)
  // Scene 2: 0.20 -> 0.38 : Entry Turnstile & Scan (z: 3.0 -> 1.5)
  // Scene 3: 0.38 -> 0.65 : Transition into Haulage Drift (z: 1.5 -> -6.5)
  // Scene 4: 0.65 -> 0.84 : Walking into Tunnel B-04 (z: -6.5 -> -12.0)
  // Scene 5: 0.84 -> 1.00 : Hero Stand for 3D Holographic PPE Inspection (z: -12.0)
  const workerZ = useMemo(() => {
    if (progress < 0.2) {
      const t = smoothstep(0, 0.2, progress);
      return 8.5 - t * 5.5;
    } else if (progress < 0.38) {
      const t = smoothstep(0.2, 0.38, progress);
      return 3.0 - t * 1.5;
    } else if (progress < 0.65) {
      const t = smoothstep(0.38, 0.65, progress);
      return 1.5 - t * 8.0;
    } else if (progress < 0.84) {
      const t = smoothstep(0.65, 0.84, progress);
      return -6.5 - t * 5.5;
    } else {
      return -12.0;
    }
  }, [progress]);

  // Subtle lateral alignment along turnout curve
  const workerX = useMemo(() => {
    if (progress < 0.62) return 0;
    if (progress < 0.84) {
      const t = (progress - 0.62) / 0.22;
      return Math.sin(t * Math.PI) * 0.35;
    }
    return 0;
  }, [progress]);

  // Natural walking kinematics: hip bobbing, leg stride, and arm swing
  useFrame(({ clock }) => {
    const isMoving = isPlaying && progress < 0.84;
    const time = clock.getElapsedTime() * 7.5;
    const swing = isMoving ? Math.sin(time) * 0.5 : 0;
    const hipBob = isMoving ? Math.abs(Math.sin(time)) * 0.03 : 0;

    if (bodyRef.current) {
      bodyRef.current.position.y = hipBob;
    }
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.65;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.65;
  });

  const distanceFromJunction = (
    progress > 0.65 ? 12.0 + (progress - 0.65) * 140 : Math.max(0, (1 - progress) * 25)
  ).toFixed(1);

  // Scanning laser curtain elevation during Scene 2
  const scanCurtainY = 0.25 + (Math.sin(progress * 38) * 0.5 + 0.5) * 1.85;

  return (
    <group position={[workerX, 0, workerZ]}>
      {/* Soft Contact Disc Shadow Grounding Worker */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Ground Anchor Status Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.56, 32]} />
        <meshBasicMaterial
          color={missingPpe && activeScene === 5 ? '#A83D45' : '#2D8A61'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* ==================== SCENE 2: BIOMETRIC SCANNING EFFECT ==================== */}
      {activeScene === 2 && (
        <group position={[0, 0, 0]}>
          {/* Glowing emerald laser scan plane */}
          <mesh position={[0, scanCurtainY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.62, 0.72, 32]} />
            <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, scanCurtainY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.62, 32]} />
            <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} transparent opacity={0.12} />
          </mesh>

          {/* Clean Industrial Identification Marker */}
          <Html position={[0, 2.65, 0]} center distanceFactor={11}>
            <div className="bg-white/95 border border-[#176B4D] rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-left font-mono min-w-[230px] select-none animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-[#176B4D] flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#176B4D] animate-pulse" />
                  <span>BIOMETRIC RFID VERIFIED</span>
                </span>
                <span className="text-[9px] bg-[#EAF3EF] text-[#176B4D] font-bold px-2 py-0.5 rounded-full border border-[#176B4D]/20">
                  PORTAL 01
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#151713] flex items-center justify-between">
                  <span>WORKER ID:</span>
                  <span className="text-[#176B4D] font-bold">MW-024</span>
                </div>
                <div className="text-[11px] text-[#151713] flex items-center justify-between">
                  <span>PERSONNEL:</span>
                  <span className="font-semibold">Deepika Acharya</span>
                </div>
                <div className="text-[11px] text-[#2D8A61] flex items-center justify-between font-semibold">
                  <span>STATUS:</span>
                  <span>VERIFIED ✓</span>
                </div>
                <div className="text-[11px] text-[#176B4D] flex items-center justify-between font-semibold">
                  <span>PPE COMPLIANCE:</span>
                  <span>4/4 MANDATORY</span>
                </div>
                <div className="text-[10px] text-[#666861] pt-1 border-t border-[#ECEBE6] flex items-center justify-between">
                  <span>LOCATION:</span>
                  <span className="font-semibold text-[#151713]">SURFACE ENTRY GATE</span>
                </div>
              </div>
            </div>
          </Html>
        </group>
      )}

      {/* ==================== SCENE 4: EXACT WORKER LOCATION MARKER ==================== */}
      {activeScene === 4 && (
        <Html position={[0, 2.7, 0]} center distanceFactor={13}>
          <div className="bg-[#151713]/95 border border-[#2D8A61] text-white rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md font-mono text-left select-none whitespace-nowrap min-w-[220px]">
            <div className="flex items-center space-x-2 text-[#2DD4BF] text-xs font-bold mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] animate-ping" />
              <span>● MW-024 · DEEPIKA ACHARYA</span>
            </div>
            <div className="text-[11px] font-bold text-white tracking-wide">
              LEVEL 2 // TUNNEL B-04
            </div>
            <div className="text-[10px] text-[#A3A199] mt-0.5">
              {distanceFromJunction} m FROM EAST JUNCTION
            </div>
            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-[#2DD4BF]">
              <span>CH4: 0.02% (SAFE)</span>
              <span>HR: 74 BPM</span>
              <span>LORA: -68 dBm</span>
            </div>
          </div>
        </Html>
      )}

      {/* ==================== SCENE 5: 3D HOLOGRAPHIC PPE STATUS ==================== */}
      {activeScene === 5 && (
        <group position={[0, 0, 0]}>
          {/* Head & Helmet Holographic Wireframe Bracket */}
          <mesh position={[0, 1.95, 0]}>
            <boxGeometry args={[0.54, 0.44, 0.54]} />
            <meshBasicMaterial
              color={missingPpe ? '#A83D45' : '#2D8A61'}
              wireframe
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Torso & High-Vis Vest Bracket */}
          <mesh position={[0, 1.34, 0]}>
            <boxGeometry args={[0.6, 0.72, 0.42]} />
            <meshBasicMaterial color="#2D8A61" wireframe transparent opacity={0.5} />
          </mesh>

          {/* Left & Right Protective Gloves Brackets */}
          <mesh position={[-0.38, 0.92, 0.02]}>
            <boxGeometry args={[0.2, 0.24, 0.2]} />
            <meshBasicMaterial color="#2D8A61" wireframe transparent opacity={0.5} />
          </mesh>
          <mesh position={[0.38, 0.92, 0.02]}>
            <boxGeometry args={[0.2, 0.24, 0.2]} />
            <meshBasicMaterial color="#2D8A61" wireframe transparent opacity={0.5} />
          </mesh>

          {/* Steel-Toe Boots Bracket */}
          <mesh position={[0, 0.14, 0.06]}>
            <boxGeometry args={[0.62, 0.28, 0.52]} />
            <meshBasicMaterial color="#2D8A61" wireframe transparent opacity={0.5} />
          </mesh>

          {/* Floating Minimal PPE Status HUD Card */}
          <Html position={[0, 2.75, 0]} center distanceFactor={12}>
            <div className="bg-white/95 border border-[#DCDAD4] rounded-2xl p-4 shadow-2xl backdrop-blur-md text-left font-mono min-w-[240px] select-none">
              <div className="flex items-center justify-between border-b border-[#ECEBE6] pb-2 mb-2.5">
                <span className="text-[11px] font-bold text-[#151713] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#176B4D]" />
                  <span>3D PPE TELEMETRY</span>
                </span>
                <span className="text-[9px] bg-[#FAF9F6] text-[#666861] px-2 py-0.5 rounded-full border border-[#DCDAD4] font-bold">
                  MW-024
                </span>
              </div>

              {/* Individual Item Badges */}
              <div className="space-y-1.5 text-[11px]">
                {/* 1. HELMET */}
                <div
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-colors ${
                    missingPpe
                      ? 'bg-[#FDF2F2] border-[#A83D45]/40 text-[#A83D45] font-bold'
                      : 'bg-[#EAF3EF] border-[#2D8A61]/30 text-[#2D8A61] font-semibold'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span>{missingPpe ? '✗' : '✓'}</span>
                    <span>HELMET (CAP LAMP)</span>
                  </span>
                  <span className="font-bold">{missingPpe ? 'MISSING' : 'OK'}</span>
                </div>

                {/* 2. REFLECTIVE VEST */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EAF3EF] border border-[#2D8A61]/30 text-[#2D8A61] font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <span>✓</span>
                    <span>SAFETY VEST (CLASS 3)</span>
                  </span>
                  <span className="font-bold">OK</span>
                </div>

                {/* 3. SAFETY BOOTS */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EAF3EF] border border-[#2D8A61]/30 text-[#2D8A61] font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <span>✓</span>
                    <span>STEEL-TOE BOOTS</span>
                  </span>
                  <span className="font-bold">OK</span>
                </div>

                {/* 4. PROTECTIVE GLOVES */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#EAF3EF] border border-[#2D8A61]/30 text-[#2D8A61] font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <span>✓</span>
                    <span>CUT-RESISTANT GLOVES</span>
                  </span>
                  <span className="font-bold">OK</span>
                </div>
              </div>

              {/* Statutory Missing PPE Warning Alert */}
              {missingPpe && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-[#A83D45] text-white text-[11px] font-sans font-semibold flex items-center space-x-2 shadow-sm animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <div className="font-bold">⚠ PPE ALERT: NON-COMPLIANT</div>
                    <div className="text-[10px] text-white/90">Missing: Safety Helmet</div>
                  </div>
                </div>
              )}
            </div>
          </Html>
        </group>
      )}

      {/* ==================== 3D MINER MESH RIG ==================== */}
      <group ref={bodyRef}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.16, 0.95, 0]}>
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.11, 0.12, 0.75, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Reflective Band on Calf */}
          <mesh position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.125, 0.125, 0.05, 14]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          {/* Left Boot */}
          <mesh position={[0, -0.84, 0.08]}>
            <boxGeometry args={[0.18, 0.22, 0.36]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.16, 0.95, 0]}>
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.11, 0.12, 0.75, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Reflective Band on Calf */}
          <mesh position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.125, 0.125, 0.05, 14]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          {/* Right Boot */}
          <mesh position={[0, -0.84, 0.08]}>
            <boxGeometry args={[0.18, 0.22, 0.36]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
        </group>

        {/* Industrial Belt & Cap Lamp Battery Pack */}
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.08, 16]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
        <mesh position={[0.22, 0.98, -0.15]}>
          <boxGeometry args={[0.12, 0.14, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* Torso & High-Vis Orange Safety Vest */}
        <mesh position={[0, 1.34, 0]}>
          <boxGeometry args={[0.48, 0.65, 0.32]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>

        {/* Dual Silver Reflective Stripes */}
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
        <group ref={leftArmRef} position={[-0.32, 1.58, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.085, 0.08, 0.52, 12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.66, 0.02]}>
            <boxGeometry args={[0.1, 0.16, 0.1]} />
            <meshStandardMaterial color="#2563eb" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Arm & Protective Glove */}
        <group ref={rightArmRef} position={[0.32, 1.58, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.085, 0.08, 0.52, 12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.66, 0.02]}>
            <boxGeometry args={[0.1, 0.16, 0.1]} />
            <meshStandardMaterial color="#2563eb" roughness={0.7} />
          </mesh>
        </group>

        {/* Head & Neck */}
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.12, 12]} />
          <meshStandardMaterial color="#e8b796" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.82, 0]}>
          <sphereGeometry args={[0.17, 18, 18]} />
          <meshStandardMaterial color="#e8b796" roughness={0.8} />
        </mesh>

        {/* Yellow Hard Hat with Cap Lamp (Hidden if missingPpe is true during Scene 5 alert) */}
        {(!missingPpe || activeScene !== 5) && (
          <group position={[0, 1.94, 0]}>
            {/* Dome */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.22, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#facc15" roughness={0.35} metalness={0.2} />
            </mesh>
            {/* Brim */}
            <mesh position={[0, -0.03, 0.04]} rotation={[0.15, 0, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 0.03, 18]} />
              <meshStandardMaterial color="#facc15" roughness={0.35} metalness={0.2} />
            </mesh>
            {/* LED Headlamp Unit */}
            <mesh position={[0, 0.02, 0.23]}>
              <boxGeometry args={[0.08, 0.08, 0.06]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.02, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.02, 14]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Directional Headlamp Spotlight Beam */}
            <spotLight
              position={[0, 0.02, 0.28]}
              target-position={[0, -0.4, 5.0]}
              intensity={1.4}
              distance={9}
              angle={0.42}
              penumbra={0.3}
              color="#ffffff"
            />
          </group>
        )}
      </group>
    </group>
  );
};

// -----------------------------------------------------------------------------
// 2. MOVEMENT BREADCRUMB HISTORY TRAIL (Scene 3, 4, 5)
// -----------------------------------------------------------------------------
interface BreadcrumbTrailProps {
  progress: number;
  activeScene: number;
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({ progress, activeScene }) => {
  if (activeScene < 3) return null;

  const points = [
    [0, 0.03, 1.5],
    [0, 0.03, -1.0],
    [0, 0.03, -3.5],
    [0.12, 0.03, -6.5],
    [0.18, 0.03, -9.0],
    [0, 0.03, -12.0],
  ];

  const visibleCount = progress < 0.65 ? 3 : progress < 0.84 ? 5 : 6;
  const currentPoints = points.slice(0, visibleCount);

  return (
    <group>
      {currentPoints.map((pt, i) => (
        <group key={i} position={[pt[0], pt[1], pt[2]]}>
          {/* Subtle Glowing Dot */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#2DD4BF" />
          </mesh>
          {/* Connecting Trail Line */}
          {i < currentPoints.length - 1 && (
            <mesh
              position={[
                (currentPoints[i + 1][0] - pt[0]) / 2,
                0,
                (currentPoints[i + 1][2] - pt[2]) / 2,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.035, Math.abs(currentPoints[i + 1][2] - pt[2])]} />
              <meshBasicMaterial color="#2DD4BF" transparent opacity={0.45} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// -----------------------------------------------------------------------------
// 3. REALISTIC SURFACE MINE PORTAL & ADIT ENTRANCE (Scene 1 & 2)
// -----------------------------------------------------------------------------
const MineEntrancePortal: React.FC = () => {
  return (
    <group position={[0, 0, 2.5]}>
      {/* Terraced Hillside Sandstone & Shale Outcrop Strata */}
      <mesh position={[-4.0, 2.6, 0]}>
        <boxGeometry args={[4.8, 5.8, 1.8]} />
        <meshStandardMaterial color="#4A443E" roughness={0.95} />
      </mesh>
      <mesh position={[4.0, 2.6, 0]}>
        <boxGeometry args={[4.8, 5.8, 1.8]} />
        <meshStandardMaterial color="#4A443E" roughness={0.95} />
      </mesh>
      {/* Portal Overhead Crown Strata */}
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[4.6, 2.2, 1.8]} />
        <meshStandardMaterial color="#3F3934" roughness={0.95} />
      </mesh>

      {/* Surface Approach Ground with Road Surface */}
      <mesh position={[0, -0.05, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#7E7568" roughness={0.9} />
      </mesh>

      {/* Heavy Timber Portal Framing with Steel Gussets */}
      <mesh position={[-1.75, 1.8, 0.1]}>
        <boxGeometry args={[0.32, 3.8, 0.32]} />
        <meshStandardMaterial color="#2A1810" roughness={0.85} />
      </mesh>
      <mesh position={[1.75, 1.8, 0.1]}>
        <boxGeometry args={[0.32, 3.8, 0.32]} />
        <meshStandardMaterial color="#2A1810" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.65, 0.1]}>
        <boxGeometry args={[3.8, 0.35, 0.32]} />
        <meshStandardMaterial color="#2A1810" roughness={0.85} />
      </mesh>

      {/* Diagonal Yellow/Black Warning Lintel */}
      <mesh position={[0, 3.88, 0.28]}>
        <boxGeometry args={[3.6, 0.18, 0.04]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>

      {/* Industrial Gantry Signage */}
      <mesh position={[0, 4.25, 0.32]}>
        <boxGeometry args={[3.2, 0.45, 0.05]} />
        <meshStandardMaterial color="#1C2026" />
      </mesh>
      <Html position={[0, 4.25, 0.38]} center distanceFactor={13}>
        <div className="font-mono text-[9px] tracking-wider text-[#F6F5F1] font-bold whitespace-nowrap uppercase px-2.5 py-0.5 bg-[#176B4D] border border-white/20 rounded shadow-xs">
          PORTAL 01 // ADIT ACCESS // DGMS RULE 181
        </div>
      </Html>

      {/* Overhead Entry Luminaire */}
      <pointLight position={[0, 3.4, 0.45]} intensity={1.8} distance={8} color="#FFF8E7" />
      <mesh position={[0, 3.45, 0.25]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 12]} />
        <meshBasicMaterial color="#FFF8E7" />
      </mesh>

      {/* Access Gate Stanchions & Turnstiles at z = -0.6 (World z = 1.9) */}
      <group position={[0, 0, -0.6]}>
        <mesh position={[-1.1, 0.6, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[-1.1, 1.25, 0]}>
          <boxGeometry args={[0.18, 0.22, 0.14]} />
          <meshStandardMaterial color="#176B4D" />
        </mesh>

        <mesh position={[1.1, 0.6, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[1.1, 1.25, 0]}>
          <boxGeometry args={[0.18, 0.22, 0.14]} />
          <meshStandardMaterial color="#176B4D" />
        </mesh>

        {/* Floor Entry Demarcation Strip */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 0.1]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>
    </group>
  );
};

// -----------------------------------------------------------------------------
// 4. VAULTED UNDERGROUND MINE NETWORK & DIGITAL TWIN (Scene 3, 4, 5)
// -----------------------------------------------------------------------------
const DigitalTwinMineNetwork: React.FC = () => {
  return (
    <group>
      {/* CAD Ground Grid */}
      <gridHelper args={[70, 70, '#D1CFCA', '#E4E2DC']} position={[0, -0.05, -10]} />

      {/* Main Vaulted Haulage Drift (z: 2 to -26) */}
      <group position={[0, 0, -10]}>
        {/* Ballast Gravel Floor */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 32]} />
          <meshStandardMaterial color="#181B1F" roughness={0.95} />
        </mesh>

        {/* Wooden Rail Sleepers / Ties spaced along track */}
        {Array.from({ length: 38 }).map((_, i) => (
          <mesh key={i} position={[0, 0.02, -15 + i * 0.8]}>
            <boxGeometry args={[1.4, 0.04, 0.18]} />
            <meshStandardMaterial color="#3E2723" roughness={0.9} />
          </mesh>
        ))}

        {/* Steel Rails */}
        <mesh position={[-0.45, 0.055, 0]}>
          <boxGeometry args={[0.045, 0.05, 32]} />
          <meshStandardMaterial color="#64748B" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0.45, 0.055, 0]}>
          <boxGeometry args={[0.045, 0.05, 32]} />
          <meshStandardMaterial color="#64748B" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Textured Coal Rib Walls */}
        <mesh position={[-1.75, 1.5, 0]}>
          <boxGeometry args={[0.2, 3.0, 32]} />
          <meshStandardMaterial color="#1C2026" roughness={0.95} />
        </mesh>
        <mesh position={[1.75, 1.5, 0]}>
          <boxGeometry args={[0.2, 3.0, 32]} />
          <meshStandardMaterial color="#1C2026" roughness={0.95} />
        </mesh>

        {/* Structural Curved Steel Arches (Colliery Arch Canopy Sets) */}
        {[-14, -10, -6, -2, 2, 6, 10, 14].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Column Leg */}
            <mesh position={[-1.6, 1.5, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 3.0, 10]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            {/* Right Column Leg */}
            <mesh position={[1.6, 1.5, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 3.0, 10]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            {/* Curved Overhead Arch Crossbeam */}
            <mesh position={[0, 3.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, 3.2, 10]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>

            {/* Ceiling Industrial LED Bulkhead Lamp */}
            <pointLight position={[0, 2.9, 0]} intensity={0.75} distance={7} color="#FFF5EB" />
            <mesh position={[0, 2.95, 0]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Overhead Flexible Yellow Ventilation Bag along Tunnel Crown */}
        <mesh position={[-0.85, 2.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 32, 14]} />
          <meshStandardMaterial color="#EAB308" roughness={0.5} />
        </mesh>

        {/* Utility Pipeline Service Rack along Right Wall */}
        <mesh position={[1.6, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 32, 8]} />
          <meshStandardMaterial color="#FACC15" metalness={0.5} />
        </mesh>
        <mesh position={[1.6, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 32, 8]} />
          <meshStandardMaterial color="#2563EB" metalness={0.5} />
        </mesh>
      </group>

      {/* Branching Crosscut Tunnel B-04 to the East */}
      <group position={[6.5, 0, -11]}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 2.8]} />
          <meshStandardMaterial color="#181B1F" roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.3, -1.45]}>
          <boxGeometry args={[10, 2.6, 0.15]} />
          <meshStandardMaterial color="#1C2026" />
        </mesh>
        <mesh position={[0, 1.3, 1.45]}>
          <boxGeometry args={[10, 2.6, 0.15]} />
          <meshStandardMaterial color="#1C2026" />
        </mesh>

        {/* Industrial Belt Conveyor with Coal Flow */}
        <mesh position={[0, 0.45, 0.65]}>
          <boxGeometry args={[9.5, 0.1, 0.65]} />
          <meshStandardMaterial color="#111317" roughness={0.9} />
        </mesh>
        {/* Conveyor Idler Frames */}
        {[-3.5, 0, 3.5].map((xP, i) => (
          <mesh key={i} position={[xP, 0.22, 0.65]}>
            <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        ))}
      </group>

      {/* Branching Extraction Drift towards Longwall Face (West) */}
      <group position={[-6.0, 0, -6]}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9, 2.6]} />
          <meshStandardMaterial color="#181B1F" roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.3, -1.35]}>
          <boxGeometry args={[9, 2.6, 0.15]} />
          <meshStandardMaterial color="#1C2026" />
        </mesh>
      </group>

      {/* Deep Longwall Coal Seam & Shearer (-10.5, 0, -6) */}
      <group position={[-10.5, 0, -6]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.6, 3.0, 6.0]} />
          <meshStandardMaterial color="#0A0B0E" roughness={0.98} />
        </mesh>
        <mesh position={[0.45, 0.75, 0.5]}>
          <boxGeometry args={[0.7, 0.8, 1.8]} />
          <meshStandardMaterial color="#C2410C" roughness={0.5} />
        </mesh>
      </group>

      {/* CAD 3D Spatial Zone Billboards */}
      <group position={[0, 3.8, 0]}>
        <Html center distanceFactor={14}>
          <div className="px-2.5 py-0.5 rounded-lg border border-[#176B4D] bg-white/95 text-[#176B4D] font-mono text-[9px] font-bold shadow-xs whitespace-nowrap">
            ZONE A // SURFACE ADIT (LEVEL 0 · 0m)
          </div>
        </Html>
      </group>

      <group position={[4.5, 3.5, -11]}>
        <Html center distanceFactor={14}>
          <div className="px-2.5 py-0.5 rounded-lg border border-[#176B4D] bg-white/95 text-[#176B4D] font-mono text-[9px] font-bold shadow-xs whitespace-nowrap">
            ZONE B // TUNNEL B-04 (LEVEL 2 · -260m)
          </div>
        </Html>
      </group>

      <group position={[-8.5, 3.5, -6]}>
        <Html center distanceFactor={14}>
          <div className="px-2.5 py-0.5 rounded-lg border border-[#176B4D] bg-white/95 text-[#176B4D] font-mono text-[9px] font-bold shadow-xs whitespace-nowrap">
            ZONE C // LONGWALL FACE (LEVEL 4 · -440m)
          </div>
        </Html>
      </group>

      {/* Secondary Background Personnel Markers */}
      <group position={[7.5, 0, -11]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 16]} />
          <meshBasicMaterial color="#2D8A61" />
        </mesh>
        <Html position={[0, 1.8, 0]} center distanceFactor={18}>
          <div className="bg-white/90 border border-[#DCDAD4] px-2 py-0.5 rounded text-[8px] font-mono text-[#666861] whitespace-nowrap">
            WM-4812 · RAVI (SAFE)
          </div>
        </Html>
      </group>

      <group position={[-9.0, 0, -5]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 16]} />
          <meshBasicMaterial color="#2D8A61" />
        </mesh>
        <Html position={[0, 1.8, 0]} center distanceFactor={18}>
          <div className="bg-white/90 border border-[#DCDAD4] px-2 py-0.5 rounded text-[8px] font-mono text-[#666861] whitespace-nowrap">
            WM-8492 · VIKRAM (SAFE)
          </div>
        </Html>
      </group>
    </group>
  );
};

// -----------------------------------------------------------------------------
// 5. CINEMATIC CAMERA CONTROLLER WITH SMOOTHSTEP CONTINUOUS INTERPOLATION
// -----------------------------------------------------------------------------
interface CameraControllerProps {
  progress: number;
}

const CameraController: React.FC<CameraControllerProps> = ({ progress }) => {
  useFrame(({ camera }) => {
    let targetPos: [number, number, number];
    let targetLook: [number, number, number];

    if (progress < 0.2) {
      // Scene 1: Outside entrance, following approaching worker
      const t = smoothstep(0, 0.2, progress);
      targetPos = vLerp([2.2, 1.8, 9.5], [1.8, 1.85, 6.2], t);
      targetLook = vLerp([0, 1.3, 4.5], [0, 1.35, 2.8], t);
    } else if (progress < 0.38) {
      // Scene 2: Entry Turnstile Gate Verification
      const t = smoothstep(0.2, 0.38, progress);
      targetPos = vLerp([1.8, 1.85, 6.2], [1.7, 1.85, 3.6], t);
      targetLook = vLerp([0, 1.35, 2.8], [0, 1.35, 1.4], t);
    } else if (progress < 0.65) {
      // Scene 3: Pull back & elevate into MineOS Digital Twin isometric overview
      const t = smoothstep(0.38, 0.65, progress);
      targetPos = vLerp([1.7, 1.85, 3.6], [5.8, 6.2, -4.5], t);
      targetLook = vLerp([0, 1.35, 1.4], [-1.2, 1.0, -6.5], t);
    } else if (progress < 0.84) {
      // Scene 4: Zoom into exact worker location in Tunnel B-04
      const t = smoothstep(0.65, 0.84, progress);
      targetPos = vLerp([5.8, 6.2, -4.5], [1.5, 2.1, -9.2], t);
      targetLook = vLerp([-1.2, 1.0, -6.5], [0.1, 1.35, -11.5], t);
    } else {
      // Scene 5: Close-up 3D Holographic PPE Status Inspection
      targetPos = [1.2, 1.75, -9.5];
      targetLook = [0, 1.4, -12.0];
    }

    const tVec = new THREE.Vector3(...targetPos);
    const lVec = new THREE.Vector3(...targetLook);

    // Smooth lerp camera movement with zero snapping
    camera.position.lerp(tVec, 0.065);
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const targetDirection = lVec.clone().sub(camera.position).normalize();
    currentLook.lerp(targetDirection, 0.065);
    camera.lookAt(camera.position.clone().add(currentLook));
  });

  return null;
};

// =============================================================================
// MAIN COMPONENT EXPORT
// =============================================================================
export const WorkerEntryDigitalTwinAnimation: React.FC<WorkerEntryProps> = ({
  className = '',
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [progress, setProgress] = useState<number>(0.05);
  const [missingPpe, setMissingPpe] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Active scene calculation (1 to 5)
  const activeScene = useMemo(() => {
    if (progress < 0.2) return 1;
    if (progress < 0.38) return 2;
    if (progress < 0.65) return 3;
    if (progress < 0.84) return 4;
    return 5;
  }, [progress]);

  // Main animation timer tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.05 / CYCLE_DURATION;
        return next >= 1.0 ? 0.0 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Jump to specific scene
  const handleJumpToScene = (sceneNum: number) => {
    if (sceneNum === 1) setProgress(0.05);
    if (sceneNum === 2) setProgress(0.28);
    if (sceneNum === 3) setProgress(0.52);
    if (sceneNum === 4) setProgress(0.72);
    if (sceneNum === 5) setProgress(0.92);
  };

  return (
    <div
      className={`rounded-2xl border border-[#DCDAD4] bg-white/90 backdrop-blur-md shadow-sm overflow-hidden flex flex-col transition-all ${
        isExpanded ? 'fixed inset-4 z-50 max-w-none shadow-2xl' : 'w-full max-w-xl'
      } ${className}`}
    >
      {/* 1. Industrial Header Bar */}
      <div className="px-4 py-3 border-b border-[#EDECE7] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#176B4D] animate-pulse" />
          <div>
            <div className="font-mono text-[11px] font-bold text-[#151713] tracking-wide">
              SUBTERRANEAN ENTRY TELEMETRY // 3D DIGITAL TWIN
            </div>
            <div className="text-[10px] text-[#666861]">
              Portal Adit → Gate Verification → Spatial Twin → PPE Monitoring
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Missing PPE Simulation Toggle */}
          <button
            type="button"
            onClick={() => {
              setMissingPpe(!missingPpe);
              if (!missingPpe) handleJumpToScene(5);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
              missingPpe
                ? 'bg-[#FDF2F2] border-[#A83D45] text-[#A83D45]'
                : 'bg-white border-[#DCDAD4] text-[#666861] hover:text-[#151713]'
            }`}
            title="Toggle between Nominal 100% PPE and Alert State"
          >
            {missingPpe ? '⚠ ALERT: MISSING HELMET' : '✓ 100% PPE NOMINAL'}
          </button>

          {/* Fullscreen Expand / Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-[#DCDAD4] bg-white text-[#666861] hover:text-[#151713] transition-colors"
            title={isExpanded ? 'Minimize View' : 'Expand Cinematic View'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive 3D Canvas Viewport */}
      <div
        className={`relative bg-[#F6F5F1] w-full ${
          isExpanded ? 'h-[calc(100vh-170px)]' : 'h-[330px] sm:h-[360px]'
        }`}
      >
        <Canvas
          shadows
          camera={{ position: [2.2, 1.8, 9.5], fov: 42 }}
          gl={{ antialias: true, alpha: false }}
        >
          {/* Light Industrial Engineering CAD Background */}
          <color attach="background" args={['#F6F5F1']} />
          <fog attach="fog" args={['#F6F5F1', 18, 55]} />

          {/* Environmental Illumination */}
          <ambientLight intensity={0.85} />
          <directionalLight position={[10, 15, 12]} intensity={1.1} castShadow />
          <directionalLight position={[-8, 6, -8]} intensity={0.4} color="#CBD5E1" />

          {/* Smoothstep Cinematic Camera Controller */}
          <CameraController progress={progress} />

          {/* Surface Portal & Access Adit (Scene 1 & 2) */}
          <MineEntrancePortal />

          {/* Vaulted 3D Digital Twin Mine Network (Scene 3, 4, 5) */}
          <DigitalTwinMineNetwork />

          {/* Movement History Polyline Breadcrumbs */}
          <BreadcrumbTrail progress={progress} activeScene={activeScene} />

          {/* Worker Character with Complete PPE & Holographic Overlay */}
          <AnimatedWorker
            progress={progress}
            isPlaying={isPlaying}
            missingPpe={missingPpe}
            activeScene={activeScene}
          />
        </Canvas>

        {/* Current Active Scene Overlay Badge */}
        <div className="absolute top-3 left-3 bg-white/95 border border-[#DCDAD4] backdrop-blur-md rounded-xl px-3 py-1.5 shadow-xs font-mono flex items-center space-x-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#2D8A61]" />
          <span className="text-[10px] font-bold text-[#151713]">
            {activeScene === 1 && 'SCENE 1 // MINE ENTRANCE ADIT'}
            {activeScene === 2 && 'SCENE 2 // WORKER IDENTIFICATION & SCAN'}
            {activeScene === 3 && 'SCENE 3 // DIGITAL TWIN NETWORK TRANSITION'}
            {activeScene === 4 && 'SCENE 4 // EXACT SUBTERRANEAN LOCATION'}
            {activeScene === 5 && 'SCENE 5 // HOLOGRAPHIC PPE MONITORING'}
          </span>
        </div>

        {/* Real-time Subterranean Metrics HUD Pill */}
        <div className="absolute bottom-3 left-3 bg-white/95 border border-[#DCDAD4] backdrop-blur-md rounded-xl px-3 py-1 shadow-2xs font-mono text-[9px] text-[#666861] hidden sm:flex items-center space-x-3 pointer-events-none">
          <span>WORKER: MW-024 (DEEPIKA)</span>
          <span>•</span>
          <span>MESH: 868 MHz NOMINAL</span>
          <span>•</span>
          <span>STRATA: JHARIA SEAM 4</span>
        </div>
      </div>

      {/* 3. Interactive Scene Navigation & Playback Controls */}
      <div className="p-3 bg-white border-t border-[#EDECE7] space-y-2.5">
        {/* Five Scene Jump Buttons */}
        <div className="grid grid-cols-5 gap-1.5 text-center">
          {[
            { num: 1, label: '1. Entrance' },
            { num: 2, label: '2. Scan' },
            { num: 3, label: '3. Digital Twin' },
            { num: 4, label: '4. Location' },
            { num: 5, label: '5. PPE Status' },
          ].map((sc) => (
            <button
              key={sc.num}
              type="button"
              onClick={() => handleJumpToScene(sc.num)}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold transition-all truncate ${
                activeScene === sc.num
                  ? 'bg-[#176B4D] text-white shadow-2xs'
                  : 'bg-[#FAF9F6] border border-[#DCDAD4] text-[#666861] hover:text-[#151713] hover:bg-[#F2EFE9]'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Timeline Slider and Play/Pause Controls */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-[#176B4D] hover:bg-[#12553D] text-white transition-colors shrink-0 shadow-2xs"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setProgress(0)}
            className="p-1.5 rounded-lg border border-[#DCDAD4] bg-[#FAF9F6] hover:bg-[#ECEBE6] text-[#666861] transition-colors shrink-0"
            title="Restart Journey"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Progress Bar */}
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
              className="w-full accent-[#176B4D] cursor-pointer h-1.5 bg-[#EDECE7] rounded-lg appearance-none"
            />
          </div>

          <span className="font-mono text-[10px] text-[#666861] w-12 text-right shrink-0">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
