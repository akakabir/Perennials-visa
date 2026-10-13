'use client';

import React, { useEffect, useRef, useState } from 'react';
import './SpecularButton.css';

const TAU = Math.PI * 2;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT = `#version 300 es
precision mediump float;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uPx;
uniform float uSpot;
uniform vec2 uEntry;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform vec2 uWindow;
uniform float uThickness;
uniform float uGlow;
out vec4 outColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float loopPosition(vec2 p, vec2 b, float r) {
  vec2 inner = b - r;
  float arc = 1.5707963 * r;
  float quarter = inner.x + inner.y + arc;
  vec2 a = abs(p);
  vec2 q = a - inner;
  float s = q.x > 0.0 && q.y > 0.0
    ? inner.y + atan(q.y, q.x) * r
    : (q.x > q.y ? min(a.y, inner.y) : inner.y + arc + inner.x - min(a.x, inner.x));
  if (p.x < 0.0) s = p.y >= 0.0 ? 2.0 * quarter - s : 2.0 * quarter + s;
  else if (p.y < 0.0) s = 4.0 * quarter - s;
  return s / max(4.0 * quarter, 0.0001);
}

float lobe(float position, float center) {
  float gap = abs(fract(position - center + 0.5) - 0.5);
  return 1.0 - smoothstep(uWindow.x, uWindow.x + uWindow.y, gap);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = roundedBox(p, uHalf, uRadius);
  float position = loopPosition(p, uHalf, uRadius);
  float key = lobe(position, uSpot);
  float back = lobe(position, uSpot + 0.5);
  float streak = key + back * 0.45;
  float width = max(uThickness * uPx * mix(1.0, max(key, back), 0.6), 0.35);
  float band = smoothstep(-width - 0.6, -width + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float hair = smoothstep(-uPx - 0.6, -uPx + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float inside = 1.0 - smoothstep(-0.6, 0.6, d);
  vec2 pool = (p - uEntry) / (uHalf.y * vec2(1.6, 1.1));
  float glow = streak * 0.2 * exp(-abs(d + width * 0.5) / (5.0 * uPx)) + inside * 0.08 * exp(-dot(pool, pool));
  float light = clamp((band * streak + glow * uGlow) * uIntensity, 0.0, 1.0);
  vec4 base = vec4(uBaseColor, 1.0) * hair * 0.6;
  outColor = vec4(uLineColor, 1.0) * light + base * (1.0 - light);
}
`;

const UNIFORMS = [
  'uCenter',
  'uHalf',
  'uRadius',
  'uPx',
  'uSpot',
  'uEntry',
  'uLineColor',
  'uBaseColor',
  'uIntensity',
  'uWindow',
  'uThickness',
  'uGlow'
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const wrap = (value: number) => value - Math.floor(value);

const loopPosition = (x: number, y: number, halfX: number, halfY: number, r: number) => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const qx = ax - innerX;
  const qy = ay - innerY;
  let s: number;
  if (qx > 0 && qy > 0) s = innerY + Math.atan2(qy, qx) * r;
  else if (qx > qy) s = Math.min(ay, innerY);
  else s = innerY + arc + innerX - Math.min(ax, innerX);
  if (x < 0) s = y >= 0 ? 2 * quarter - s : 2 * quarter + s;
  else if (y < 0) s = 4 * quarter - s;
  return wrap(s / Math.max(4 * quarter, 0.0001));
};

const rimPoint = (position: number, halfX: number, halfY: number, r: number): [number, number] => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  let s = wrap(position) * 4 * quarter;
  let signX = 1;
  let signY = 1;
  if (s > 3 * quarter) {
    s = 4 * quarter - s;
    signY = -1;
  } else if (s > 2 * quarter) {
    s -= 2 * quarter;
    signX = -1;
    signY = -1;
  } else if (s > quarter) {
    s = 2 * quarter - s;
    signX = -1;
  }
  let x = innerX - (s - innerY - arc);
  let y = halfY;
  if (s <= innerY) {
    x = halfX;
    y = s;
  } else if (s <= innerY + arc) {
    const angle = (s - innerY) / Math.max(r, 0.0001);
    x = innerX + Math.cos(angle) * r;
    y = innerY + Math.sin(angle) * r;
  }
  return [x * signX, y * signY];
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl: WebGL2RenderingContext) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};

const parseColor = (color: string): [number, number, number] => {
  if (!color || color === 'transparent') return [1, 1, 1];
  if (color.startsWith('#')) {
    let c = color.slice(1);
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    const n = parseInt(c, 16);
    if (!isNaN(n)) {
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
  }
  const match = color.match(/[\d.]+/g);
  if (match && match.length >= 3) {
    return [parseFloat(match[0]) / 255, parseFloat(match[1]) / 255, parseFloat(match[2]) / 255];
  }
  return [1, 1, 1];
};

export type SpecularButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  idleIntensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const SpecularButton = ({
  children = 'Get Started',
  size = 'md',
  radius = 9999,
  tint = '#E2B87C',
  tintOpacity = 1,
  blur = 0,
  textColor = '#0A0A31',
  lineColor = '#ffffff',
  baseColor = '#C89B55',
  intensity = 1.2,
  idleIntensity = 0.35,
  shineSize = 12,
  shineFade = 36,
  thickness = 1.4,
  glow = 1.2,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  className = '',
  type = 'button',
  style,
  ...rest
}: SpecularButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const settings = {
    radius: Math.max(0, radius),
    lineColor: String(lineColor),
    baseColor: String(baseColor),
    intensity: Math.max(0, intensity),
    idleIntensity: clamp(idleIntensity, 0, 1),
    shineSize: Math.max(0, shineSize),
    shineFade: Math.max(0, shineFade),
    thickness: Math.max(0, thickness),
    glow: Math.max(0, glow),
    speed,
    followMouse,
    proximity: Math.max(1, proximity),
    autoAnimate,
    disabled
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    if (!button || !canvas) return;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false
      });
    } catch {
      gl = null;
    }

    if (!gl) return;

    const program = link(gl);
    if (!program) return;

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    for (const name of UNIFORMS) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Full screen triangle
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let currentSpot = 0.25;
    let currentIntensity = settingsRef.current.idleIntensity;
    let targetIntensity = settingsRef.current.idleIntensity;
    let targetSpot = 0.25;
    let mouseActive = false;
    let mouseX = 0;
    let mouseY = 0;
    let rafId = 0;
    let lastTime = performance.now();
    let isRunning = true;
    let cachedRect = button.getBoundingClientRect();

    const updateSize = () => {
      if (!button || !canvas || !gl) return;
      const rect = button.getBoundingClientRect();
      cachedRect = rect;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(button);
    }

    const updateRect = () => {
      if (button) cachedRect = button.getBoundingClientRect();
    };
    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });

    const onPointerMove = (e: PointerEvent) => {
      if (settingsRef.current.disabled) return;
      const rect = cachedRect;
      const prox = settingsRef.current.proximity;
      const withinX = e.clientX >= rect.left - prox && e.clientX <= rect.right + prox;
      const withinY = e.clientY >= rect.top - prox && e.clientY <= rect.bottom + prox;
      if (withinX && withinY) {
        mouseActive = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
      } else {
        mouseActive = false;
      }
    };

    const onPointerLeave = () => {
      mouseActive = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const render = (time: number) => {
      if (!isRunning || !gl || !button) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const st = settingsRef.current;
      const rect = button.getBoundingClientRect();
      cachedRect = rect;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const cw = canvas.width;
      const ch = canvas.height;
      if (cw <= 0 || ch <= 0) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const halfX = width * 0.5;
      const halfY = height * 0.5;

      // Extract exact computed border radius from CSS or prop to guarantee edge match
      const computedStyle = window.getComputedStyle(button);
      const parsedCssRadius = parseFloat(computedStyle.borderTopLeftRadius);
      const effectiveRadius = !isNaN(parsedCssRadius) && parsedCssRadius > 0
        ? parsedCssRadius
        : (st.radius >= 999 ? halfY : st.radius);
      const clampedRadius = Math.min(effectiveRadius, halfX, halfY);

      // In canvas raster space
      const canvasHalfX = cw * 0.5;
      const canvasHalfY = ch * 0.5;
      const r = clampedRadius * (ch / (height || 1));

      const mx = mouseX - (rect.left + halfX);
      const my = (rect.top + halfY) - mouseY;

      const qx = Math.max(0, Math.abs(mx) - (halfX - clampedRadius));
      const qy = Math.max(0, Math.abs(my) - (halfY - clampedRadius));
      const dist = mouseActive ? Math.max(0, Math.hypot(qx, qy) - clampedRadius) : Infinity;

      if (mouseActive && dist < st.proximity) {
        const proximityT = 1 - dist / st.proximity;
        targetIntensity = st.idleIntensity + (st.intensity - st.idleIntensity) * proximityT;
        if (st.followMouse) {
          targetSpot = loopPosition(mx, my, halfX, halfY, clampedRadius);
        }
      } else {
        targetIntensity = st.idleIntensity;
        if (st.autoAnimate) {
          targetSpot = wrap(currentSpot + st.speed * dt);
        }
      }

      if (st.followMouse && mouseActive && dist < st.proximity) {
        let diff = (targetSpot - currentSpot) % 1;
        if (diff > 0.5) diff -= 1;
        if (diff < -0.5) diff += 1;
        currentSpot = wrap(currentSpot + diff * 0.2);
      } else if (st.autoAnimate) {
        currentSpot = wrap(currentSpot + st.speed * dt);
      }

      currentIntensity += (targetIntensity - currentIntensity) * 0.18;

      let entryX = 0;
      let entryY = 0;
      if (mouseActive && dist < st.proximity) {
        entryX = clamp(mx, -(halfX - clampedRadius), halfX - clampedRadius);
        entryY = clamp(my, -(halfY - clampedRadius), halfY - clampedRadius);
      } else {
        const rp = rimPoint(currentSpot, halfX, halfY, clampedRadius);
        entryX = rp[0] * 0.5;
        entryY = rp[1] * 0.5;
      }

      const lineRgb = parseColor(st.lineColor);
      const baseRgb = parseColor(st.baseColor);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(uniforms.uCenter, canvasHalfX, canvasHalfY);
      gl.uniform2f(uniforms.uHalf, canvasHalfX, canvasHalfY);
      gl.uniform1f(uniforms.uRadius, r);
      gl.uniform1f(uniforms.uPx, dpr);
      gl.uniform1f(uniforms.uSpot, currentSpot);
      gl.uniform2f(uniforms.uEntry, entryX * (cw / (width || 1)), entryY * (ch / (height || 1)));
      gl.uniform3f(uniforms.uLineColor, lineRgb[0], lineRgb[1], lineRgb[2]);
      gl.uniform3f(uniforms.uBaseColor, baseRgb[0], baseRgb[1], baseRgb[2]);
      gl.uniform1f(uniforms.uIntensity, currentIntensity);
      gl.uniform2f(uniforms.uWindow, st.shineSize / 360, st.shineFade / 360);
      gl.uniform1f(uniforms.uThickness, st.thickness);
      gl.uniform1f(uniforms.uGlow, st.glow);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafId);
    };

    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      resizeObserver?.disconnect();
      if (gl) {
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
      }
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  const resolvedBg = tint && tint !== 'transparent'
    ? (tintOpacity >= 0.99 ? tint : `color-mix(in srgb, ${tint} ${(tintOpacity * 100).toFixed(0)}%, transparent)`)
    : 'transparent';

  const resolvedRadius = radius >= 999 ? '9999px' : `${radius}px`;

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`specular-button specular-button--${size}${isHovered ? ' specular-button--hovered' : ''}${className ? ` ${className}` : ''}`}
      style={{
        borderRadius: resolvedRadius,
        color: textColor,
        backgroundColor: resolvedBg,
        backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        ...style
      }}
      {...rest}
    >
      <canvas ref={canvasRef} className="specular-button__canvas" />
      <span className="specular-button__content">{children}</span>
    </button>
  );
};

export default SpecularButton;
