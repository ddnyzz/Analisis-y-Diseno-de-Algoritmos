import java.util.*;

public class grafos {

    static class Edge {
        int u, v, w;

        Edge(int u, int v, int w) {
            this.u = u;
            this.v = v;
            this.w = w;
        }
    }

    static List<Edge> generarGrafoDenso(int n, int maxPeso, long seed) {
        Random rand = new Random(seed);
        List<Edge> edges = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                edges.add(new Edge(i, j, rand.nextInt(maxPeso) + 1));
            }
        }
        return edges;
    }

    static class PrimNode {
        int node, weight;

        PrimNode(int node, int weight) {
            this.node = node;
            this.weight = weight;
        }
    }

    static int prim(int n, List<List<PrimNode>> graph) {
        boolean[] visited = new boolean[n];
        PriorityQueue<PrimNode> pq =
                new PriorityQueue<>(Comparator.comparingInt(a -> a.weight));

        pq.add(new PrimNode(0, 0));
        int total = 0;

        while (!pq.isEmpty()) {
            PrimNode curr = pq.poll();

            if (visited[curr.node]) continue;

            visited[curr.node] = true;
            total += curr.weight;

            for (PrimNode nei : graph.get(curr.node)) {
                if (!visited[nei.node]) {
                    pq.add(nei);
                }
            }
        }

        return total;
    }

    static class DSU {
        int[] parent, rank;

        DSU(int n) {
            parent = new int[n];
            rank = new int[n];
            for (int i = 0; i < n; i++) parent[i] = i;
        }

        int find(int x) {
            if (parent[x] != x)
                parent[x] = find(parent[x]);
            return parent[x];
        }

        boolean union(int a, int b) {
            int ra = find(a), rb = find(b);

            if (ra == rb) return false;

            if (rank[ra] < rank[rb]) parent[ra] = rb;
            else if (rank[ra] > rank[rb]) parent[rb] = ra;
            else {
                parent[rb] = ra;
                rank[ra]++;
            }

            return true;
        }
    }

    static int kruskal(int n, List<Edge> edges) {
        edges.sort(Comparator.comparingInt(e -> e.w)); // se mide completo
        DSU dsu = new DSU(n);

        int total = 0;

        for (Edge e : edges) {
            if (dsu.union(e.u, e.v)) {
                total += e.w;
            }
        }

        return total;
    }

    static List<List<PrimNode>> buildGraph(int n, List<Edge> edges) {
        List<List<PrimNode>> g = new ArrayList<>();

        for (int i = 0; i < n; i++)
            g.add(new ArrayList<>());

        for (Edge e : edges) {
            g.get(e.u).add(new PrimNode(e.v, e.w));
            g.get(e.v).add(new PrimNode(e.u, e.w));
        }

        return g;
    }
    static void warmUp(int n, List<List<PrimNode>> graph, List<Edge> edges) {
        for (int i = 0; i < 5; i++) {
            prim(n, graph);
            kruskal(n, new ArrayList<>(edges));
        }
    }

    static double medirPrim(int n, List<List<PrimNode>> graph, int reps) {
        long total = 0;

        for (int i = 0; i < reps; i++) {
            long start = System.nanoTime();
            prim(n, graph);
            long end = System.nanoTime();
            total += (end - start);
        }

        return total / (double) reps / 1_000_000.0;
    }

    static double medirKruskal(int n, List<Edge> edges, int reps) {
        long total = 0;

        for (int i = 0; i < reps; i++) {
            List<Edge> copy = new ArrayList<>(edges);

            long start = System.nanoTime();
            kruskal(n, copy);
            long end = System.nanoTime();

            total += (end - start);
        }

        return total / (double) reps / 1_000_000.0;
    }
    public static void main(String[] args) {

        int n = 600;       // más grande → resultados más claros
        int maxPeso = 10;
        int reps = 5;

        List<Edge> edges = generarGrafoDenso(n, maxPeso, 42);
        List<List<PrimNode>> graph = buildGraph(n, edges);

        // validar que ambos dan el mismo resultado
        int primRes = prim(n, graph);
        int kruskalRes = kruskal(n, new ArrayList<>(edges));

        System.out.println("Peso Prim: " + primRes);
        System.out.println("Peso Kruskal: " + kruskalRes);

        warmUp(n, graph, edges);

        double primTime = medirPrim(n, graph, reps);
        double kruskalTime = medirKruskal(n, edges, reps);

        System.out.println("\n=== GRAFO DENSO ===");
        System.out.println("Prim:    " + primTime + " ms");
        System.out.println("Kruskal: " + kruskalTime + " ms");

        if (primTime < kruskalTime) {
            System.out.println("Ganador: Prim");
        } else {
            System.out.println("Ganador: Kruskal");
        }
    }
}