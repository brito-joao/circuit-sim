import { useState, useRef, useEffect } from 'react';
import { CircuitData } from '@/lib/types';

export const useBreadboard = (
  simData: CircuitData,
  onWireChange: ((newSimData: CircuitData) => void) | undefined,
  getAllTargets: () => any[]
) => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false); // Light mode by default

  // New Modes
  const [xRayMode, setXRayMode] = useState(false);
  const [buildStep, setBuildStep] = useState(-1);

  // Tooltip State
  const [tooltip, setTooltip] = useState<{ title: string; desc: string; visible: boolean }>({
    title: '', desc: '', visible: false,
  });

  // Pan & Zoom State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.85 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clickStartPos, setClickStartPos] = useState({ x: 0, y: 0 });

  // Wire Dragging State
  const [draggingWire, setDraggingWire] = useState<{ id: string; end: 'from' | 'to'; mouseX: number; mouseY: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Track pinch gesture state in refs (no re-render needed between frames)
  const lastPinchDist  = useRef<number | null>(null);
  const lastTouchMidpt = useRef<{ x: number; y: number } | null>(null);
  const touchStartPos  = useRef<{ x: number; y: number } | null>(null);
  const isTouchPanning = useRef(false);

  const showDetails = (title: string, desc: string) => setTooltip({ title, desc, visible: true });
  const hideDetails = () => setTooltip((prev) => ({ ...prev, visible: false }));

  // ─── Desktop: Wheel Zoom ────────────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;

      setTransform((prev) => {
        const newScale = Math.min(Math.max(0.1, prev.scale * (1 + delta)), 5);
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - ((mouseX - prev.x) * (newScale / prev.scale));
        const newY = mouseY - ((mouseY - prev.y) * (newScale / prev.scale));

        return { x: newX, y: newY, scale: newScale };
      });
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, []);

  // ─── Touch: Pan (1 finger) + Pinch Zoom (2 fingers) ────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const getDistance = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const getMidpoint = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });

    const handleTouchStart = (e: TouchEvent) => {
      // Always prevent default to stop the browser's own scroll/zoom
      e.preventDefault();

      if (e.touches.length === 2) {
        // Pinch start
        lastPinchDist.current  = getDistance(e.touches);
        lastTouchMidpt.current = getMidpoint(e.touches);
        isTouchPanning.current = false;
      } else if (e.touches.length === 1) {
        // Single-finger pan start
        const t = e.touches[0];
        touchStartPos.current  = { x: t.clientX, y: t.clientY };
        lastTouchMidpt.current = { x: t.clientX, y: t.clientY };
        isTouchPanning.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        // ── Pinch zoom + two-finger pan ─────────────────────────────────────
        const newDist   = getDistance(e.touches);
        const newMidpt  = getMidpoint(e.touches);
        const prevDist  = lastPinchDist.current  ?? newDist;
        const prevMidpt = lastTouchMidpt.current ?? newMidpt;

        const scaleFactor = newDist / prevDist;
        const rect = svg.getBoundingClientRect();
        const pivotX = newMidpt.x - rect.left;
        const pivotY = newMidpt.y - rect.top;

        setTransform((prev) => {
          const newScale = Math.min(Math.max(0.1, prev.scale * scaleFactor), 5);
          // Scale toward the pinch midpoint, then apply two-finger pan delta
          const panDx = newMidpt.x - prevMidpt.x;
          const panDy = newMidpt.y - prevMidpt.y;
          const newX  = pivotX - ((pivotX - prev.x) * (newScale / prev.scale)) + panDx;
          const newY  = pivotY - ((pivotY - prev.y) * (newScale / prev.scale)) + panDy;
          return { x: newX, y: newY, scale: newScale };
        });

        lastPinchDist.current  = newDist;
        lastTouchMidpt.current = newMidpt;

      } else if (e.touches.length === 1 && isTouchPanning.current) {
        // ── Single-finger pan ────────────────────────────────────────────────
        const t    = e.touches[0];
        const prev = lastTouchMidpt.current ?? { x: t.clientX, y: t.clientY };
        const dx   = t.clientX - prev.x;
        const dy   = t.clientY - prev.y;

        setTransform((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
        lastTouchMidpt.current = { x: t.clientX, y: t.clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length < 2) {
        lastPinchDist.current = null;
      }
      if (e.touches.length === 0) {
        isTouchPanning.current = false;
        lastTouchMidpt.current = null;
        touchStartPos.current  = null;
      }
    };

    svg.addEventListener('touchstart',  handleTouchStart,  { passive: false });
    svg.addEventListener('touchmove',   handleTouchMove,   { passive: false });
    svg.addEventListener('touchend',    handleTouchEnd,    { passive: false });
    svg.addEventListener('touchcancel', handleTouchEnd,    { passive: false });

    return () => {
      svg.removeEventListener('touchstart',  handleTouchStart);
      svg.removeEventListener('touchmove',   handleTouchMove);
      svg.removeEventListener('touchend',    handleTouchEnd);
      svg.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []); // no deps — transform updates go through setTransform functional form

  // ─── Mouse handlers (desktop only) ─────────────────────────────────────────
  const getMouseCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left - transform.x) / transform.scale;
    const y = (clientY - rect.top - transform.y) / transform.scale;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('wire-handle')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    setClickStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingWire) {
      const { x, y } = getMouseCoords(e.clientX, e.clientY);
      setDraggingWire((prev) => prev ? { ...prev, mouseX: x, mouseY: y } : null);
      return;
    }
    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);

    if (draggingWire) {
      const { x, y } = getMouseCoords(e.clientX, e.clientY);
      let closestTarget: string | null = null;
      let minDist = 20;

      const allTargets = getAllTargets();
      allTargets.forEach((t) => {
        const dist = Math.hypot(t.x - x, t.y - y);
        if (dist < minDist) {
          minDist = dist;
          closestTarget = t.id;
        }
      });

      if (closestTarget && onWireChange) {
        const newSimData = { ...simData };
        newSimData.wires = newSimData.wires?.map(w => {
          if (w.id === draggingWire.id) {
            return { ...w, [draggingWire.end]: closestTarget };
          }
          return w;
        });
        onWireChange(newSimData);
      }
      setDraggingWire(null);
    }
  };

  const handleSafeClick = (e: React.MouseEvent, callback: () => void) => {
    const dx = Math.abs(e.clientX - clickStartPos.x);
    const dy = Math.abs(e.clientY - clickStartPos.y);
    if (dx < 5 && dy < 5) callback();
  };

  const zoomIn     = () => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  const zoomOut    = () => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.1) }));
  const resetZoom  = () => setTransform({ x: 0, y: 0, scale: 0.85 });
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Auto-wire cheat
  const autoCompleteCircuit = () => {
    if (!simData.wires) return;
    const totalWires = simData.wires.length;
    let currentStep = -1;
    const interval = setInterval(() => {
      currentStep++;
      setBuildStep(currentStep);
      if (currentStep >= totalWires - 1) clearInterval(interval);
    }, 100);
  };

  return {
    isDarkMode,
    tooltip,
    transform,
    isDragging,
    draggingWire,
    setDraggingWire,
    svgRef,
    showDetails,
    hideDetails,
    getMouseCoords,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSafeClick,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleTheme,
    xRayMode,
    setXRayMode,
    buildStep,
    setBuildStep,
    autoCompleteCircuit,
  };
};
