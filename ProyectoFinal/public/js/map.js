import { state, nodeById, edgeById, setSelection } from './state.js';
import { renderControls, renderResultSummary, showToast } from './ui.js';

let map;
let nodeLayer;
let edgeLayer;
let resultLayer;
let weightLayer;
let nodeMarkers = new Map();
let tileErrorNotified = false;

const ZACATECAS_CENTER = [22.7709, -102.5833];
const ZACATECAS_BOUNDS = [
  [22.705, -102.650],
  [22.815, -102.485]
];

const fallbackTileSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#e8eef5"/>
    <path d="M0 64H256M0 128H256M0 192H256M64 0V256M128 0V256M192 0V256" stroke="#cbd5e1" stroke-width="1" opacity="0.65"/>
    <path d="M-20 210C38 170 82 188 128 146C168 110 196 104 276 72" stroke="#b7c5d6" stroke-width="10" fill="none" opacity="0.45"/>
    <path d="M-20 210C38 170 82 188 128 146C168 110 196 104 276 72" stroke="#f8fafc" stroke-width="5" fill="none" opacity="0.85"/>
  </svg>
`);

const mapOptions = {
  zoomControl: false,
  attributionControl: true,
  maxBounds: ZACATECAS_BOUNDS,
  maxBoundsViscosity: 0.95,
  minZoom: 12,
  maxZoom: 18,
  wheelDebounceTime: 50,
  preferCanvas: false
};

function createPane(name, zIndex, pointerEvents = 'auto') {
  if (!map.getPane(name)) {
    map.createPane(name);
  }
  const pane = map.getPane(name);
  pane.style.zIndex = String(zIndex);
  pane.style.pointerEvents = pointerEvents;
}

function prepareMapPanes() {
  createPane('graphPane', 410, 'none');
  createPane('resultPane', 670, 'none');
  createPane('weightPane', 680, 'none');
  createPane('nodePane', 730, 'auto');
}

function forceMapRefresh() {
  if (!map) return;
  requestAnimationFrame(() => {
    map.invalidateSize({ animate: false });
  });
}

function nodeIcon(node) {
  let className = 'node-marker';
  if (state.originId === node.id) className += ' origin';
  if (state.destinationId === node.id) className += ' destination';
  if (node.type === 'service') className += ' service';
  if (node.type === 'transport') className += ' transport';
  if (node.type === 'education') className += ' education';

  return L.divIcon({
    className: '',
    html: `<div class="${className}" title="${node.name}"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

function haversine(a, b) {
  const radius = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function nearestNode(latlng) {
  let best = null;
  let bestDistance = Infinity;
  state.graph.nodes.forEach((node) => {
    const distance = haversine({ lat: latlng.lat, lng: latlng.lng }, node);
    if (distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  });
  return best;
}

function clearActiveResult() {
  state.result = null;
  state.routeCoordinates = [];
  drawResult();
}

function assignNodeFromMap(node) {
  if (!state.originId || (state.originId && state.destinationId)) {
    setSelection('origin', node.id);
    state.destinationId = null;
    showToast(`Origen asignado: ${node.name}`);
  } else {
    setSelection('destination', node.id);
    showToast(`Destino asignado: ${node.name}`);
  }
  clearActiveResult();
  renderGraph();
  renderControls();
  renderResultSummary();
}

function notifyTileError() {
  if (tileErrorNotified) return;
  tileErrorNotified = true;
  console.warn('Algunos tiles del mapa no cargaron. Se mantiene el grafo sobre el fondo local de respaldo.');
}

export function initializeMap() {
  map = L.map('map', mapOptions).setView(ZACATECAS_CENTER, 14);
  prepareMapPanes();
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    minZoom: 12,
    maxZoom: 19,
    bounds: ZACATECAS_BOUNDS,
    noWrap: true,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 4,
    detectRetina: false,
    crossOrigin: true,
    errorTileUrl: `data:image/svg+xml;charset=UTF-8,${fallbackTileSvg}`
  })
    .on('tileerror', notifyTileError)
    .addTo(map);

  edgeLayer = L.layerGroup().addTo(map);
  resultLayer = L.layerGroup().addTo(map);
  weightLayer = L.layerGroup().addTo(map);
  nodeLayer = L.layerGroup().addTo(map);

  map.on('click', (event) => {
    const node = nearestNode(event.latlng);
    if (node) assignNodeFromMap(node);
  });

  map.whenReady(() => {
    forceMapRefresh();
    setTimeout(forceMapRefresh, 250);
    setTimeout(forceMapRefresh, 700);
  });
  window.addEventListener('resize', forceMapRefresh);

  return map;
}

export function getMap() {
  return map;
}

export function fitToZacatecas() {
  if (!map) return;
  forceMapRefresh();
  map.setView(ZACATECAS_CENTER, 14, { animate: true });
}

export function fitToGraph() {
  if (!map || state.graph.nodes.length === 0) return;
  forceMapRefresh();
  const bounds = L.latLngBounds(state.graph.nodes.map((node) => [node.lat, node.lng]));
  map.fitBounds(bounds.pad(0.14), {
    animate: true,
    padding: [34, 34],
    maxZoom: 14
  });
}

function drawWeightLabel(edge, source, target) {
  if (!state.showWeights) return;
  const lat = (source.lat + target.lat) / 2;
  const lng = (source.lng + target.lng) / 2;
  const value = Number(edge[state.weightKey]).toFixed(1);
  L.marker([lat, lng], {
    interactive: false,
    pane: 'weightPane',
    icon: L.divIcon({
      className: '',
      html: `<span class="weight-label">${value}</span>`,
      iconSize: [48, 22],
      iconAnchor: [24, 11]
    })
  }).addTo(weightLayer);
}

export function renderGraph() {
  if (!map) return;
  edgeLayer.clearLayers();
  nodeLayer.clearLayers();
  weightLayer.clearLayers();
  nodeMarkers.clear();

  if (state.showGraph) {
    state.graph.edges.forEach((edge) => {
      const source = nodeById(edge.sourceId);
      const target = nodeById(edge.targetId);
      if (!source || !target) return;
      L.polyline([[source.lat, source.lng], [target.lat, target.lng]], {
        pane: 'graphPane',
        color: '#64748b',
        weight: 3.5,
        opacity: 0.72,
        dashArray: '6 7',
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
        className: 'graph-edge-line'
      }).addTo(edgeLayer);
      drawWeightLabel(edge, source, target);
    });
  }

  state.graph.nodes.forEach((node) => {
    const marker = L.marker([node.lat, node.lng], {
      icon: nodeIcon(node),
      pane: 'nodePane',
      zIndexOffset: 900
    })
      .bindTooltip(`<strong>${node.name}</strong><br>${node.description || node.id}`, {
        direction: 'top',
        opacity: 0.96,
        sticky: true
      })
      .on('click', (event) => {
        event.originalEvent.stopPropagation();
        assignNodeFromMap(node);
      });
    marker.addTo(nodeLayer);
    nodeMarkers.set(node.id, marker);
  });

  forceMapRefresh();
}

function coordinatesFromNodeIds(nodeIds = []) {
  return nodeIds
    .map((id) => nodeById(id))
    .filter(Boolean)
    .map((node) => [node.lat, node.lng]);
}

function edgeCoordinates(edgeId) {
  const edge = edgeById(edgeId);
  if (!edge) return null;
  const source = nodeById(edge.sourceId);
  const target = nodeById(edge.targetId);
  if (!source || !target) return null;
  return [[source.lat, source.lng], [target.lat, target.lng]];
}

function drawHighlightedPolyline(coordinates, options = {}) {
  if (!coordinates || coordinates.length < 2) return null;

  L.polyline(coordinates, {
    pane: 'resultPane',
    color: 'rgba(15, 23, 42, 0.33)',
    weight: (options.weight || 8) + 8,
    opacity: 0.46,
    lineCap: 'round',
    lineJoin: 'round',
    interactive: false,
    className: 'result-line-shadow'
  }).addTo(resultLayer);

  const line = L.polyline(coordinates, {
    pane: 'resultPane',
    color: options.color || '#0284c7',
    weight: options.weight || 8,
    opacity: options.opacity || 0.98,
    lineCap: 'round',
    lineJoin: 'round',
    interactive: false,
    className: options.className || 'result-route-line'
  }).addTo(resultLayer);

  if (typeof line.bringToFront === 'function') line.bringToFront();
  return line;
}

function drawRouteNodeBadges(nodeIds = []) {
  nodeIds.forEach((nodeId, index) => {
    const node = nodeById(nodeId);
    if (!node) return;
    const badge = index + 1;
    L.marker([node.lat, node.lng], {
      interactive: false,
      pane: 'nodePane',
      zIndexOffset: 1100,
      icon: L.divIcon({
        className: '',
        html: `<div class="route-step-badge">${badge}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(resultLayer);
  });
}

function collectAndDrawEdges(edgeIds = [], options = {}) {
  const boundsCoordinates = [];
  edgeIds.forEach((edgeId) => {
    const segment = edgeCoordinates(edgeId);
    if (!segment) return;
    boundsCoordinates.push(...segment);
    drawHighlightedPolyline(segment, options);
  });
  return boundsCoordinates;
}

export function drawResult() {
  if (!map || !resultLayer) return;

  resultLayer.clearLayers();
  state.routeCoordinates = [];
  forceMapRefresh();

  if (!state.result) return;

  const result = state.result;
  let boundsCoordinates = [];

  if (result.algorithm === 'dijkstra') {
    const routeCoordinates = coordinatesFromNodeIds(result.pathNodes || []);
    const edgeIds = Array.isArray(result.pathEdges) && result.pathEdges.length
      ? result.pathEdges
      : result.selectedEdges || [];

    if (edgeIds.length) {
      boundsCoordinates = collectAndDrawEdges(edgeIds, {
        color: '#0284c7',
        weight: 10,
        className: 'result-route-line'
      });
    }

    if (routeCoordinates.length > 1) {
      state.routeCoordinates = routeCoordinates;
      boundsCoordinates = routeCoordinates;
      drawHighlightedPolyline(routeCoordinates, {
        color: '#0ea5e9',
        weight: 6,
        opacity: 0.84,
        className: 'result-route-core-line'
      });
      drawRouteNodeBadges(result.pathNodes || []);
    }
  }

  if (['prim', 'kruskal'].includes(result.algorithm) && Array.isArray(result.selectedEdges)) {
    boundsCoordinates = collectAndDrawEdges(result.selectedEdges, {
      color: result.algorithm === 'prim' ? '#10b981' : '#8b5cf6',
      weight: 9,
      className: 'result-tree-line'
    });
  }

  resultLayer.eachLayer((layer) => {
    if (typeof layer.bringToFront === 'function') layer.bringToFront();
  });

  if (boundsCoordinates.length > 1) {
    map.fitBounds(L.latLngBounds(boundsCoordinates).pad(0.20), {
      animate: true,
      padding: [40, 40],
      maxZoom: 15
    });
    setTimeout(forceMapRefresh, 180);
  } else {
    showToast('El algoritmo calculó resultado, pero no se encontraron coordenadas válidas para dibujarlo.');
  }
}
