import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Planet data with page mappings
const PLANETS = [
  { 
    name: 'Mercury', 
    color: '#8C7853', 
    size: 0.4, 
    distance: 5, 
    period: 87.97,
    initialAngle: 0,
    page: '/timeline',
    pageName: 'timeline'
  },
  { 
    name: 'Venus', 
    color: '#FFC649', 
    size: 0.6, 
    distance: 7, 
    period: 224.7,
    initialAngle: Math.PI / 3,
    page: '/projects',
    pageName: 'projects'
  },
  { 
    name: 'Earth', 
    color: '#6B93D6', 
    size: 0.65, 
    distance: 9, 
    period: 365.25,
    initialAngle: Math.PI / 2,
    page: '/education',
    pageName: 'education'
  },
  { 
    name: 'Mars', 
    color: '#C1440E', 
    size: 0.5, 
    distance: 11, 
    period: 686.98,
    initialAngle: Math.PI / 4,
    page: '/skills-experience',
    pageName: 'skills & experience'
  },
  { 
    name: 'Jupiter', 
    color: '#D8CA9D', 
    size: 1.2, 
    distance: 15, 
    period: 4332.59,
    initialAngle: Math.PI / 6,
    page: '/research',
    pageName: 'research'
  },
  { 
    name: 'Saturn', 
    color: '#FAD5A5', 
    size: 1.0, 
    distance: 19, 
    period: 10759.22,
    initialAngle: Math.PI / 5,
    page: '/life',
    pageName: 'life'
  },
  { 
    name: 'Uranus', 
    color: '#4FD0E7', 
    size: 0.8, 
    distance: 24, 
    period: 30688.5,
    initialAngle: Math.PI / 7,
    page: '/honors',
    pageName: 'honors'
  },
  { 
    name: 'Neptune', 
    color: '#4B70DD', 
    size: 0.75, 
    distance: 30, 
    period: 60182,
    initialAngle: Math.PI / 8,
    page: '/contact',
    pageName: 'contact'
  },
];

interface PlanetProps {
  name: string;
  color: string;
  size: number;
  distance: number;
  period: number;
  initialAngle: number;
  page: string;
  pageName: string;
  onClick: (page: string) => void;
}

function Planet({ name, color, size, distance, period, initialAngle, page, pageName, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const startTimeRef = useRef(Date.now());

  useFrame(() => {
    if (meshRef.current && labelRef.current) {
      // Slow down smaller planets (Mercury, Venus, Mars)
      const speedMultiplier = size < 0.6 ? 0.05 : 0.1;
      const scaledPeriod = period * speedMultiplier;
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const angle = initialAngle + (elapsedSeconds / scaledPeriod) * Math.PI * 2;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      meshRef.current.position.x = x;
      meshRef.current.position.z = z;
      meshRef.current.rotation.y += 0.01;
      
      // Position label relative to planet
      labelRef.current.position.x = x;
      labelRef.current.position.z = z;
      labelRef.current.position.y = size * 1.5;
    }
  });

  // Create highly detailed planet texture
  const createPlanetTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.6, color);
    gradient.addColorStop(0.9, '#000000');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    if (name === 'Mercury') {
      // Mercury: cratered surface with gray-brown tones
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 8 + 2;
        ctx.fillStyle = `rgba(${140 - Math.random() * 40}, ${120 - Math.random() * 30}, ${83 - Math.random() * 20}, 0.8)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Crater rim highlight
        ctx.strokeStyle = `rgba(180, 160, 120, 0.6)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Add surface variations
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(100, 90, 70, ${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 30 + 10, Math.random() * 30 + 10);
      }
    } else if (name === 'Venus') {
      // Venus: thick cloud layers with yellow-orange tones
      // Base cloud layer
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 80 + 40;
        const alpha = 0.4 + Math.random() * 0.3;
        ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Upper cloud layer
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 60 + 30;
        ctx.fillStyle = `rgba(255, 240, 180, 0.3)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Cloud swirls
      for (let i = 0; i < 15; i++) {
        ctx.strokeStyle = `rgba(255, 220, 150, 0.4)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 50 + 30, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (name === 'Earth') {
      // Earth: detailed continents, oceans, and cloud cover
      // Oceans (base blue)
      ctx.fillStyle = '#1a4d7a';
      ctx.fillRect(0, 0, 512, 512);
      
      // Continents with realistic shapes
      const continents = [
        { x: 100, y: 150, w: 120, h: 80, color: '#2d5016' }, // North America
        { x: 300, y: 120, w: 100, h: 90, color: '#1e3a0f' }, // Europe/Asia
        { x: 200, y: 250, w: 80, h: 100, color: '#3d6b1f' }, // Africa
        { x: 350, y: 300, w: 90, h: 70, color: '#2d5016' }, // Australia
        { x: 150, y: 350, w: 110, h: 60, color: '#1e3a0f' }, // South America
      ];
      
      continents.forEach(cont => {
        ctx.fillStyle = cont.color;
        ctx.beginPath();
        ctx.ellipse(cont.x, cont.y, cont.w, cont.h, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Add terrain variations
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = `rgba(45, 80, 22, ${0.5 + Math.random() * 0.3})`;
          ctx.fillRect(cont.x - cont.w/2 + Math.random() * cont.w, cont.y - cont.h/2 + Math.random() * cont.h, 
                      Math.random() * 15 + 5, Math.random() * 15 + 5);
        }
      });
      
      // Cloud cover
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 40 + 20;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (name === 'Mars') {
      // Mars: red surface with craters, canyons, and polar ice caps
      // Surface variations
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(${193 - Math.random() * 30}, ${68 - Math.random() * 20}, ${14 - Math.random() * 10}, 0.8)`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 40 + 20, Math.random() * 40 + 20);
      }
      // Craters
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 12 + 3;
        ctx.fillStyle = `rgba(100, 40, 10, 0.7)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Crater shadow
        ctx.fillStyle = `rgba(50, 20, 5, 0.5)`;
        ctx.beginPath();
        ctx.arc(x + r * 0.3, y + r * 0.3, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polar ice caps
      ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
      ctx.beginPath();
      ctx.ellipse(256, 50, 100, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(256, 462, 100, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      // Surface streaks (wind patterns)
      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = `rgba(150, 50, 10, 0.4)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.lineTo(Math.random() * 512, Math.random() * 512);
        ctx.stroke();
      }
    } else if (name === 'Jupiter') {
      // Jupiter: detailed banded atmosphere with Great Red Spot
      // Horizontal bands
      const bands = [
        { y: 0, h: 45, color: '#D8CA9D' },
        { y: 45, h: 35, color: '#C9A961' },
        { y: 80, h: 40, color: '#D8CA9D' },
        { y: 120, h: 50, color: '#B8955A' },
        { y: 170, h: 45, color: '#D8CA9D' },
        { y: 215, h: 40, color: '#C9A961' },
        { y: 255, h: 50, color: '#D8CA9D' },
        { y: 305, h: 45, color: '#B8955A' },
        { y: 350, h: 40, color: '#D8CA9D' },
        { y: 390, h: 50, color: '#C9A961' },
        { y: 440, h: 40, color: '#D8CA9D' },
        { y: 480, h: 32, color: '#B8955A' },
      ];
      
      bands.forEach(band => {
        ctx.fillStyle = band.color;
        ctx.fillRect(0, band.y, 512, band.h);
        // Add texture within bands
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = `rgba(${band.color === '#D8CA9D' ? '216, 202, 157' : band.color === '#C9A961' ? '201, 169, 97' : '184, 149, 90'}, ${0.3 + Math.random() * 0.3})`;
          ctx.fillRect(Math.random() * 512, band.y + Math.random() * band.h, Math.random() * 60 + 30, Math.random() * 10 + 5);
        }
      });
      
      // Great Red Spot
      ctx.fillStyle = 'rgba(200, 80, 60, 0.7)';
      ctx.beginPath();
      ctx.ellipse(350, 200, 60, 40, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Spot detail
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(180, 60, 40, ${0.4 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(350 + (Math.random() - 0.5) * 50, 200 + (Math.random() - 0.5) * 30, Math.random() * 8 + 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Atmospheric swirls
      for (let i = 0; i < 25; i++) {
        ctx.strokeStyle = `rgba(200, 180, 140, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 40 + 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (name === 'Uranus') {
      // Uranus: blue-green with subtle banding
      // Base color with gradient
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(79, 208, 231, ${0.6 + Math.random() * 0.2})`;
        ctx.fillRect(0, i * 51.2, 512, 51.2);
      }
      // Subtle bands
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(60, 180, 200, 0.3)`;
        ctx.fillRect(0, i * 64, 512, 64);
      }
      // Cloud features
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 50 + 25;
        ctx.fillStyle = `rgba(100, 230, 255, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (name === 'Neptune') {
      // Neptune: deep blue with white cloud features
      // Base deep blue
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(75, 112, 221, ${0.7 + Math.random() * 0.2})`;
        ctx.fillRect(0, i * 34, 512, 34);
      }
      // White cloud features
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 35 + 15;
        ctx.fillStyle = `rgba(200, 220, 255, ${0.4 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Dark spots (similar to Great Dark Spot)
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = 'rgba(40, 60, 120, 0.6)';
        ctx.beginPath();
        ctx.ellipse(Math.random() * 512, Math.random() * 512, Math.random() * 40 + 30, Math.random() * 25 + 20, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const planetTexture = createPlanetTexture();

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={() => onClick(page)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? size * 1.3 : size}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Label that moves with planet */}
      <group ref={labelRef}>
        {hovered && (
          <Html center transform occlude style={{ pointerEvents: 'none' }}>
            <div
              style={{
                fontSize: '26px',
                fontWeight: '400',
                color: color,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                textShadow: `0 0 18px ${color}80, 0 0 36px ${color}60, 0 0 54px ${color}40`,
                transform: 'translateX(-50%)',
                textTransform: 'lowercase',
                letterSpacing: '0.5px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {pageName}
            </div>
          </Html>
        )}
      </group>
      
      {/* Orbit path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.1, distance + 0.1, 128]} />
        <meshBasicMaterial color={color} opacity={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Saturn({ distance, page, pageName, onClick }: { distance: number; page: string; pageName: string; onClick: (page: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const startTimeRef = useRef(Date.now());
  const planet = PLANETS.find(p => p.name === 'Saturn')!;

  useFrame(() => {
    if (meshRef.current && ringRef.current && labelRef.current) {
      const speedMultiplier = planet.size < 0.6 ? 0.05 : 0.1;
      const scaledPeriod = planet.period * speedMultiplier;
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const angle = planet.initialAngle + (elapsedSeconds / scaledPeriod) * Math.PI * 2;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      meshRef.current.position.x = x;
      meshRef.current.position.z = z;
      ringRef.current.position.x = x;
      ringRef.current.position.z = z;
      meshRef.current.rotation.y += 0.01;
      
      labelRef.current.position.x = x;
      labelRef.current.position.z = z;
      labelRef.current.position.y = planet.size * 1.5;
    }
  });

  // Create highly detailed Saturn texture
  const createSaturnTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, planet.color);
    gradient.addColorStop(0.6, planet.color);
    gradient.addColorStop(0.9, '#000000');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Detailed banded atmosphere
    const bands = [
      { y: 0, h: 50, color: '#FAD5A5' },
      { y: 50, h: 45, color: '#E6D4A3' },
      { y: 95, h: 55, color: '#FAD5A5' },
      { y: 150, h: 50, color: '#D4C19A' },
      { y: 200, h: 60, color: '#FAD5A5' },
      { y: 260, h: 55, color: '#E6D4A3' },
      { y: 315, h: 50, color: '#FAD5A5' },
      { y: 365, h: 60, color: '#D4C19A' },
      { y: 425, h: 50, color: '#FAD5A5' },
      { y: 475, h: 37, color: '#E6D4A3' },
    ];
    
    bands.forEach(band => {
      ctx.fillStyle = band.color;
      ctx.fillRect(0, band.y, 512, band.h);
      // Add texture and variations within bands
      for (let i = 0; i < 25; i++) {
        const variation = band.color === '#FAD5A5' ? '250, 213, 165' : band.color === '#E6D4A3' ? '230, 212, 163' : '212, 193, 154';
        ctx.fillStyle = `rgba(${variation}, ${0.4 + Math.random() * 0.4})`;
        ctx.fillRect(Math.random() * 512, band.y + Math.random() * band.h, Math.random() * 70 + 40, Math.random() * 15 + 8);
      }
    });
    
    // Atmospheric swirls and eddies
    for (let i = 0; i < 30; i++) {
      ctx.strokeStyle = `rgba(240, 220, 180, 0.3)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 50 + 25, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Hexagonal storm pattern (like Saturn's north pole)
    ctx.strokeStyle = 'rgba(220, 200, 160, 0.4)';
    ctx.lineWidth = 3;
    const centerX = 256;
    const centerY = 100;
    const radius = 40;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const saturnTexture = createSaturnTexture();

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={() => onClick(page)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? planet.size * 1.3 : planet.size}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={saturnTexture}
          emissive={planet.color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* Saturn's rings */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2 + 0.1, 0, 0]}>
        <ringGeometry args={[1.2, 2.0, 64]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={0.3}
          opacity={0.6}
          transparent
          side={THREE.DoubleSide}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Label that moves with planet */}
      <group ref={labelRef}>
        {hovered && (
          <Html center transform occlude style={{ pointerEvents: 'none' }}>
            <div
              style={{
                fontSize: '26px',
                fontWeight: '400',
                color: planet.color,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                textShadow: `0 0 18px ${planet.color}80, 0 0 36px ${planet.color}60, 0 0 54px ${planet.color}40`,
                transform: 'translateX(-50%)',
                textTransform: 'lowercase',
                letterSpacing: '0.5px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {pageName}
            </div>
          </Html>
        )}
      </group>
      
      {/* Orbit path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.1, distance + 0.1, 128]} />
        <meshBasicMaterial color={planet.color} opacity={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Sun({ onClick }: { onClick: () => void }) {
  const sunRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002;
    }
    if (labelRef.current) {
      labelRef.current.position.y = 2.5;
    }
  });

  // Create highly detailed sun texture
  const createSunTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base gradient with multiple color stops for realistic sun appearance
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#FFFF00');
    gradient.addColorStop(0.2, '#FFE44D');
    gradient.addColorStop(0.4, '#FFD700');
    gradient.addColorStop(0.6, '#FFA500');
    gradient.addColorStop(0.8, '#FF8C00');
    gradient.addColorStop(1, '#FF6600');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Granular surface texture (solar granulation)
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 6 + 2;
      const brightness = Math.random() * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, ${220 + Math.random() * 35}, ${100 + Math.random() * 50}, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Sunspots (dark regions)
    const sunspots = [
      { x: 150, y: 200, r: 25 },
      { x: 350, y: 150, r: 20 },
      { x: 250, y: 350, r: 18 },
      { x: 100, y: 100, r: 15 },
      { x: 400, y: 300, r: 22 },
    ];
    
    sunspots.forEach(spot => {
      // Dark center
      ctx.fillStyle = 'rgba(100, 50, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
      // Umbra (darker center)
      ctx.fillStyle = 'rgba(50, 25, 0, 0.9)';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      // Penumbra (lighter edge)
      ctx.fillStyle = 'rgba(150, 75, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r * 1.3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Solar flares and prominences
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 50;
      const x = 256 + Math.cos(angle) * distance;
      const y = 256 + Math.sin(angle) * distance;
      const length = Math.random() * 30 + 20;
      
      ctx.strokeStyle = `rgba(255, ${150 + Math.random() * 50}, 0, 0.6)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(256, 256);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Flare tip
      ctx.fillStyle = `rgba(255, ${180 + Math.random() * 50}, 50, 0.8)`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 8 + 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Surface convection cells
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 25 + 15;
      ctx.strokeStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 50}, 0.4)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  const sunTexture = createSunTexture();

  return (
    <group>
      <mesh
        ref={sunRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#FFD700"
          emissiveIntensity={hovered ? 2 : 1.5}
          metalness={0.1}
          roughness={0.2}
        />
        <pointLight intensity={hovered ? 4 : 3} distance={60} decay={2} />
        <pointLight intensity={hovered ? 2 : 1.5} distance={80} decay={3} color="#FFA500" />
      </mesh>
      
      <group ref={labelRef}>
        {hovered && (
          <Html center transform occlude style={{ pointerEvents: 'none' }}>
            <div
              style={{
                fontSize: '26px',
                fontWeight: '400',
                color: '#FFD700',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                textShadow: '0 0 18px rgba(255, 215, 0, 0.8), 0 0 36px rgba(255, 215, 0, 0.6), 0 0 54px rgba(255, 215, 0, 0.4)',
                transform: 'translateX(-50%)',
                textTransform: 'lowercase',
                letterSpacing: '0.5px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              home
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// Asteroid Belt between Mars and Jupiter
function Asteroid({ angle, radius, y, size, rotationSpeed }: { angle: number; radius: number; y: number; size: number; rotationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(Date.now());
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const currentAngle = angle + elapsedSeconds * 0.01;
      meshRef.current.position.x = Math.cos(currentAngle) * radius;
      meshRef.current.position.z = Math.sin(currentAngle) * radius;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
      scale={size}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#8B7355" emissive="#8B7355" emissiveIntensity={0.1} />
    </mesh>
  );
}

function AsteroidBelt() {
  const count = 100;
  const asteroids = Array.from({ length: count }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 12.5 + (Math.random() - 0.5) * 1.5,
    y: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 0.08 + 0.02,
    rotationSpeed: Math.random() * 0.01 + 0.005,
  }));

  return (
    <group>
      {asteroids.map((asteroid, i) => (
        <Asteroid key={i} {...asteroid} />
      ))}
    </group>
  );
}

// Kuiper Belt beyond Neptune
function KuiperObject({ angle, radius, y, size, rotationSpeed }: { angle: number; radius: number; y: number; size: number; rotationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(Date.now());
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const currentAngle = angle + elapsedSeconds * 0.003;
      meshRef.current.position.x = Math.cos(currentAngle) * radius;
      meshRef.current.position.z = Math.sin(currentAngle) * radius;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
      scale={size}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#4A5568" emissive="#4A5568" emissiveIntensity={0.1} />
    </mesh>
  );
}

function KuiperBelt() {
  const count = 80;
  const kuiperObjects = Array.from({ length: count }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 32 + (Math.random() - 0.5) * 3,
    y: (Math.random() - 0.5) * 1,
    size: Math.random() * 0.12 + 0.03,
    rotationSpeed: Math.random() * 0.005 + 0.002,
  }));

  return (
    <group>
      {kuiperObjects.map((obj, i) => (
        <KuiperObject key={i} {...obj} />
      ))}
    </group>
  );
}

export default function SolarSystem() {
  const handlePlanetClick = (page: string) => {
    window.location.href = page;
  };

  const handleSunClick = () => {
    window.location.href = '/';
  };

  return (
    <div className="w-full h-screen fixed inset-0">
      <Canvas
        camera={{ position: [0, 20, 35], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.2} />
        <fog attach="fog" args={['#0a0a0f', 50, 100]} />
        <Sun onClick={handleSunClick} />
        {PLANETS.filter(p => p.name !== 'Saturn').map((planet) => (
          <Planet key={planet.name} {...planet} onClick={handlePlanetClick} />
        ))}
        <Saturn 
          distance={PLANETS.find(p => p.name === 'Saturn')!.distance} 
          page={PLANETS.find(p => p.name === 'Saturn')!.page}
          pageName={PLANETS.find(p => p.name === 'Saturn')!.pageName}
          onClick={handlePlanetClick}
        />
        <AsteroidBelt />
        <KuiperBelt />
        <Stars 
          radius={150} 
          depth={80} 
          count={8000} 
          factor={6} 
          fade 
          speed={0.5}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={120}
          autoRotate={false}
          autoRotateSpeed={0.2}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}
