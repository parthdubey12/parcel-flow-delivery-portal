import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'

interface DeliveryHubSceneProps {
  onParcelSelect: (parcel: number) => void
}

interface DeliveryNetworkSceneProps {
  onHubSelect: (hub: number) => void
}

export function DeliveryHubScene({ onParcelSelect }: DeliveryHubSceneProps) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [5, 4, 7], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
      <ambientLight intensity={1.9} />
      <directionalLight position={[5, 7, 4]} intensity={3} color="#fff8ec" />
      <pointLight position={[-3, 2, -2]} intensity={7} color="#c7896d" />
      <ConveyorHub onParcelSelect={onParcelSelect} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.75} maxPolarAngle={1.65} rotateSpeed={0.65} />
    </Canvas>
  )
}

function ConveyorHub({ onParcelSelect }: DeliveryHubSceneProps) {
  const parcels = useRef<Group[]>([])
  const hub = useRef<Group>(null)
  const [selectedParcel, setSelectedParcel] = useState<number | null>(null)
  const [hoveredParcel, setHoveredParcel] = useState<number | null>(null)

  useFrame((state, delta) => {
    if (hub.current) hub.current.rotation.y += delta * 0.025
    parcels.current.forEach((parcel, index) => {
      if (!parcel) return
      parcel.position.x = ((state.clock.elapsedTime * 0.38 + index * 1.8 + 4.4) % 5.3) - 2.65
      parcel.position.y = 0.44 + Math.sin(state.clock.elapsedTime * 1.6 + index) * 0.025
    })
  })

  return (
    <group ref={hub} rotation={[-0.12, -0.28, 0]} position={[0, -0.2, 0]}>
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.22, 3.1]} />
        <meshStandardMaterial color="#87998a" roughness={0.82} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[6.25, 0.12, 2.6]} />
        <meshStandardMaterial color="#719078" roughness={0.48} metalness={0.08} />
      </mesh>
      {Array.from({ length: 18 }, (_, index) => (
        <mesh key={index} position={[-2.95 + index * 0.35, -0.105, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.62, 12]} />
          <meshStandardMaterial color="#c1c2b4" metalness={0.32} roughness={0.38} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0.12, side * 1.34]}>
          <boxGeometry args={[6.2, 0.25, 0.12]} />
          <meshStandardMaterial color="#c49a68" metalness={0.1} roughness={0.48} />
        </mesh>
      ))}
      <group position={[-1.5, 0.83, 0]}>
        {[-0.67, 0.67].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.13, 1.42, 0.14]} />
            <meshStandardMaterial color="#f6f3ea" metalness={0.22} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 0.67, 0]}>
          <boxGeometry args={[1.45, 0.13, 0.14]} />
          <meshStandardMaterial color="#f6f3ea" metalness={0.22} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[1.28, 0.025, 0.035]} />
          <meshBasicMaterial color="#b96e53" />
        </mesh>
        <pointLight position={[0, 0.36, 0]} intensity={2} color="#c7896d" distance={2} />
      </group>
      {[-1.12, -0.38, 0.38].map((z, index) => (
        <group key={z} position={[1.55, 0.16, z]}>
          <mesh rotation={[0, 0, -0.1]}>
            <boxGeometry args={[2.15, 0.09, 0.5]} />
            <meshStandardMaterial color={index === 1 ? '#78947c' : '#9bab98'} metalness={0.12} roughness={0.48} />
          </mesh>
          <mesh position={[0.62, 0.12, 0]}>
            <boxGeometry args={[0.5, 0.07, 0.42]} />
            <meshStandardMaterial color={index === 1 ? '#cf9b60' : '#f1ede2'} emissive={index === 1 ? '#cf9b60' : '#f1ede2'} emissiveIntensity={0.08} />
          </mesh>
        </group>
      ))}
      {[-1, 0, 1].map((index) => (
        <group
          key={index}
          ref={(element) => { if (element) parcels.current[index + 1] = element }}
          position={[-2, 0.44, index * 0.58]}
          scale={selectedParcel === index + 1 ? 1.12 : hoveredParcel === index + 1 ? 1.07 : 1}
          onPointerOver={(event) => { event.stopPropagation(); setHoveredParcel(index + 1); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHoveredParcel(null); document.body.style.cursor = 'grab' }}
          onClick={(event) => {
            event.stopPropagation()
            setSelectedParcel(index + 1)
            onParcelSelect(index + 1)
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.72, 0.58, 0.64]} />
            <meshStandardMaterial color={selectedParcel === index + 1 || hoveredParcel === index + 1 ? '#d6ae7b' : index === 1 ? '#c99a62' : '#b98751'} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.295, 0]}>
            <boxGeometry args={[0.12, 0.012, 0.65]} />
            <meshStandardMaterial color="#d9a24a" roughness={0.38} />
          </mesh>
          <mesh position={[0.2, 0.03, 0.326]}>
            <boxGeometry args={[0.2, 0.2, 0.012]} />
            <meshStandardMaterial color="#f2eee0" roughness={0.9} />
          </mesh>
          <mesh position={[0.2, 0.03, 0.336]}>
            <boxGeometry args={[0.11, 0.045, 0.006]} />
            <meshBasicMaterial color="#0f1f18" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function DeliveryNetworkScene({ onHubSelect }: DeliveryNetworkSceneProps) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [5, 4.2, 6], fov: 36 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
      <ambientLight intensity={1.9} />
      <directionalLight position={[4, 6, 5]} intensity={3} color="#fff8ec" />
      <pointLight position={[-2, 2, -2]} intensity={4} color="#c7896d" />
      <Network onHubSelect={onHubSelect} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.72} maxPolarAngle={1.7} rotateSpeed={0.65} />
    </Canvas>
  )
}

function Network({ onHubSelect }: DeliveryNetworkSceneProps) {
  const network = useRef<Group>(null)
  const [hoveredHub, setHoveredHub] = useState<number | null>(null)
  const [selectedHub, setSelectedHub] = useState<number | null>(null)
  const hubs: [number, number, number][] = [
    [-1.45, 0.04, -1],
    [1.45, 0.04, -1],
    [-1.45, 0.04, 1],
    [1.45, 0.04, 1],
  ]

  useFrame((_, delta) => {
    if (network.current) network.current.rotation.y += delta * 0.025
  })

  return (
    <group ref={network} rotation={[-0.12, -0.3, 0]}>
      <mesh position={[0, -0.24, 0]} receiveShadow>
        <boxGeometry args={[5.5, 0.24, 4.2]} />
        <meshStandardMaterial color="#e1e5db" roughness={0.75} />
      </mesh>
      {hubs.map(([x, , z], index) => (
        <mesh key={index} position={[x / 2, -0.09, z / 2]} rotation={[0, -Math.atan2(z, x), 0]}>
          <boxGeometry args={[Math.hypot(x, z), 0.035, 0.04]} />
          <meshStandardMaterial color="#c49a68" emissive="#c49a68" emissiveIntensity={0.1} />
        </mesh>
      ))}
      <group position={[0, 0.02, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.15, 0.62, 0.9]} />
          <meshStandardMaterial color="#b97759" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.66, 0]} castShadow>
          <boxGeometry args={[0.84, 0.14, 0.96]} />
          <meshStandardMaterial color="#c68e6b" roughness={0.48} />
        </mesh>
        <mesh position={[0, 0.3, 0.46]}>
          <boxGeometry args={[0.27, 0.26, 0.025]} />
          <meshStandardMaterial color="#f8f5ec" />
        </mesh>
      </group>
      {hubs.map(([x, y, z], index) => (
        <group
          key={`hub-${index}`}
          position={[x, y, z]}
          scale={selectedHub === index ? 1.14 : hoveredHub === index ? 1.08 : 1}
          onPointerOver={(event) => { event.stopPropagation(); setHoveredHub(index); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHoveredHub(null); document.body.style.cursor = 'grab' }}
          onClick={(event) => {
            event.stopPropagation()
            setSelectedHub(index)
            onHubSelect(index)
          }}
        >
          <mesh position={[0, 0.31, 0]} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.68]} />
            <meshStandardMaterial color={selectedHub === index || hoveredHub === index ? '#83a083' : '#718f78'} roughness={0.58} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[0.9, 0.13, 0.76]} />
            <meshStandardMaterial color="#f4eddf" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.3, 0.35]}>
            <boxGeometry args={[0.19, 0.22, 0.02]} />
            <meshStandardMaterial color="#f6f2e9" />
          </mesh>
          <mesh position={[0.22, 0.43, 0.35]}>
            <boxGeometry args={[0.13, 0.09, 0.02]} />
            <meshStandardMaterial color="#d7aa72" />
          </mesh>
        </group>
      ))}
      {hubs.map(([x, , z], index) => (
        <mesh key={`parcel-${index}`} position={[x * 0.56, 0.14, z * 0.56]}>
          <boxGeometry args={[0.23, 0.2, 0.21]} />
          <meshStandardMaterial color="#c99a62" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
