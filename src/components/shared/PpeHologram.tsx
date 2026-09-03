import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { PpeStatus } from '../../types/safety';

interface PpeHologramProps {
  ppeStatus: PpeStatus;
  workerName?: string;
  onTogglePart?: (part: any) => void;
  interactive?: boolean;
  compact?: boolean;
  showHud?: boolean;
}

// =============================================================================
// MODEL 1: REALISTIC UNDERGROUND COAL MINER 3D MODEL
// =============================================================================
const Model1Miner: React.FC<{
  ppeStatus: PpeStatus;
}> = ({ ppeStatus }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle natural idle turntable breathing / slow rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.35) * 0.12;
    }
  });

  // Materials matching Model 1 reference:
  // 1. Dark Navy Blue Industrial Uniform (#1D2B44)
  const navyUniformMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a2840',
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  );

  // 2. High-Visibility Fluorescent Orange Safety Vest (#F25C05)
  const orangeVestMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ea580c',
        roughness: 0.55,
        metalness: 0.1,
      }),
    []
  );

  // 3. Retroreflective Silver Safety Stripes (#F1F5F9)
  const silverStripeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.25,
        metalness: 0.8,
      }),
    []
  );

  // 4. Yellow Mining Safety Helmet (#F5B800)
  const yellowHelmetMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        roughness: 0.35,
        metalness: 0.2,
      }),
    []
  );

  // 5. Headlamp Silver Metallic Housing
  const headlampMetalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.3,
        metalness: 0.85,
      }),
    []
  );

  // 6. Tan/Brown Leather Safety Work Boots (#A65E2E)
  const tanLeatherBootMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#a15d2c',
        roughness: 0.7,
        metalness: 0.1,
      }),
    []
  );

  // 7. Dark Rubber Lug Sole (#1E232B)
  const rubberSoleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1f242d',
        roughness: 0.9,
      }),
    []
  );

  // 8. Grey Cut-Resistant Work Gloves (#64748B)
  const greyGloveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.65,
        metalness: 0.1,
      }),
    []
  );

  // 9. Friendly Natural Skin Tone (#F3BA88)
  const skinMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f3ba88',
        roughness: 0.75,
      }),
    []
  );

  // 10. Dark Styled Hair (#2B1E17)
  const hairMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2b1e17',
        roughness: 0.9,
      }),
    []
  );

  // Warning Wireframe Material for Missing Items (Muted Red #A83D45)
  const redWarningMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#a83d45',
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      }),
    []
  );

  return (
    <group ref={groupRef} position={[-0.35, -1.25, 0]}>
      {/* Circular Turntable Platform Pedestal (Warm Industrial Slate/Ivory) */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 48]} />
        <meshStandardMaterial color="#dedcd5" roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Concentric Turntable Accent Rings (Restrained Forest Green & Warm Grey) */}
      <mesh position={[0, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.32, 48]} />
        <meshBasicMaterial color="#176b4d" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.92, 36]} />
        <meshBasicMaterial color="#b5b3aa" transparent opacity={0.5} />
      </mesh>

      {/* ==================== 1. LEGS & TROUSERS ==================== */}
      {/* Left Trouser Leg */}
      <mesh position={[-0.18, 0.65, 0]} material={navyUniformMat}>
        <cylinderGeometry args={[0.13, 0.14, 0.85, 16]} />
      </mesh>
      {/* Right Trouser Leg */}
      <mesh position={[0.18, 0.65, 0]} material={navyUniformMat}>
        <cylinderGeometry args={[0.13, 0.14, 0.85, 16]} />
      </mesh>

      {/* Silver Reflective Bands on Lower Trouser Cuffs (Signature Model 1 Feature) */}
      <mesh position={[-0.18, 0.32, 0]} material={silverStripeMat}>
        <cylinderGeometry args={[0.142, 0.142, 0.08, 16]} />
      </mesh>
      <mesh position={[0.18, 0.32, 0]} material={silverStripeMat}>
        <cylinderGeometry args={[0.142, 0.142, 0.08, 16]} />
      </mesh>

      {/* Pelvis / Waistband */}
      <mesh position={[0, 1.1, 0]} material={navyUniformMat}>
        <cylinderGeometry args={[0.26, 0.24, 0.22, 16]} />
      </mesh>

      {/* ==================== 2. SAFETY BOOTS (PPE ITEM) ==================== */}
      {ppeStatus.boots ? (
        <group>
          {/* Left Tan Leather Boot */}
          <group position={[-0.18, 0, 0.04]}>
            {/* Main Boot Upper */}
            <mesh position={[0, 0.12, 0.04]} material={tanLeatherBootMat}>
              <boxGeometry args={[0.2, 0.2, 0.36]} />
            </mesh>
            {/* Padded Ankle Cuff */}
            <mesh position={[0, 0.22, -0.02]} material={tanLeatherBootMat}>
              <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
            </mesh>
            {/* Heavy Black Rubber Lugged Sole */}
            <mesh position={[0, 0.02, 0.04]} material={rubberSoleMat}>
              <boxGeometry args={[0.22, 0.05, 0.38]} />
            </mesh>
            {/* Front Black Laces Detail */}
            <mesh position={[0, 0.16, 0.12]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.1, 0.12, 0.04]} />
              <meshStandardMaterial color="#111310" roughness={0.8} />
            </mesh>
          </group>

          {/* Right Tan Leather Boot */}
          <group position={[0.18, 0, 0.04]}>
            {/* Main Boot Upper */}
            <mesh position={[0, 0.12, 0.04]} material={tanLeatherBootMat}>
              <boxGeometry args={[0.2, 0.2, 0.36]} />
            </mesh>
            {/* Padded Ankle Cuff */}
            <mesh position={[0, 0.22, -0.02]} material={tanLeatherBootMat}>
              <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
            </mesh>
            {/* Heavy Black Rubber Lugged Sole */}
            <mesh position={[0, 0.02, 0.04]} material={rubberSoleMat}>
              <boxGeometry args={[0.22, 0.05, 0.38]} />
            </mesh>
            {/* Front Black Laces Detail */}
            <mesh position={[0, 0.16, 0.12]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.1, 0.12, 0.04]} />
              <meshStandardMaterial color="#111310" roughness={0.8} />
            </mesh>
          </group>
        </group>
      ) : (
        /* Missing Boots State: Worker is NOT wearing boots — only soft uncertified socks + Red Warning */
        <group>
          <mesh position={[-0.18, 0.08, 0.02]}>
            <boxGeometry args={[0.16, 0.15, 0.28]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.9} />
          </mesh>
          <mesh position={[0.18, 0.08, 0.02]}>
            <boxGeometry args={[0.16, 0.15, 0.28]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.9} />
          </mesh>
          {/* Red Warning Wireframe Indicator */}
          <mesh position={[-0.18, 0.1, 0.02]} material={redWarningMat}>
            <boxGeometry args={[0.24, 0.24, 0.38]} />
          </mesh>
          <mesh position={[0.18, 0.1, 0.02]} material={redWarningMat}>
            <boxGeometry args={[0.24, 0.24, 0.38]} />
          </mesh>
        </group>
      )}

      {/* ==================== 3. TORSO & SAFETY VEST (PPE ITEM) ==================== */}
      {/* Navy Blue Shirt Torso Base */}
      <mesh position={[0, 1.55, 0]} material={navyUniformMat}>
        <boxGeometry args={[0.54, 0.72, 0.3]} />
      </mesh>

      {/* High-Vis Orange Safety Vest (Model 1 Authentic Design) */}
      {ppeStatus.vest ? (
        <group position={[0, 1.55, 0]}>
          {/* Orange Vest Main Body */}
          <mesh material={orangeVestMat}>
            <boxGeometry args={[0.57, 0.73, 0.33]} />
          </mesh>

          {/* Dark Grey Center Front Zipper Line */}
          <mesh position={[0, 0, 0.17]}>
            <boxGeometry args={[0.03, 0.73, 0.01]} />
            <meshStandardMaterial color="#1e242d" roughness={0.7} />
          </mesh>

          {/* Lower Horizontal Silver Reflective Stripe */}
          <mesh position={[0, -0.15, 0.171]} material={silverStripeMat}>
            <boxGeometry args={[0.56, 0.06, 0.01]} />
          </mesh>
          {/* Upper Horizontal Silver Reflective Stripe */}
          <mesh position={[0, 0.1, 0.171]} material={silverStripeMat}>
            <boxGeometry args={[0.56, 0.06, 0.01]} />
          </mesh>

          {/* Left Vertical Shoulder Reflective Stripe */}
          <mesh position={[-0.15, 0.18, 0.171]} material={silverStripeMat}>
            <boxGeometry args={[0.05, 0.38, 0.01]} />
          </mesh>
          {/* Right Vertical Shoulder Reflective Stripe */}
          <mesh position={[0.15, 0.18, 0.171]} material={silverStripeMat}>
            <boxGeometry args={[0.05, 0.38, 0.01]} />
          </mesh>

          {/* Left Lower Flap Pocket */}
          <mesh position={[-0.15, -0.22, 0.172]} material={orangeVestMat}>
            <boxGeometry args={[0.14, 0.12, 0.02]} />
          </mesh>
          {/* Right Lower Flap Pocket */}
          <mesh position={[0.15, -0.22, 0.172]} material={orangeVestMat}>
            <boxGeometry args={[0.14, 0.12, 0.02]} />
          </mesh>
        </group>
      ) : (
        /* Missing Vest State: Orange vest is absent — only navy shirt + Red Warning Outline */
        <mesh position={[0, 1.55, 0]} material={redWarningMat}>
          <boxGeometry args={[0.6, 0.76, 0.36]} />
        </mesh>
      )}

      {/* ==================== 4. ARMS & GLOVES (PPE ITEM) ==================== */}
      {/* Left Upper Arm (Navy Uniform) */}
      <mesh position={[-0.36, 1.62, 0]} rotation={[0, 0, 0.12]} material={navyUniformMat}>
        <cylinderGeometry args={[0.08, 0.085, 0.45, 16]} />
      </mesh>
      {/* Right Upper Arm (Navy Uniform) */}
      <mesh position={[0.36, 1.62, 0]} rotation={[0, 0, -0.12]} material={navyUniformMat}>
        <cylinderGeometry args={[0.08, 0.085, 0.45, 16]} />
      </mesh>

      {/* Left Forearm (Navy Uniform with Silver Cuff Stripe) */}
      <mesh position={[-0.41, 1.25, 0]} material={navyUniformMat}>
        <cylinderGeometry args={[0.075, 0.08, 0.42, 16]} />
      </mesh>
      <mesh position={[-0.41, 1.18, 0]} material={silverStripeMat}>
        <cylinderGeometry args={[0.082, 0.082, 0.05, 16]} />
      </mesh>

      {/* Right Forearm (Navy Uniform with Silver Cuff Stripe) */}
      <mesh position={[0.41, 1.25, 0]} material={navyUniformMat}>
        <cylinderGeometry args={[0.075, 0.08, 0.42, 16]} />
      </mesh>
      <mesh position={[0.41, 1.18, 0]} material={silverStripeMat}>
        <cylinderGeometry args={[0.082, 0.082, 0.05, 16]} />
      </mesh>

      {/* Gloves (PPE Item) */}
      {ppeStatus.gloves ? (
        <group>
          {/* Left Grey Industrial Glove */}
          <mesh position={[-0.42, 0.95, 0.02]} material={greyGloveMat}>
            <boxGeometry args={[0.11, 0.2, 0.13]} />
          </mesh>
          {/* Left Glove Thumb */}
          <mesh position={[-0.37, 0.98, 0.06]} rotation={[0.3, 0, -0.3]} material={greyGloveMat}>
            <cylinderGeometry args={[0.03, 0.03, 0.09, 8]} />
          </mesh>

          {/* Right Grey Industrial Glove */}
          <mesh position={[0.42, 0.95, 0.02]} material={greyGloveMat}>
            <boxGeometry args={[0.11, 0.2, 0.13]} />
          </mesh>
          {/* Right Glove Thumb */}
          <mesh position={[0.37, 0.98, 0.06]} rotation={[0.3, 0, 0.3]} material={greyGloveMat}>
            <cylinderGeometry args={[0.03, 0.03, 0.09, 8]} />
          </mesh>
        </group>
      ) : (
        /* Missing Gloves: Worker is NOT wearing gloves — bare skin-tone hands + Red Warning */
        <group>
          <mesh position={[-0.42, 0.95, 0.02]} material={skinMat}>
            <boxGeometry args={[0.1, 0.18, 0.12]} />
          </mesh>
          <mesh position={[-0.42, 0.95, 0.02]} material={redWarningMat}>
            <boxGeometry args={[0.14, 0.22, 0.16]} />
          </mesh>

          <mesh position={[0.42, 0.95, 0.02]} material={skinMat}>
            <boxGeometry args={[0.1, 0.18, 0.12]} />
          </mesh>
          <mesh position={[0.42, 0.95, 0.02]} material={redWarningMat}>
            <boxGeometry args={[0.14, 0.22, 0.16]} />
          </mesh>
        </group>
      )}

      {/* ==================== 5. HEAD & FACIAL FEATURES ==================== */}
      {/* Neck */}
      <mesh position={[0, 1.95, 0]} material={skinMat}>
        <cylinderGeometry args={[0.1, 0.11, 0.15, 16]} />
      </mesh>

      {/* Human Head Base */}
      <mesh position={[0, 2.18, 0]} material={skinMat}>
        <sphereGeometry args={[0.22, 24, 24]} />
      </mesh>

      {/* Dark Styled Hair (Model 1 Reference: Visible under helmet sides/back) */}
      <mesh position={[0, 2.22, -0.04]} material={hairMat}>
        <sphereGeometry args={[0.225, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
      </mesh>
      {/* Sideburns / Hair Tuft */}
      <mesh position={[-0.2, 2.15, 0.02]} material={hairMat}>
        <boxGeometry args={[0.04, 0.12, 0.08]} />
      </mesh>
      <mesh position={[0.2, 2.15, 0.02]} material={hairMat}>
        <boxGeometry args={[0.04, 0.12, 0.08]} />
      </mesh>

      {/* Friendly Eyes */}
      {/* Left Eyeball */}
      <mesh position={[-0.08, 2.18, 0.19]}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.08, 2.18, 0.22]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#2b1e17" />
      </mesh>
      {/* Right Eyeball */}
      <mesh position={[0.08, 2.18, 0.19]}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.08, 2.18, 0.22]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#2b1e17" />
      </mesh>

      {/* Eyebrows */}
      <mesh position={[-0.08, 2.24, 0.2]} rotation={[0, 0, 0.05]} material={hairMat}>
        <boxGeometry args={[0.07, 0.018, 0.02]} />
      </mesh>
      <mesh position={[0.08, 2.24, 0.2]} rotation={[0, 0, -0.05]} material={hairMat}>
        <boxGeometry args={[0.07, 0.018, 0.02]} />
      </mesh>

      {/* Friendly Smile */}
      <mesh position={[0, 2.06, 0.2]}>
        <boxGeometry args={[0.09, 0.015, 0.02]} />
        <meshStandardMaterial color="#8b3a3a" />
      </mesh>

      {/* Left Ear */}
      <mesh position={[-0.22, 2.16, 0]} material={skinMat}>
        <boxGeometry args={[0.04, 0.08, 0.06]} />
      </mesh>
      {/* Right Ear */}
      <mesh position={[0.22, 2.16, 0]} material={skinMat}>
        <boxGeometry args={[0.04, 0.08, 0.06]} />
      </mesh>

      {/* ==================== 6. YELLOW SAFETY HELMET & HEADLAMP (PPE ITEM) ==================== */}
      {ppeStatus.helmet ? (
        <group position={[0, 2.32, 0]}>
          {/* Main Curved Yellow Helmet Dome */}
          <mesh material={yellowHelmetMat}>
            <sphereGeometry args={[0.26, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>

          {/* Sturdy Circular Helmet Rim / Brim */}
          <mesh position={[0, -0.02, 0.04]} rotation={[0.1, 0, 0]} material={yellowHelmetMat}>
            <cylinderGeometry args={[0.3, 0.3, 0.035, 24]} />
          </mesh>

          {/* Black Inner Suspension Under-Brim Trim */}
          <mesh position={[0, -0.04, 0.04]} rotation={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.015, 24]} />
            <meshStandardMaterial color="#1e242d" />
          </mesh>

          {/* Circular Headlamp Unit on Forehead (Model 1 Authentic Signature) */}
          <group position={[0, 0.08, 0.26]} rotation={[0.12, 0, 0]}>
            {/* Metallic Cylindrical Bezel Housing */}
            <mesh material={headlampMetalMat} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.05, 18]} />
            </mesh>
            {/* Inner Reflector Lens with Bright Glow */}
            <mesh position={[0, 0, 0.028]}>
              <circleGeometry args={[0.06, 18]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Soft Flashlight Beam Emission */}
            <pointLight position={[0, 0, 0.2]} intensity={0.9} distance={3.5} color="#fffbeb" />
          </group>
        </group>
      ) : (
        /* Missing Helmet: Helmet is absent — miner hair exposed with Red Warning Wireframe */
        <mesh position={[0, 2.36, 0]} material={redWarningMat}>
          <sphereGeometry args={[0.29, 16, 16]} />
        </mesh>
      )}
    </group>
  );
};

// =============================================================================
// MAIN COMPONENT: 3D PPE INSPECTION SCENE WITH MODEL 1 CALLOUTS
// =============================================================================
export const PpeHologram: React.FC<PpeHologramProps> = ({
  ppeStatus,
  workerName,
  compact = false,
}) => {
  return (
    <div
      className={`relative w-full ${
        compact ? 'h-[440px] sm:h-[480px]' : 'h-[460px] sm:h-[500px]'
      } bg-[#f5f4f0] rounded-2xl overflow-hidden border border-[#DCDAD4] shadow-xs flex items-center justify-center select-none`}
    >
      {/* Subtle Warm Industrial Studio Backdrop & Vignette (Mine OS Aesthetic) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f0eee6_70%,#e5e2d8_100%)] opacity-90" />

      {/* Subtle Technical Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(#151713 1px, transparent 1px), linear-gradient(90deg, #151713 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Header: LIVE PPE DETECTION & Live AI Vision Badge */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div>
          <div className="font-serif font-bold text-sm text-[#151713] tracking-tight">
            LIVE PPE DETECTION
          </div>
          {workerName && (
            <div className="text-[11px] font-mono text-[#666861] mt-0.5">
              Inspecting: <strong className="text-[#151713]">{workerName}</strong>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-white/95 border border-[#2D8A61]/40 px-3 py-1 rounded-xl shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#2D8A61] animate-pulse" />
          <span className="font-mono text-xs font-bold text-[#176B4D] tracking-wider uppercase">
            ● LIVE
          </span>
          <span className="text-[10px] font-mono text-[#666861] border-l border-[#DCDAD4] pl-2">
            AI PPE VISION (DEMO)
          </span>
        </div>
      </div>

      {/* ==================== MODEL 1 CALLOUTS & CONNECTOR LINES ==================== */}
      {/* SVG Connector Lines Layer (Thin, Crisp, Forest Green or Muted Red) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* 1. Helmet Connector Line */}
        <g>
          <polyline
            points="46%,21% 62%,21% 72%,21%"
            fill="none"
            stroke={ppeStatus.helmet ? '#176B4D' : '#A83D45'}
            strokeWidth="1.6"
            strokeDasharray={ppeStatus.helmet ? 'none' : '4,3'}
          />
          {/* Target Terminal Bracket on Helmet */}
          <polyline
            points="46%,18% 44%,18% 44%,24% 46%,24%"
            fill="none"
            stroke={ppeStatus.helmet ? '#176B4D' : '#A83D45'}
            strokeWidth="2.2"
          />
        </g>

        {/* 2. Safety Vest Connector Line */}
        <g>
          <polyline
            points="48%,41% 62%,41% 72%,41%"
            fill="none"
            stroke={ppeStatus.vest ? '#176B4D' : '#A83D45'}
            strokeWidth="1.6"
            strokeDasharray={ppeStatus.vest ? 'none' : '4,3'}
          />
          {/* Target Terminal Bracket on Vest */}
          <polyline
            points="48%,38% 46%,38% 46%,44% 48%,44%"
            fill="none"
            stroke={ppeStatus.vest ? '#176B4D' : '#A83D45'}
            strokeWidth="2.2"
          />
        </g>

        {/* 3. Gloves Connector Line */}
        <g>
          <polyline
            points="51%,59% 62%,59% 72%,59%"
            fill="none"
            stroke={ppeStatus.gloves ? '#176B4D' : '#A83D45'}
            strokeWidth="1.6"
            strokeDasharray={ppeStatus.gloves ? 'none' : '4,3'}
          />
          {/* Target Terminal Bracket on Glove */}
          <polyline
            points="51%,56% 49%,56% 49%,62% 51%,62%"
            fill="none"
            stroke={ppeStatus.gloves ? '#176B4D' : '#A83D45'}
            strokeWidth="2.2"
          />
        </g>

        {/* 4. Safety Boots Connector Line */}
        <g>
          <polyline
            points="47%,80% 62%,80% 72%,80%"
            fill="none"
            stroke={ppeStatus.boots ? '#176B4D' : '#A83D45'}
            strokeWidth="1.6"
            strokeDasharray={ppeStatus.boots ? 'none' : '4,3'}
          />
          {/* Target Terminal Bracket on Boot */}
          <polyline
            points="47%,77% 45%,77% 45%,83% 47%,83%"
            fill="none"
            stroke={ppeStatus.boots ? '#176B4D' : '#A83D45'}
            strokeWidth="2.2"
          />
        </g>
      </svg>

      {/* HTML Callout Cards Overlay (Right Side, as in Model 1) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Callout 1: HELMET */}
        <div
          className={`absolute top-[15%] right-4 sm:right-6 min-w-[130px] p-2.5 rounded-xl border backdrop-blur-md shadow-sm transition-colors ${
            ppeStatus.helmet
              ? 'bg-white/95 border-[#176B4D]/40 text-[#151713]'
              : 'bg-[#FDF2F2]/95 border-[#A83D45]/70 text-[#151713] animate-pulse'
          }`}
        >
          <div className="font-serif font-bold text-xs tracking-wider text-[#151713]">
            HELMET
          </div>
          <div
            className={`font-mono text-[11px] font-bold mt-0.5 tracking-wide ${
              ppeStatus.helmet ? 'text-[#176B4D]' : 'text-[#A83D45]'
            }`}
          >
            {ppeStatus.helmet ? 'DETECTED' : 'NOT DETECTED'}
          </div>
        </div>

        {/* Callout 2: SAFETY VEST */}
        <div
          className={`absolute top-[35%] right-4 sm:right-6 min-w-[130px] p-2.5 rounded-xl border backdrop-blur-md shadow-sm transition-colors ${
            ppeStatus.vest
              ? 'bg-white/95 border-[#176B4D]/40 text-[#151713]'
              : 'bg-[#FDF2F2]/95 border-[#A83D45]/70 text-[#151713] animate-pulse'
          }`}
        >
          <div className="font-serif font-bold text-xs tracking-wider text-[#151713]">
            SAFETY VEST
          </div>
          <div
            className={`font-mono text-[11px] font-bold mt-0.5 tracking-wide ${
              ppeStatus.vest ? 'text-[#176B4D]' : 'text-[#A83D45]'
            }`}
          >
            {ppeStatus.vest ? 'DETECTED' : 'NOT DETECTED'}
          </div>
        </div>

        {/* Callout 3: GLOVES */}
        <div
          className={`absolute top-[53%] right-4 sm:right-6 min-w-[130px] p-2.5 rounded-xl border backdrop-blur-md shadow-sm transition-colors ${
            ppeStatus.gloves
              ? 'bg-white/95 border-[#176B4D]/40 text-[#151713]'
              : 'bg-[#FDF2F2]/95 border-[#A83D45]/70 text-[#151713] animate-pulse'
          }`}
        >
          <div className="font-serif font-bold text-xs tracking-wider text-[#151713]">
            GLOVES
          </div>
          <div
            className={`font-mono text-[11px] font-bold mt-0.5 tracking-wide ${
              ppeStatus.gloves ? 'text-[#176B4D]' : 'text-[#A83D45]'
            }`}
          >
            {ppeStatus.gloves ? 'DETECTED' : 'NOT DETECTED'}
          </div>
        </div>

        {/* Callout 4: SAFETY BOOTS */}
        <div
          className={`absolute top-[74%] right-4 sm:right-6 min-w-[130px] p-2.5 rounded-xl border backdrop-blur-md shadow-sm transition-colors ${
            ppeStatus.boots
              ? 'bg-white/95 border-[#176B4D]/40 text-[#151713]'
              : 'bg-[#FDF2F2]/95 border-[#A83D45]/70 text-[#151713] animate-pulse'
          }`}
        >
          <div className="font-serif font-bold text-xs tracking-wider text-[#151713]">
            SAFETY BOOTS
          </div>
          <div
            className={`font-mono text-[11px] font-bold mt-0.5 tracking-wide ${
              ppeStatus.boots ? 'text-[#176B4D]' : 'text-[#A83D45]'
            }`}
          >
            {ppeStatus.boots ? 'DETECTED' : 'NOT DETECTED'}
          </div>
        </div>
      </div>

      {/* ==================== 3D R3F CANVAS ==================== */}
      {/* Zoomed out camera with full head-to-toe visibility and clean right margin */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [-0.35, 0.25, 5.0], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Warm Studio Lighting for Realistic Materials */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 5, 4]} intensity={1.8} castShadow />
          <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#cbd5e1" />
          <pointLight position={[0, 1.5, 2.5]} intensity={0.8} color="#ffffff" />

          {/* Model 1 3D Character */}
          <Model1Miner ppeStatus={ppeStatus} />

          <OrbitControls
            target={[-0.35, -0.05, 0]}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2.3}
            maxPolarAngle={Math.PI / 1.8}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        </Canvas>
      </div>
    </div>
  );
};
