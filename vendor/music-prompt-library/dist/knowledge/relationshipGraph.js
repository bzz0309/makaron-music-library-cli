import { loadProfileRelationships } from "./store.js";
const OVER_CONNECTED_THRESHOLD = 8;
function quote(value) {
    return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
function mermaidId(value) {
    return `p_${value.replace(/[^A-Za-z0-9_]/g, "_")}`;
}
function buildEdges(registry) {
    const edges = [];
    const seenSimilar = new Set();
    for (const relationship of registry.relationships) {
        if (relationship.parent_profile_id) {
            edges.push({ source: relationship.parent_profile_id, target: relationship.profile_id, type: "parent" });
        }
        for (const similar of relationship.similar_profiles) {
            const pair = [relationship.profile_id, similar.profile_id].sort().join("\u0000");
            if (seenSimilar.has(pair))
                continue;
            seenSimilar.add(pair);
            edges.push({ source: relationship.profile_id, target: similar.profile_id, type: "similar", weight: similar.weight });
        }
        for (const fallback of relationship.fallback_profiles) {
            edges.push({ source: relationship.profile_id, target: fallback.profile_id, type: "fallback" });
        }
    }
    return edges.sort((left, right) => left.type.localeCompare(right.type) || left.source.localeCompare(right.source) || left.target.localeCompare(right.target));
}
function graphHealth(registry, edges) {
    const connections = new Map(registry.relationships.map((item) => [item.profile_id, new Set()]));
    for (const edge of edges) {
        connections.get(edge.source)?.add(edge.target);
        connections.get(edge.target)?.add(edge.source);
    }
    const isolated_profiles = [...connections].filter(([, adjacent]) => adjacent.size === 0).map(([id]) => id).sort();
    const over_connected_profiles = [...connections]
        .filter(([, adjacent]) => adjacent.size > OVER_CONNECTED_THRESHOLD)
        .map(([profile_id, adjacent]) => ({ profile_id, connections: adjacent.size }))
        .sort((left, right) => right.connections - left.connections || left.profile_id.localeCompare(right.profile_id));
    const byId = new Map(registry.relationships.map((item) => [item.profile_id, item]));
    const missing_reciprocal_links = registry.relationships.flatMap((relationship) => relationship.similar_profiles
        .filter((similar) => !byId.get(similar.profile_id)?.similar_profiles.some((reverse) => reverse.profile_id === relationship.profile_id))
        .map((similar) => ({ source: relationship.profile_id, target: similar.profile_id }))).sort((left, right) => left.source.localeCompare(right.source) || left.target.localeCompare(right.target));
    return {
        status: isolated_profiles.length || over_connected_profiles.length || missing_reciprocal_links.length ? "warnings" : "healthy",
        isolated_profiles,
        over_connected_profiles,
        missing_reciprocal_links
    };
}
function toDot(registry, edges) {
    const lines = ["digraph music_profiles {", "  rankdir=LR;", "  node [shape=box];"];
    for (const relationship of registry.relationships) {
        lines.push(`  "${quote(relationship.profile_id)}" [label="${quote(relationship.profile_id)}\\n${quote(relationship.family_id)}"];`);
    }
    for (const edge of edges) {
        const attributes = edge.type === "similar"
            ? `dir=both, style=dashed, label="similar ${edge.weight ?? ""}"`
            : edge.type === "fallback" ? 'style=dotted, label="fallback"' : 'label="parent"';
        lines.push(`  "${quote(edge.source)}" -> "${quote(edge.target)}" [${attributes}];`);
    }
    lines.push("}");
    return lines.join("\n");
}
function toMermaid(registry, edges) {
    const lines = ["flowchart LR"];
    for (const relationship of registry.relationships) {
        lines.push(`  ${mermaidId(relationship.profile_id)}["${quote(relationship.profile_id)}<br/>${quote(relationship.family_id)}"]`);
    }
    for (const edge of edges) {
        const arrow = edge.type === "similar" ? "<-.->" : edge.type === "fallback" ? "-.->" : "-->";
        lines.push(`  ${mermaidId(edge.source)} ${arrow}|${edge.type}| ${mermaidId(edge.target)}`);
    }
    return lines.join("\n");
}
export function deriveRelationshipGraph(registry) {
    const nodes = registry.relationships.map((item) => ({ profile_id: item.profile_id, family_id: item.family_id }))
        .sort((left, right) => left.profile_id.localeCompare(right.profile_id));
    const edges = buildEdges(registry);
    return {
        schema_version: "1.0",
        generated_at: new Date().toISOString(),
        summary: {
            profiles: nodes.length,
            families: new Set(nodes.map((node) => node.family_id)).size,
            edges: edges.length,
            parent_edges: edges.filter((edge) => edge.type === "parent").length,
            similar_edges: edges.filter((edge) => edge.type === "similar").length,
            fallback_edges: edges.filter((edge) => edge.type === "fallback").length
        },
        nodes,
        edges,
        health: graphHealth(registry, edges),
        dot: toDot(registry, edges),
        mmd: toMermaid(registry, edges)
    };
}
export async function generateRelationshipGraphReport() {
    return deriveRelationshipGraph(await loadProfileRelationships());
}
