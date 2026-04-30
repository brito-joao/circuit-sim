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

  const showDetails = (title: string, desc: string) => setTooltip({ title, desc, visible: true });
  const hideDetails = () => setTooltip((prev) => ({ ...prev, visible: false }));

  // --- PAN & ZOOM LOGIC ---
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

  const getMouseCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left - transform.x) / transform.scale;
    const y = (clientY - rect.top - transform.y) / transform.scale;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If we click a wire handle, don't pan the canvas
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

      // Calculate closest snap target
      let closestTarget: string | null = null;
      let minDist = 20; // Exact Euclidean minimum distance <= 20px

      const allTargets = getAllTargets();
      allTargets.forEach((t) => {
        const dist = Math.hypot(t.x - x, t.y - y);
        if (dist < minDist) {
          minDist = dist;
          closestTarget = t.id;
        }
      });

      if (closestTarget && onWireChange) {
        // Generate new JSON payload
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

  const zoomIn = () => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  const zoomOut = () => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.1) }));
  const resetZoom = () => setTransform({ x: 0, y: 0, scale: 0.85 });
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Ultimate Auto-Wire Cheat
  const autoCompleteCircuit = () => {
    if (!simData.wires) return;
    const totalWires = simData.wires.length;
    let currentStep = -1;
    const interval = setInterval(() => {
      currentStep++;
      setBuildStep(currentStep);
      if (currentStep >= totalWires - 1) {
        clearInterval(interval);
      }
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
    autoCompleteCircuit
  };
};
