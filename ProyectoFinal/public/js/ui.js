import { api } from './api.js';
import { state, resetSelection } from './state.js';
import { renderGraph, drawResult } from './map.js';

const refs = {};
let toastTimeout = null;

// Solo los elementos que realmente existen en tu nueva barra superior
const refIds = [
  'originSelect',
  'destinationSelect',
  'btnClearSelection',
  'btnRunAlgorithm',
  'toast'
];

export function bindDom() {
  refIds.forEach((id) => {
    refs[id] = document.getElementById(id);
  });

  // Control de los botones de Algoritmo (Dijkstra, Prim, Kruskal)
  document.querySelectorAll('[data-algorithm]').forEach((button) => {
    button.addEventListener('click', () => {
      state.algorithm = button.dataset.algorithm;
      state.result = null;
      state.routeCoordinates = [];
      document.querySelectorAll('[data-algorithm]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      renderControls();
      drawResult();
      renderGraph();
    });
  });

  // Cuando el usuario cambia el Origen manualmente
  refs.originSelect.addEventListener('change', (event) => {
    state.originId = event.target.value || null;
    if (state.originId === state.destinationId) state.destinationId = null;
    state.result = null;
    state.routeCoordinates = [];
    renderControls();
    renderGraph();
    drawResult();
  });

  // Cuando el usuario cambia el Destino manualmente
  refs.destinationSelect.addEventListener('change', (event) => {
    state.destinationId = event.target.value || null;
    if (state.originId === state.destinationId) state.originId = null;
    state.result = null;
    state.routeCoordinates = [];
    renderControls();
    renderGraph();
    drawResult();
  });

  // Botón Limpiar
  refs.btnClearSelection.addEventListener('click', () => {
    resetSelection();
    renderControls();
    renderGraph();
    drawResult();
    showToast('Selección limpiada.');
  });

  // Botón Calcular Ruta
  refs.btnRunAlgorithm.addEventListener('click', runSelectedAlgorithm);
}

export function renderControls() {
  const options = ['<option value="">Selecciona nodo</option>']
    .concat(state.graph.nodes.map((node) => `<option value="${node.id}">${node.name}</option>`))
    .join('');
  
  refs.originSelect.innerHTML = options;
  refs.destinationSelect.innerHTML = options;
  refs.originSelect.value = state.originId || '';
  refs.destinationSelect.value = state.destinationId || '';

  const requiresRoute = state.algorithm === 'dijkstra';
  refs.destinationSelect.disabled = !requiresRoute; 
  refs.btnRunAlgorithm.disabled = requiresRoute ? !(state.originId && state.destinationId) : false;
}

export function showToast(message) {
  if (!refs.toast) return;
  clearTimeout(toastTimeout);
  refs.toast.textContent = message;
  refs.toast.classList.add('show');
  toastTimeout = setTimeout(() => refs.toast.classList.remove('show'), 2600);
}

export async function runSelectedAlgorithm() {
  try {
    refs.btnRunAlgorithm.disabled = true;
    refs.btnRunAlgorithm.textContent = 'Calculando...';
    
    const payload = {
      algorithm: state.algorithm,
      originId: state.originId,
      destinationId: state.destinationId,
      weightKey: state.weightKey 
    };
    
    const data = await api.runAlgorithm(payload);
    if (data.graph) state.graph = data.graph;
    state.result = data.result;
    
    renderGraph();
    drawResult();
    
    showToast(state.result.message + (state.result.totalCost ? ` Costo: ${state.result.totalCost.toFixed(2)}` : ''));
  } catch (error) {
    showToast(error.message);
  } finally {
    refs.btnRunAlgorithm.textContent = '▶ Calcular Ruta';
    renderControls();
  }
}

export function renderResultSummary() { /* Función purgada, ya no se usa UI lateral */ }
export async function loadHistory() { return Promise.resolve(); /* Función purgada, ya no se usa historial */ }