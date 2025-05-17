export function generateEdgeId(
    source: string,
    target: string,
    sourceHandle: string | null | undefined = "",
    targetHandle: string | null | undefined = "",
) {
    return `${source}-${target}-${sourceHandle}-${targetHandle}`;
}
