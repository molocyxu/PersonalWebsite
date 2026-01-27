import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
    page: '/gallery',
    pageName: 'gallery'
  },
  { 
    name: 'Venus', 
    color: '#FFC649', 
    size: 0.6, 
    distance: 7, 
    period: 224.7,
    initialAngle: Math.PI / 3,
    page: '/timeline',
    pageName: 'timeline'
  },
  { 
    name: 'Earth', 
    color: '#6B93D6', 
    size: 0.65, 
    distance: 9, 
    period: 365.25,
    initialAngle: Math.PI / 2,
    page: '/projects',
    pageName: 'projects'
  },
  { 
    name: 'Mars', 
    color: '#C1440E', 
    size: 0.5, 
    distance: 11, 
    period: 686.98,
    initialAngle: Math.PI / 4,
    page: '/research',
    pageName: 'research'
  },
  { 
    name: 'Jupiter', 
    color: '#D8CA9D', 
    size: 1.2, 
    distance: 15, 
    period: 4332.59,
    initialAngle: Math.PI / 6,
    page: '/placeholder',
    pageName: 'placeholder'
  },
  { 
    name: 'Saturn', 
    color: '#FAD5A5', 
    size: 1.0, 
    distance: 19, 
    period: 10759.22,
    initialAngle: Math.PI / 5,
    page: '/experience',
    pageName: 'experience'
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
    page: '/life',
    pageName: 'life'
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
  const { camera } = useThree();

  // Pre-calculate rotation speeds for performance
  const rotationSpeedY = useMemo(() => size < 0.6 ? 0.02 : size < 1.0 ? 0.015 : 0.01, [size]);
  const rotationSpeedX = useMemo(() => size < 0.6 ? 0.015 : size < 1.0 ? 0.012 : 0.008, [size]);
  const speedMultiplier = useMemo(() => size < 0.6 ? 0.05 : 0.1, [size]);
  
  // Cache calculations
  const scaledPeriod = useMemo(() => period * speedMultiplier, [period, speedMultiplier]);
  
  useFrame(() => {
    if (meshRef.current && labelRef.current) {
      // Slow down smaller planets (Mercury, Venus, Mars)
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const angle = initialAngle + (elapsedSeconds / scaledPeriod) * Math.PI * 2;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      meshRef.current.position.x = x;
      meshRef.current.position.z = z;
      
      // Planet rotation on its own axis - both horizontal (Y) and vertical (X)
      meshRef.current.rotation.y += rotationSpeedY;
      meshRef.current.rotation.x += rotationSpeedX;
      
      // Position label relative to planet
      labelRef.current.position.x = x;
      labelRef.current.position.z = z;
      labelRef.current.position.y = size * 1.5;
    }
  });

  // Create highly detailed planet texture
  const createPlanetTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Reduced from 512 for performance
    canvas.height = 256; // Reduced from 512 for performance
    const ctx = canvas.getContext('2d')!;
    
    // Base gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.6, color);
    gradient.addColorStop(0.9, '#000000');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
      if (name === 'Mercury') {
      // Mercury: cratered surface with gray-brown tones
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
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
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(100, 90, 70, ${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 30 + 10, Math.random() * 30 + 10);
      }
    } else if (name === 'Venus') {
      // Venus: thick cloud layers with yellow-orange tones
      // Base cloud layer
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const r = Math.random() * 80 + 40;
        const alpha = 0.4 + Math.random() * 0.3;
        ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Upper cloud layer
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
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
        ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 50 + 30, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (name === 'Earth') {
      // Earth: detailed continents, oceans, and cloud cover
      // Oceans (base blue)
      ctx.fillStyle = '#1a4d7a';
      ctx.fillRect(0, 0, 256, 256);
      
      // Continents with realistic shapes (scaled to 256)
      const continents = [
        { x: 50, y: 75, w: 60, h: 40, color: '#2d5016' }, // North America
        { x: 150, y: 60, w: 50, h: 45, color: '#1e3a0f' }, // Europe/Asia
        { x: 100, y: 125, w: 40, h: 50, color: '#3d6b1f' }, // Africa
        { x: 175, y: 150, w: 45, h: 35, color: '#2d5016' }, // Australia
        { x: 75, y: 175, w: 55, h: 30, color: '#1e3a0f' }, // South America
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
        const x = Math.random() * 256;
        const y = Math.random() * 256;
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
        ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 40 + 20, Math.random() * 40 + 20);
      }
      // Craters
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
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
      ctx.ellipse(128, 25, 50, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(128, 231, 50, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      // Surface streaks (wind patterns)
      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = `rgba(150, 50, 10, 0.4)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 256, Math.random() * 256);
        ctx.lineTo(Math.random() * 256, Math.random() * 256);
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
        ctx.fillRect(0, band.y, 256, band.h);
        // Add texture within bands
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = `rgba(${band.color === '#D8CA9D' ? '216, 202, 157' : band.color === '#C9A961' ? '201, 169, 97' : '184, 149, 90'}, ${0.3 + Math.random() * 0.3})`;
          ctx.fillRect(Math.random() * 256, band.y + Math.random() * band.h, Math.random() * 30 + 15, Math.random() * 5 + 3);
        }
      });
      
      // Great Red Spot
      ctx.fillStyle = 'rgba(200, 80, 60, 0.7)';
      ctx.beginPath();
      ctx.ellipse(175, 100, 30, 20, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Spot detail
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(180, 60, 40, ${0.4 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(175 + (Math.random() - 0.5) * 25, 100 + (Math.random() - 0.5) * 15, Math.random() * 4 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Atmospheric swirls
      for (let i = 0; i < 25; i++) {
        ctx.strokeStyle = `rgba(200, 180, 140, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 40 + 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (name === 'Uranus') {
      // Uranus: blue-green with subtle banding
      // Base color with gradient
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(79, 208, 231, ${0.6 + Math.random() * 0.2})`;
        ctx.fillRect(0, i * 25.6, 256, 25.6);
      }
      // Subtle bands
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(60, 180, 200, 0.3)`;
        ctx.fillRect(0, i * 32, 256, 32);
      }
      // Cloud features
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
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
        ctx.fillRect(0, i * 17, 256, 17);
      }
      // White cloud features
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
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
        ctx.ellipse(Math.random() * 256, Math.random() * 256, Math.random() * 20 + 15, Math.random() * 12 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const planetTexture = useMemo(() => createPlanetTexture(), [name, color]);

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(page);
        }}
        onPointerOver={(e) => {
          setHovered(true);
          // Get screen coordinates of planet
          const worldPosition = new THREE.Vector3();
          meshRef.current?.getWorldPosition(worldPosition);
          const vector = worldPosition.clone().project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
          
          window.dispatchEvent(new CustomEvent('planet-hover', { 
            detail: { 
              isHovering: true, 
              planetName: name,
              planetData: { x, y, size: size * 50 }
            } 
          }));
        }}
        onPointerOut={() => {
          setHovered(false);
          window.dispatchEvent(new CustomEvent('planet-hover', { detail: { isHovering: false, planetName: null } }));
        }}
        scale={hovered ? size * 1.3 : size}
      >
        <sphereGeometry args={[1, 24, 24]} />
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
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(page);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          const worldPosition = new THREE.Vector3();
          meshRef.current?.getWorldPosition(worldPosition);
          const vector = worldPosition.clone().project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
          window.dispatchEvent(new CustomEvent('planet-hover', {
            detail: {
              isHovering: true,
              planetName: name,
              planetData: { x, y, size: size * 50 },
            },
          }));
        }}
        onPointerOut={() => {
          setHovered(false);
          window.dispatchEvent(new CustomEvent('planet-hover', { detail: { isHovering: false, planetName: null } }));
        }}
      >
        <ringGeometry args={[distance - 0.1, distance + 0.1, 64]} />
        <meshBasicMaterial
          color={color}
          opacity={hovered ? 0.55 : 0.15}
          transparent
          side={THREE.DoubleSide}
        />
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
  const { camera } = useThree();

  // Cache calculations
  const speedMultiplier = useMemo(() => planet.size < 0.6 ? 0.05 : 0.1, [planet.size]);
  const scaledPeriod = useMemo(() => planet.period * speedMultiplier, [planet.period, speedMultiplier]);
  
  useFrame(() => {
    if (meshRef.current && ringRef.current && labelRef.current) {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const angle = planet.initialAngle + (elapsedSeconds / scaledPeriod) * Math.PI * 2;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      meshRef.current.position.x = x;
      meshRef.current.position.z = z;
      ringRef.current.position.x = x;
      ringRef.current.position.z = z;
      
      // Saturn rotation on its own axis - both horizontal and vertical
      meshRef.current.rotation.y += 0.012;
      meshRef.current.rotation.x += 0.009; // Vertical rotation
      
      labelRef.current.position.x = x;
      labelRef.current.position.z = z;
      labelRef.current.position.y = planet.size * 1.5;
    }
  });

  // Create highly detailed Saturn texture
  const createSaturnTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Reduced from 512 for performance
    canvas.height = 256; // Reduced from 512 for performance
    const ctx = canvas.getContext('2d')!;
    
    // Base gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, planet.color);
    gradient.addColorStop(0.6, planet.color);
    gradient.addColorStop(0.9, '#000000');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
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
    const radius = 21;
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

  const saturnTexture = useMemo(() => createSaturnTexture(), []);

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(page);
        }}
        onPointerOver={() => {
          setHovered(true);
          // Get screen coordinates of planet
          const worldPosition = new THREE.Vector3();
          meshRef.current?.getWorldPosition(worldPosition);
          const vector = worldPosition.clone().project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
          
          window.dispatchEvent(new CustomEvent('planet-hover', { 
            detail: { 
              isHovering: true, 
              planetName: 'Saturn',
              planetData: { x, y, size: planet.size * 50 }
            } 
          }));
        }}
        onPointerOut={() => {
          setHovered(false);
          window.dispatchEvent(new CustomEvent('planet-hover', { detail: { isHovering: false, planetName: null } }));
        }}
        scale={hovered ? planet.size * 1.3 : planet.size}
      >
        <sphereGeometry args={[1, 24, 24]} />
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
        <ringGeometry args={[1.2, 2.0, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={hovered ? 0.55 : 0.3}
          opacity={hovered ? 0.9 : 0.6}
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
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(page);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          const worldPosition = new THREE.Vector3();
          meshRef.current?.getWorldPosition(worldPosition);
          const vector = worldPosition.clone().project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
          window.dispatchEvent(new CustomEvent('planet-hover', {
            detail: {
              isHovering: true,
              planetName: 'Saturn',
              planetData: { x, y, size: planet.size * 50 },
            },
          }));
        }}
        onPointerOut={() => {
          setHovered(false);
          window.dispatchEvent(new CustomEvent('planet-hover', { detail: { isHovering: false, planetName: null } }));
        }}
      >
        <ringGeometry args={[distance - 0.1, distance + 0.1, 64]} />
        <meshBasicMaterial
          color={planet.color}
          opacity={hovered ? 0.55 : 0.15}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Sun({ onClick }: { onClick: () => void }) {
  const sunRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(true); // Always show "home" label
  const { camera } = useThree();
  
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002;
    }
    if (labelRef.current) {
      labelRef.current.position.y = 2.5;
    }
    // Don't dispatch hover event - sun label is always visible, no need for UFO beam
  });

  // Create highly detailed sun texture
  const createSunTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Reduced from 512 for performance
    canvas.height = 256; // Reduced from 512 for performance
    const ctx = canvas.getContext('2d')!;
    
    // Base gradient with many more color stops for ultra-realistic sun appearance
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#FFFFFF'); // Bright white core
    gradient.addColorStop(0.05, '#FFFF80');
    gradient.addColorStop(0.1, '#FFFF00'); // Yellow
    gradient.addColorStop(0.15, '#FFE44D');
    gradient.addColorStop(0.25, '#FFD700'); // Gold
    gradient.addColorStop(0.35, '#FFC649');
    gradient.addColorStop(0.45, '#FFA500'); // Orange
    gradient.addColorStop(0.55, '#FF8C00');
    gradient.addColorStop(0.65, '#FF7700');
    gradient.addColorStop(0.75, '#FF6600');
    gradient.addColorStop(0.85, '#FF5500');
    gradient.addColorStop(0.95, '#FF4400');
    gradient.addColorStop(1, '#CC3300'); // Dark red-orange edge
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add radial brightness variations (not just solid gradient) - reduced
    for (let ring = 0; ring < 8; ring++) {
      const radius = (ring + 1) * 25;
      const brightness = 0.3 + Math.sin(ring * 0.5) * 0.2;
      ctx.strokeStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 50}, ${brightness})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(128, 128, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Optimized granular surface texture (solar granulation) - reduced for performance
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 10 + 0.5;
      const brightness = Math.random() * 0.5 + 0.5;
      const hueVariation = Math.random() * 60;
      const saturation = 80 + Math.random() * 80;
      
      // Main granule
      ctx.fillStyle = `rgba(255, ${180 + hueVariation}, ${saturation}, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      
      // Add smaller granules inside larger ones (nested detail)
      if (r > 3) {
        for (let j = 0; j < 2; j++) {
          const offsetX = (Math.random() - 0.5) * r * 0.8;
          const offsetY = (Math.random() - 0.5) * r * 0.8;
          ctx.fillStyle = `rgba(255, ${200 + hueVariation}, ${saturation + 20}, ${brightness * 0.8})`;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Add tiny micro-granules
      if (r > 5) {
        for (let k = 0; k < 3; k++) {
          const microX = x + (Math.random() - 0.5) * r;
          const microY = y + (Math.random() - 0.5) * r;
          ctx.fillStyle = `rgba(255, ${220 + hueVariation}, ${saturation + 40}, ${brightness * 0.6})`;
          ctx.beginPath();
          ctx.arc(microX, microY, r * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Add bright hotspots (areas of intense activity) - reduced for performance
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 15 + 5;
      const intensity = Math.random() * 0.4 + 0.6;
      
      ctx.fillStyle = `rgba(255, 255, ${200 + Math.random() * 55}, ${intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      
      // Bright center
      ctx.fillStyle = `rgba(255, 255, ${220 + Math.random() * 35}, ${intensity * 1.2})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add sunspots for realism - reduced for performance
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 18 + 6;
      const darkness = Math.random() * 0.4 + 0.5;
      
      // Outer penumbra (lightest ring)
      ctx.fillStyle = `rgba(${120 + Math.random() * 40}, ${60 + Math.random() * 30}, 0, ${darkness * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Middle penumbra
      ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${50 + Math.random() * 30}, 0, ${darkness * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner penumbra
      ctx.fillStyle = `rgba(${80 + Math.random() * 40}, ${40 + Math.random() * 20}, 0, ${darkness * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.1, 0, Math.PI * 2);
      ctx.fill();
      
      // Umbra (darker center)
      ctx.fillStyle = `rgba(${50 + Math.random() * 30}, ${25 + Math.random() * 15}, 0, ${darkness})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      
      // Darkest core
      ctx.fillStyle = `rgba(${30 + Math.random() * 20}, ${15 + Math.random() * 10}, 0, ${darkness * 1.3})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Very dark center point
      ctx.fillStyle = `rgba(${20 + Math.random() * 10}, ${10 + Math.random() * 5}, 0, ${darkness * 1.5})`;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
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
    
    // Solar flares and prominences - reduced for performance
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 100;
      const x = 128 + Math.cos(angle) * distance;
      const y = 128 + Math.sin(angle) * distance;
      
      // Multiple layers for depth (3 layers for performance)
      for (let layer = 0; layer < 3; layer++) {
        const layerDistance = distance - layer * 12;
        const layerX = 128 + Math.cos(angle) * layerDistance;
        const layerY = 128 + Math.sin(angle) * layerDistance;
        const opacity = 0.9 - layer * 0.15;
        const hue = 140 + layer * 15 + Math.random() * 40;
        
        ctx.strokeStyle = `rgba(255, ${hue}, ${40 + layer * 25}, ${opacity})`;
        ctx.lineWidth = 5 - layer;
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(layerX, layerY);
        ctx.stroke();
      }
      
      // Bright flare tip with multiple glow layers
      for (let glow = 0; glow < 3; glow++) {
        const glowSize = (Math.random() * 12 + 6) + glow * 5;
        const glowOpacity = 0.9 - glow * 0.2;
        ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, ${80 + Math.random() * 40}, ${glowOpacity})`;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Outer glow halo
      ctx.fillStyle = `rgba(255, ${180 + Math.random() * 50}, ${60 + Math.random() * 30}, 0.4)`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 20 + 15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add coronal loops (curved magnetic field structures) - reduced
    for (let i = 0; i < 20; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const endAngle = startAngle + (Math.random() - 0.5) * Math.PI;
      const startRadius = 100 + Math.random() * 100;
      const endRadius = 150 + Math.random() * 100;
      const curve = (Math.random() - 0.5) * 0.8;
      
      ctx.strokeStyle = `rgba(255, ${180 + Math.random() * 50}, ${80 + Math.random() * 40}, 0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let p = 0; p <= 30; p++) {
        const progress = p / 30;
        const angle = startAngle + (endAngle - startAngle) * progress + curve * Math.sin(progress * Math.PI);
        const radius = startRadius + (endRadius - startRadius) * progress;
        const px = 128 + Math.cos(angle) * radius;
        const py = 128 + Math.sin(angle) * radius;
        
        if (p === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }
    
    // Enhanced magnetic field lines - reduced for performance
    for (let i = 0; i < 15; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const curve = (Math.random() - 0.5) * 0.8;
      const points = 30;
      
      ctx.strokeStyle = `rgba(255, ${210 + Math.random() * 45}, ${90 + Math.random() * 60}, 0.4)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let p = 0; p < points; p++) {
        const progress = p / points;
        const angle = startAngle + curve * progress * Math.PI;
        const radius = 40 + progress * 220;
        const px = 128 + Math.cos(angle) * radius;
        const py = 128 + Math.sin(angle) * radius;
        
        if (p === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }
    
    // Add filament structures (dark threads) - reduced
    for (let i = 0; i < 15; i++) {
      const startX = Math.random() * 512;
      const startY = Math.random() * 512;
      const length = Math.random() * 80 + 40;
      const angle = Math.random() * Math.PI * 2;
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;
      
      ctx.strokeStyle = `rgba(${80 + Math.random() * 40}, ${40 + Math.random() * 20}, 0, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    // Surface convection cells - reduced for performance
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 35 + 8;
      const hue = 180 + Math.random() * 75;
      const saturation = 80 + Math.random() * 70;
      
      // Multiple concentric rings for depth
      for (let ring = 0; ring < 4; ring++) {
        const ringRadius = r * (1 - ring * 0.25);
        const ringOpacity = 0.6 - ring * 0.15;
        ctx.strokeStyle = `rgba(255, ${hue + ring * 10}, ${saturation + ring * 15}, ${ringOpacity})`;
        ctx.lineWidth = 2.5 - ring * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Center highlight with gradient
      const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, r * 0.4);
      centerGradient.addColorStop(0, `rgba(255, ${hue + 40}, ${saturation + 40}, 0.6)`);
      centerGradient.addColorStop(1, `rgba(255, ${hue + 20}, ${saturation + 20}, 0.2)`);
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Enhanced surface ripples and waves - reduced
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 25 + 3;
      const waves = 4 + Math.floor(Math.random() * 4);
      
      for (let w = 0; w < waves; w++) {
        const waveRadius = r + w * 6;
        const waveOpacity = 0.4 - w * 0.08;
        ctx.strokeStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 50}, ${waveOpacity})`;
        ctx.lineWidth = 1.5 - w * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Add turbulence patterns (chaotic flow) - reduced
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 40 + 10;
      
      ctx.strokeStyle = `rgba(255, ${190 + Math.random() * 65}, ${90 + Math.random() * 60}, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      // Create turbulent path
      let currentX = x;
      let currentY = y;
      ctx.moveTo(currentX, currentY);
      
      for (let step = 0; step < 15; step++) {
        currentX += (Math.random() - 0.5) * size * 0.3;
        currentY += (Math.random() - 0.5) * size * 0.3;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }
    
    // Add bright plasma streams - reduced
    for (let i = 0; i < 12; i++) {
      const startX = 256 + (Math.random() - 0.5) * 100;
      const startY = 256 + (Math.random() - 0.5) * 100;
      const angle = Math.random() * Math.PI * 2;
      const length = Math.random() * 150 + 50;
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;
      
      const streamGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      streamGradient.addColorStop(0, `rgba(255, 255, ${200 + Math.random() * 55}, 0.8)`);
      streamGradient.addColorStop(0.5, `rgba(255, ${220 + Math.random() * 35}, ${120 + Math.random() * 40}, 0.6)`);
      streamGradient.addColorStop(1, `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 50}, 0.3)`);
      
      ctx.strokeStyle = streamGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Memoize sun texture to prevent recreation on every render
  const sunTexture = useMemo(() => createSunTexture(), []);

  return (
    <group>
      <mesh
        ref={sunRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          setHovered(true);
          // Don't dispatch hover event - sun label is always visible, no need for UFO beam
        }}
        onPointerOut={() => {
          // Keep hovered true - always show "home" label
          setHovered(true);
        }}
        scale={1.2} // Always use hovered scale
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#FFD700"
          emissiveIntensity={2} // Always use hovered intensity
          metalness={0.1}
          roughness={0.2}
        />
        <pointLight intensity={4} distance={60} decay={2} /> {/* Always use hovered intensity */}
        <pointLight intensity={2} distance={80} decay={3} color="#FFA500" /> {/* Always use hovered intensity */}
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

// Asteroid Belt between Mars and Jupiter - optimized with single useFrame
function AsteroidBelt() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const asteroidsRef = useRef<Array<{
    mesh: THREE.Mesh;
    angle: number;
    radius: number;
    y: number;
    size: number;
    rotationSpeed: number;
    startTime: number;
  }>>([]);
  
  // Initialize asteroids once
  useEffect(() => {
    if (!groupRef.current) return;
    
    const count = 30; // Further reduced for performance
    const material = new THREE.MeshStandardMaterial({ 
      color: "#B99B6B",
      emissive: "#B99B6B",
      emissiveIntensity: 0.12,
      roughness: 0.9,
      metalness: 0.1,
    });
    
    asteroidsRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 12.5 + (Math.random() - 0.5) * 1.5;
      const y = (Math.random() - 0.5) * 0.5;
      const size = Math.random() * 0.16 + 0.06;
      
      const geometry = new THREE.SphereGeometry(1, 6, 6);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      mesh.scale.setScalar(size);
      groupRef.current!.add(mesh);
      
      return {
        mesh,
        angle,
        radius,
        y,
        size,
        rotationSpeed: Math.random() * 0.01 + 0.005,
        startTime: Date.now(),
      };
    });
    
    return () => {
      asteroidsRef.current.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        groupRef.current?.remove(mesh);
      });
      asteroidsRef.current = [];
    };
  }, []);
  
  // Single useFrame for all asteroids
  useFrame(() => {
    if (!asteroidsRef.current.length) return;
    const now = Date.now();
    
    asteroidsRef.current.forEach((asteroid) => {
      asteroid.mesh.rotation.y += asteroid.rotationSpeed;
      const elapsedSeconds = (now - asteroid.startTime) / 1000;
      const currentAngle = asteroid.angle + elapsedSeconds * 0.01;
      asteroid.mesh.position.x = Math.cos(currentAngle) * asteroid.radius;
      asteroid.mesh.position.z = Math.sin(currentAngle) * asteroid.radius;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Hover/click ring for Asteroid Belt */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('carousel-navigate', { detail: { path: '/education' } }));
          }
        }}
      >
        <ringGeometry args={[12.2, 12.6, 64]} />
        <meshBasicMaterial color="#A0988A" opacity={hovered ? 0.4 : 0.05} transparent side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html position={[12.6, 1.6, 0]} transform style={{ pointerEvents: 'none' }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: '400',
              color: '#A0988A',
              whiteSpace: 'nowrap',
              textShadow: '0 0 18px rgba(160, 152, 138, 0.7), 0 0 36px rgba(160, 152, 138, 0.5)',
              transform: 'translateX(-50%)',
              textTransform: 'lowercase',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            education
          </div>
        </Html>
      )}
    </group>
  );
}

// Kuiper Belt beyond Neptune (icy bodies) - optimized with single useFrame
function KuiperBelt() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const objectsRef = useRef<Array<{
    mesh: THREE.Mesh;
    angle: number;
    radius: number;
    y: number;
    size: number;
    rotationSpeed: number;
    startTime: number;
  }>>([]);
  
  // Initialize objects once
  useEffect(() => {
    if (!groupRef.current) return;
    
    const count = 40; // Sparse icy bodies beyond Neptune
    const material = new THREE.MeshStandardMaterial({ 
      color: "#BCD9FF",
      emissive: "#8DB9FF",
      emissiveIntensity: 0.16,
      roughness: 0.85,
      metalness: 0.0,
    });
    
    objectsRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 38 + (Math.random() - 0.5) * 6; // farther than Neptune (30)
      const y = (Math.random() - 0.5) * 1.6; // thin disk with slight thickness
      const size = Math.random() * 0.26 + 0.08;
      
      const geometry = new THREE.SphereGeometry(1, 6, 6);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      mesh.scale.setScalar(size);
      groupRef.current!.add(mesh);
      
      return {
        mesh,
        angle,
        radius,
        y,
        size,
        rotationSpeed: Math.random() * 0.002 + 0.0015,
        startTime: Date.now(),
      };
    });
    
    return () => {
      objectsRef.current.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        groupRef.current?.remove(mesh);
      });
      objectsRef.current = [];
    };
  }, []);
  
  // Single useFrame for all objects
  useFrame(() => {
    if (!objectsRef.current.length) return;
    const now = Date.now();
    
    objectsRef.current.forEach((obj) => {
      obj.mesh.rotation.y += obj.rotationSpeed;
      const elapsedSeconds = (now - obj.startTime) / 1000;
      const currentAngle = obj.angle + elapsedSeconds * 0.003;
      obj.mesh.position.x = Math.cos(currentAngle) * obj.radius;
      obj.mesh.position.z = Math.sin(currentAngle) * obj.radius;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Hover/click ring for Kuiper Belt */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('carousel-navigate', { detail: { path: '/skills' } }));
          }
        }}
      >
        <ringGeometry args={[38.6, 39.4, 64]} />
        <meshBasicMaterial color="#7AA6D6" opacity={hovered ? 0.4 : 0.05} transparent side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html position={[39.2, 2.0, 0]} transform style={{ pointerEvents: 'none' }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: '400',
              color: '#7AA6D6',
              whiteSpace: 'nowrap',
              textShadow: '0 0 18px rgba(122, 166, 214, 0.7), 0 0 36px rgba(122, 166, 214, 0.5)',
              transform: 'translateX(-50%)',
              textTransform: 'lowercase',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            skills
          </div>
        </Html>
      )}
    </group>
  );
}

// Simple satellite drifting in deep space
function Satellite() {
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef(Date.now());
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const radius = 18;
    const angle = elapsed * 0.01;
    groupRef.current.position.x = Math.cos(angle) * radius;
    groupRef.current.position.z = Math.sin(angle) * radius;
    groupRef.current.position.y = 4 + Math.sin(elapsed * 0.3) * 0.5;
    groupRef.current.rotation.y += 0.002;
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('carousel-navigate', { detail: { path: '/contacts' } }));
        }
      }}
    >
      <mesh>
        <boxGeometry args={[0.8, 0.28, 0.26]} />
        <meshStandardMaterial
          color={hovered ? '#E3EBF7' : '#C0C7D6'}
          emissive={hovered ? '#E3EBF7' : '#C0C7D6'}
          emissiveIntensity={hovered ? 0.6 : 0.25}
        />
      </mesh>
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[0.26, 0.16, 0.7]} />
        <meshStandardMaterial
          color={hovered ? '#D6DFEA' : '#9AA5B1'}
          emissive={hovered ? '#D6DFEA' : '#9AA5B1'}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      <mesh position={[1.1, 0, 0]}>
        <boxGeometry args={[1.5, 0.07, 0.5]} />
        <meshStandardMaterial
          color={hovered ? '#7FA8FF' : '#4B70DD'}
          emissive={hovered ? '#7FA8FF' : '#4B70DD'}
          emissiveIntensity={hovered ? 0.45 : 0.2}
        />
      </mesh>
      <mesh position={[-1.1, 0, 0]}>
        <boxGeometry args={[1.5, 0.07, 0.5]} />
        <meshStandardMaterial
          color={hovered ? '#7FA8FF' : '#4B70DD'}
          emissive={hovered ? '#7FA8FF' : '#4B70DD'}
          emissiveIntensity={hovered ? 0.45 : 0.2}
        />
      </mesh>
      {hovered && (
        <Html position={[0, 1.2, 0]} transform occlude style={{ pointerEvents: 'none' }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: '400',
              color: '#C0C7D6',
              whiteSpace: 'nowrap',
              textShadow: '0 0 18px rgba(192, 199, 214, 0.7), 0 0 36px rgba(192, 199, 214, 0.5)',
              transform: 'translateX(-50%) translateY(-30px)',
              textTransform: 'lowercase',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            contacts
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SolarSystem() {
  const handlePlanetClick = (page: string) => {
    // Use carousel navigation instead of direct navigation
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('carousel-navigate', { 
        detail: { path: page } 
      }));
    }
  };

  const handleSunClick = () => {
    // Use carousel navigation instead of direct navigation
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('carousel-navigate', { 
        detail: { path: '/' } 
      }));
    }
  };

  return (
    <div className="w-full h-screen absolute inset-0 z-10">
      <Canvas
        camera={{ position: [0, 20, 35], fov: 60 }}
        gl={{ 
          antialias: false, // Disable for performance
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          precision: "mediump" // Lower precision for performance
        }}
        dpr={[1, 1.5]} // Reduced max DPR
        performance={{ min: 0.5 }} // Allow lower framerate
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
        <Satellite />
        <Stars 
          radius={150} 
          depth={80} 
          count={2000} 
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
          dampingFactor={0.1} // Increased for better performance
          enableDamping={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
