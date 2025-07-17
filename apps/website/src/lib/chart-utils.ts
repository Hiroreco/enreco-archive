import { ChartData, FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";

export function resolveDataForDay(charts: ChartData[], currentDay: number)
: { nodes: ImageNodeType[], edges: FixedEdgeType[] } {
    const result: { nodes: ImageNodeType[], edges: FixedEdgeType[] } = {
        nodes: [],
        edges: []
    };

    // Process each day up to the current day
    for (let day = 0; day <= currentDay; day++) {
        const chart = charts[day];

        // For nodes, merge by id - newer versions replace older ones
        chart.nodes.forEach((node: ImageNodeType) => {
            const existingIndex = result.nodes.findIndex(
                (n) => n.id === node.id,
            );

            if (existingIndex !== -1) {
                // Update existing node
                result.nodes[existingIndex] = node;
            } else {
                // Add new node
                result.nodes.push(node);
            }
        });

        // For edges, merge by id - newer versions replace older ones
        chart.edges.forEach((edge: FixedEdgeType) => {
            const existingIndex = result.edges.findIndex(
                (e) => e.id === edge.id,
            );
            if (existingIndex !== -1) {
                // Update existing edge
                if (edge.data) {
                    edge.data.isNewlyAdded = false;
                }
                result.edges[existingIndex] = edge;
            } else {
                // Add new edge
                if (edge.data) {
                    edge.data.isNewlyAdded = true;
                }
                result.edges.push(edge);
            }
        });
    }

    result.nodes = result.nodes.map(n => {
        const resNode = structuredClone(n);

        resNode.hidden = false;
        resNode.selected = false;
        resNode.className = resNode.data.day === currentDay ? "" : "old-node";
        resNode.data.isRead = false;

        return resNode;
    });
    result.edges = result.edges.map(e => { 
        const resEdge = structuredClone(e);

        resEdge.hidden = false;
        resEdge.selectable = currentDay === e.data?.day;
        resEdge.zIndex = e.data?.day ?? 0;
        
        if(resEdge.data) {
            resEdge.data.isRead = false;
            resEdge.data.isNewlyAdded = currentDay === e.data?.day;
        }
        
        return resEdge;
    });

    return result;
}