import React, { useState, Suspense, useRef, useEffect } from 'react';
import { generateRandomToken } from '../utils/tokenGenerator';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useSpring, animated } from '@react-spring/three';
import '../style/api.css';

const CoinModel = ({ modelPath, brightness = 3 }) => {
  const meshRef = useRef();
  const gltf = useLoader(GLTFLoader, modelPath);

  const clonedScene = useRef(gltf.scene.clone());

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive 
        object={clonedScene.current} 
        scale={[1.5, 1.5, 1.5]}
      />
      <hemisphereLight 
        color="#FFD700"
        groundColor="#B8860B"
        intensity={brightness * 0.8} 
        position={[0, 10, 0]} 
      />
      <pointLight 
        position={[0, 0, 3]} 
        intensity={brightness * 1.2}
        color="#FFC857"
      />
       <pointLight
        position={[2, 2, 2]}
        intensity={brightness * 1.0} 
        color="#FFB347" 
      />
      <directionalLight
        color="#FFD700"
        intensity={brightness * 0.5} 
        position={[1, 1, 5]}
      />
    </group>
  );
};

const TokenCarousel = () => {
  const [activeTokenIndex, setActiveTokenIndex] = useState(0);
  const [, setDirection] = useState(1);
  const tokens = [
    { name: 'Sandbox', path: '/tokens/sandbox.glb' },
    { name: 'LEO', path: '/tokens/leo.glb' },
    { name: 'AXS', path: '/tokens/axs.glb' },
    { name: 'VET', path: '/tokens/vet.glb' }
  ];

  const { position } = useSpring({
    position: [activeTokenIndex * -8, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 }
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveTokenIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % tokens.length;
        setDirection(nextIndex > prevIndex || (prevIndex === tokens.length - 1 && nextIndex === 0) ? 1 : -1);
        return nextIndex;
      });
    }, 30000); 

    return () => clearInterval(intervalId);
  }, [tokens.length]);

  return (
    <div className="token-carousel">
      <Canvas 
        className="token-carousel-canvas"
        camera={{ 
          position: [0, 0, 10], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.3} color="#FFD700"/> 
        <Suspense fallback={null}>
          <animated.group position={position}>
            {tokens.map((token, index) => (
              <group 
                key={token.name} 
                position={[index * 8, 0, 0]}
              >
                <CoinModel 
                  modelPath={token.path} 
                  brightness={4}
                />
              </group>
            ))}
          </animated.group>
        </Suspense>
      </Canvas>
    </div>
  );
};

const APIPage = () => {
  const [token,] = useState(generateRandomToken());

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
  };

  const handleShareToken = () => {
    if (navigator.share) {
      navigator.share({
        title: 'DTRADE API Token',
        text: token
      });
    } else {
      alert('Web Share API not supported');
    }
  };

  return (
    <div className="api-token-page">
      <div className="api-token-container">
        <div className="api-token-left">
          <div className="placeholder-3d-box">
            <TokenCarousel />
          </div>
        </div>
        <div className="api-token-right">
          <h1>GET FREE API TOKEN</h1>
          <div className="token-display">
            <input 
              type="text" 
              value={token} 
              readOnly 
              className="token-input"
            />
            <div className="token-actions">
              <button 
                className="token-copy-btn" 
                onClick={handleCopyToken}
              >
                Copy
              </button>
              <button 
                className="token-share-btn" 
                onClick={handleShareToken}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIPage;