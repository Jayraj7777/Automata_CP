import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

export default function DfaGraph({ 
  graphData, 
  activeStateId, 
  activeTransition, 
  visitedStateIds = [] 
}) {
  const svgRef = useRef(null);
  
  // Pan & Zoom state
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Compute clean layout coordinates for nodes
  const layout = useMemo(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return { nodesWithCoords: [], edgesWithPaths: [], width: 800, height: 500 };
    }

    const { nodes, edges, start_state_id, dead_state_id } = graphData;

    // Group nodes by depth (prefix length)
    const depthGroups = {};
    const maxDepth = Math.max(...nodes.map(n => n.depth || 0), 1);

    nodes.forEach(node => {
      // Keep dead state in a dedicated bottom row or right section
      const d = node.id === dead_state_id ? maxDepth + 1 : (node.depth || 0);
      if (!depthGroups[d]) depthGroups[d] = [];
      depthGroups[d].push(node);
    });

    const xSpacing = 160;
    const ySpacing = 85;
    const nodeCoords = {};

    Object.keys(depthGroups).forEach(depthStr => {
      const d = parseInt(depthStr, 10);
      const group = depthGroups[d];
      const count = group.length;

      group.forEach((node, idx) => {
        const x = 90 + d * xSpacing;
        // Center nodes vertically around y = 260
        const yOffset = (idx - (count - 1) / 2) * ySpacing;
        const y = 260 + yOffset;
        nodeCoords[node.id] = { x, y };
      });
    });

    // Special placement for dead state if present
    if (dead_state_id !== undefined && nodeCoords[dead_state_id]) {
      nodeCoords[dead_state_id] = {
        x: 100 + (maxDepth + 0.5) * xSpacing,
        y: 450
      };
    }

    const nodesWithCoords = nodes.map(n => ({
      ...n,
      ...(nodeCoords[n.id] || { x: 100, y: 100 })
    }));

    const edgesWithPaths = edges.map(e => {
      const src = nodeCoords[e.source];
      const tgt = nodeCoords[e.target];
      if (!src || !tgt) return null;

      // Handle self loops
      if (e.source === e.target) {
        const path = `M ${src.x - 10} ${src.y - 25} C ${src.x - 30} ${src.y - 65}, ${src.x + 30} ${src.y - 65}, ${src.x + 10} ${src.y - 25}`;
        const labelPos = { x: src.x, y: src.y - 50 };
        return { ...e, path, labelPos, isSelfLoop: true };
      }

      // Smooth curve between states
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Control point for curve
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;
      const curvature = 25 * (dy === 0 ? 0.3 : (dy > 0 ? 0.2 : -0.2));
      const cx = midX;
      const cy = midY + curvature;

      const path = `M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`;
      const labelPos = { x: cx, y: cy - 8 };

      return { ...e, path, labelPos, isSelfLoop: false };
    }).filter(Boolean);

    return {
      nodesWithCoords,
      edgesWithPaths,
      width: Math.max(900, (maxDepth + 2) * xSpacing + 200),
      height: 600
    };
  }, [graphData]);

  // Handle Drag to Pan
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.min(Math.max(0.3, z * zoomFactor), 3.0));
  };

  const handleFitToScreen = () => {
    setPan({ x: 50, y: 30 });
    setZoom(0.85);
  };

  const handleResetZoom = () => {
    setPan({ x: 60, y: 40 });
    setZoom(1);
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden select-none">
      
      {/* Zoom and Pan Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.2, 3.0))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z * 0.8, 0.3))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          title="Fit to Screen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center space-x-4 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400"></span>
          <span>Start State (q0)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </span>
          <span>Accepting State (F)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Current Active</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-400"></span>
          <span>Trap State (q_dead)</span>
        </div>
      </div>

      {/* Hovered Node Tooltip */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 z-20 p-3 rounded-xl bg-slate-900/95 border border-slate-700 backdrop-blur-md text-xs font-mono shadow-xl space-y-1">
          <div className="font-bold text-slate-100 flex items-center space-x-1.5">
            <span>State: {hoveredNode.label}</span>
            {hoveredNode.is_start && <span className="text-amber-400">(Start State)</span>}
            {hoveredNode.is_accepting && <span className="text-emerald-400">(Accepting)</span>}
            {hoveredNode.is_dead && <span className="text-rose-400">(Trap/Dead State)</span>}
          </div>
          <div className="text-slate-300">
            Prefix: <span className="text-amber-300 font-semibold">"{hoveredNode.prefix || 'ε'}"</span>
          </div>
          {hoveredNode.keyword && (
            <div className="text-emerald-400 font-bold">
              Matches Keyword: "{hoveredNode.keyword}"
            </div>
          )}
          <div className="text-slate-500">
            Depth from Root: {hoveredNode.depth}
          </div>
        </div>
      )}

      {/* Main Interactive SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Default directed arrow marker */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
          </marker>

          {/* Active highlighted arrow marker */}
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>

          {/* Start incoming arrow marker */}
          <marker
            id="arrow-start"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
        </defs>

        {/* Pan and Zoom Transformation Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          
          {/* Subtle background grid */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#grid)" />

          {/* 1. Directed Transition Edges */}
          {layout.edgesWithPaths.map((edge) => {
            const isEdgeActive = 
              activeTransition && 
              edge.source === activeTransition.from && 
              edge.target === activeTransition.to && 
              edge.label === activeTransition.char;

            return (
              <g key={edge.id}>
                {/* Edge Path */}
                <path
                  d={edge.path}
                  fill="none"
                  stroke={isEdgeActive ? "#38bdf8" : "#475569"}
                  strokeWidth={isEdgeActive ? "3" : "1.8"}
                  markerEnd={isEdgeActive ? "url(#arrow-active)" : "url(#arrow)"}
                  className={isEdgeActive ? "active-edge" : "transition-colors duration-300"}
                />

                {/* Edge Character Label */}
                <rect
                  x={edge.labelPos.x - 9}
                  y={edge.labelPos.y - 8}
                  width="18"
                  height="16"
                  rx="4"
                  fill="#0f172a"
                  stroke={isEdgeActive ? "#38bdf8" : "#334155"}
                  strokeWidth="1"
                />
                <text
                  x={edge.labelPos.x}
                  y={edge.labelPos.y + 4}
                  textAnchor="middle"
                  fill={isEdgeActive ? "#38bdf8" : "#cbd5e1"}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* 2. States / Nodes */}
          {layout.nodesWithCoords.map((node) => {
            const isActive = activeStateId === node.id;
            const isVisited = visitedStateIds.includes(node.id);
            const isDead = node.is_dead;
            const isAccepting = node.is_accepting;
            const isStart = node.is_start;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Start State Indicator Arrow */}
                {isStart && (
                  <g transform="translate(-45, 0)">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-start)" />
                    <text x="-4" y="-5" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      START
                    </text>
                  </g>
                )}

                {/* Outer Glow for Active State */}
                {isActive && (
                  <circle
                    r="28"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    className="active-state-node"
                    opacity="0.9"
                  />
                )}

                {/* Accepting State Outer Ring (Formal Double Circle) */}
                {isAccepting && (
                  <circle
                    r="24"
                    fill="none"
                    stroke={isActive ? "#38bdf8" : "#10b981"}
                    strokeWidth="2"
                    strokeDasharray={isActive ? "none" : "none"}
                  />
                )}

                {/* Primary Node Circle */}
                <circle
                  r="20"
                  fill={
                    isActive 
                      ? "#0284c7" 
                      : isDead 
                      ? "#450a0a" 
                      : isAccepting 
                      ? "#064e3b" 
                      : isVisited 
                      ? "#1e293b" 
                      : "#0f172a"
                  }
                  stroke={
                    isActive 
                      ? "#38bdf8" 
                      : isDead 
                      ? "#ef4444" 
                      : isAccepting 
                      ? "#10b981" 
                      : isVisited 
                      ? "#64748b" 
                      : "#334155"
                  }
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* State Label */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill={
                    isActive 
                      ? "#ffffff" 
                      : isDead 
                      ? "#fca5a5" 
                      : isAccepting 
                      ? "#6ee7b7" 
                      : "#e2e8f0"
                  }
                  fontSize={node.label.length > 3 ? "9" : "11"}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>

                {/* State Prefix Badge below node */}
                <text
                  textAnchor="middle"
                  dy="34"
                  fill={isDead ? "#ef4444" : isAccepting ? "#34d399" : "#94a3b8"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {node.is_dead ? "TRAP" : `"${node.prefix || 'ε'}"`}
                </text>

                {/* Keyword label tag if accepting */}
                {isAccepting && node.keyword && (
                  <g transform="translate(0, -29)">
                    <rect
                      x="-26"
                      y="-12"
                      width="52"
                      height="15"
                      rx="4"
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="-2"
                      fill="#a7f3d0"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.keyword}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

        </g>
      </svg>
    </div>
  );
}
