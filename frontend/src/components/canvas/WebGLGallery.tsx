"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import * as THREE from "three";

interface RegisteredCard {
  id: string;
  element: HTMLElement;
  imageUrl: string;
  mesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  texture?: THREE.Texture;
  hover: number;
  targetHover: number;
}

interface WebGLContextType {
  registerCard: (id: string, element: HTMLElement, imageUrl: string) => void;
  unregisterCard: (id: string) => void;
  setCardHover: (id: string, isHovered: boolean) => void;
  setVelocity: (v: number) => void;
  setMouse: (x: number, y: number) => void;
}

const WebGLContext = createContext<WebGLContextType>({
  registerCard: () => {},
  unregisterCard: () => {},
  setCardHover: () => {},
  setVelocity: () => {},
  setMouse: () => {},
});

export const useWebGLGallery = () => useContext(WebGLContext);

// GLSL Vertex Shader: Curvature hop in 3D space
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vWave;
  uniform float uVelocity;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Aristide Benoist signature convex hop curve
    float hop = sin(vUv.x * 3.14159265);
    float curve = hop * clamp(abs(uVelocity) * 22.0, 0.0, 50.0);
    pos.z += curve;
    vWave = curve;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// GLSL Fragment Shader (Specification from prompt + Aristide aesthetics)
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uVelocity;
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uPlaneAspect;
  uniform vec2 uImageAspect;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    // Precise object-fit: cover mapping
    float planeRatio = uPlaneAspect.x / uPlaneAspect.y;
    float imageRatio = uImageAspect.x / uImageAspect.y;
    vec2 scale = vec2(
      planeRatio > imageRatio ? 1.0 : planeRatio / imageRatio,
      planeRatio > imageRatio ? imageRatio / planeRatio : 1.0
    );
    vec2 uv = (vUv - 0.5) * scale + 0.5;

    // Liquid wave distortion on velocity and time (from specification)
    float wave = sin(uv.y * 10.0 + uTime * 2.0) * cos(uv.x * 10.0 + uTime * 2.0);
    float clampedVel = clamp(uVelocity * 0.08, -1.0, 1.0);
    uv.x += wave * 0.02 * clampedVel;
    uv.y += wave * 0.01 * clampedVel;

    // Subtle lens chromatic aberration on high velocity
    float caOffset = clampedVel * 0.007;
    vec4 rCol = texture2D(uTexture, uv + vec2(caOffset, 0.0));
    vec4 gCol = texture2D(uTexture, uv);
    vec4 bCol = texture2D(uTexture, uv - vec2(caOffset, 0.0));
    vec4 color = vec4(rCol.r, gCol.g, bCol.b, gCol.a);

    // Silver chiaroscuro grayscale ambient tone blending to rich color on hover/focus
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 silverTone = vec3(lum * 0.95, lum * 0.98, lum * 0.95);
    vec3 finalRgb = mix(silverTone, color.rgb, clamp(0.70 + uHover * 0.30, 0.0, 1.0));

    gl_FragColor = vec4(finalRgb, color.a);
  }
`;

export default function WebGLGalleryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<Map<string, RegisteredCard>>(new Map());
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());

  const stateRef = useRef({
    velocity: 0,
    targetVelocity: 0,
    mouse: new THREE.Vector2(0, 0),
    time: 0,
  });

  const setVelocity = useCallback((v: number) => {
    stateRef.current.targetVelocity = v;
  }, []);

  const setMouse = useCallback((x: number, y: number) => {
    stateRef.current.mouse.set(x, y);
  }, []);

  const setCardHover = useCallback((id: string, isHovered: boolean) => {
    const card = cardsRef.current.get(id);
    if (card) {
      card.targetHover = isHovered ? 1.0 : 0.0;
    }
  }, []);

  const registerCard = useCallback(
    (id: string, element: HTMLElement, imageUrl: string) => {
      const existing = cardsRef.current.get(id);
      if (existing) {
        existing.element = element;
        existing.imageUrl = imageUrl;
        return;
      }

      cardsRef.current.set(id, {
        id,
        element,
        imageUrl,
        hover: 0,
        targetHover: 0,
      });
    },
    []
  );

  const unregisterCard = useCallback((id: string) => {
    const card = cardsRef.current.get(id);
    if (card && card.mesh) {
      card.mesh.geometry.dispose();
      card.mesh.material.dispose();
    }
    cardsRef.current.delete(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();

    // Perspective Camera matching 1 Three.js unit = 1 pixel
    const fov = 45;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 3000);
    const computeCameraZ = (h: number) => h / (2 * Math.tan((fov * Math.PI) / 360));
    camera.position.z = computeCameraZ(height);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    const planeGeo = new THREE.PlaneGeometry(1, 1, 32, 32);

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      stateRef.current.time += dt;

      // Smooth velocity lerp
      stateRef.current.velocity +=
        (stateRef.current.targetVelocity - stateRef.current.velocity) * 0.12;

      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // Process and sync all registered cards
      cardsRef.current.forEach((card) => {
        if (!card.element) return;

        // Create Mesh if not exists
        if (!card.mesh) {
          let texture = textureCache.current.get(card.imageUrl);
          if (!texture) {
            texture = textureLoader.load(card.imageUrl, (tex) => {
              tex.generateMipmaps = true;
              tex.minFilter = THREE.LinearMipmapLinearFilter;
              tex.needsUpdate = true;
              if (card.mesh) {
                card.mesh.material.uniforms.uTexture.value = tex;
                card.mesh.material.uniforms.uImageAspect.value.set(
                  tex.image.naturalWidth || 1400,
                  tex.image.naturalHeight || 900
                );
                card.mesh.material.needsUpdate = true;
              }
            });
            textureCache.current.set(card.imageUrl, texture);
          }

          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
            uniforms: {
              uTexture: { value: texture },
              uMouse: { value: stateRef.current.mouse },
              uVelocity: { value: 0 },
              uTime: { value: 0 },
              uHover: { value: 0 },
              uPlaneAspect: { value: new THREE.Vector2(1, 1) },
              uImageAspect: { value: new THREE.Vector2(16, 9) },
            },
          });

          const mesh = new THREE.Mesh(planeGeo, material);
          scene.add(mesh);
          card.mesh = mesh;
          card.texture = texture;
        }

        // Smooth card hover lerp
        card.hover += (card.targetHover - card.hover) * 0.1;

        // Sync position & size from DOM bounding rect
        const rect = card.element.getBoundingClientRect();

        // Frustum culling: render if visible in viewport
        const isVisible =
          rect.right > -150 &&
          rect.left < currentWidth + 150 &&
          rect.bottom > -150 &&
          rect.top < currentHeight + 150 &&
          rect.width > 0 &&
          rect.height > 0;

        card.mesh.visible = isVisible;

        if (isVisible) {
          // Map screen coordinates (top-left) to Three.js centered coordinates
          const x = rect.left - currentWidth / 2 + rect.width / 2;
          const y = -(rect.top - currentHeight / 2 + rect.height / 2);

          card.mesh.scale.set(rect.width, rect.height, 1);
          card.mesh.position.set(x, y, 0);

          // Update Uniforms
          const uniforms = card.mesh.material.uniforms;
          uniforms.uVelocity.value = stateRef.current.velocity;
          uniforms.uTime.value = stateRef.current.time;
          uniforms.uHover.value = card.hover;
          uniforms.uMouse.value.copy(stateRef.current.mouse);
          uniforms.uPlaneAspect.value.set(rect.width, rect.height);
        }
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.position.z = computeCameraZ(height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      planeGeo.dispose();
      cardsRef.current.forEach((card) => {
        if (card.mesh) {
          card.mesh.geometry.dispose();
          card.mesh.material.dispose();
          scene.remove(card.mesh);
        }
      });
      cardsRef.current.clear();
    };
  }, []);

  return (
    <WebGLContext.Provider
      value={{
        registerCard,
        unregisterCard,
        setCardHover,
        setVelocity,
        setMouse,
      }}
    >
      <div ref={containerRef} className="relative w-full h-full">
        {/* Fullscreen Fixed WebGL Canvas placed at z-20 */}
        <canvas
          ref={canvasRef}
          id="gl"
          className="fixed inset-0 w-full h-full pointer-events-none z-20"
        />
        {children}
      </div>
    </WebGLContext.Provider>
  );
}
