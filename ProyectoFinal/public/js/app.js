import { api } from './api.js';
import { state } from './state.js';
import { initializeMap, renderGraph, fitToGraph } from './map.js';
import { bindDom, renderControls, renderResultSummary, loadHistory, showToast } from './ui.js';

async function bootstrap() {
  try {
    initializeMap();
    bindDom();
    const graph = await api.getGraph();
    state.graph = graph;
    renderControls();
    renderGraph();
    renderResultSummary();
    fitToGraph();
    await loadHistory();
    showToast('GeoRutas listo: grafo centrado en Zacatecas.');
  } catch (error) {
    showToast(error.message);
  }
}

bootstrap();
