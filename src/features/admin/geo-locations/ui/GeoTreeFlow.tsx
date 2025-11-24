import { useCallback, useMemo } from "react";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    Position,
    Handle,
    MarkerType,
    type Edge,
    type Node,
    type NodeTypes,
    type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { FiMapPin } from "react-icons/fi";
import type { GeoLocation, LocationType } from "@/shared/api/adminGeoApi";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";

type Props = {
    items: GeoLocation[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onAddCity: (parentId: string) => void;
    onEditCity: (cityId: string) => void;
};

type NodeData = {
    label: string;
    type: LocationType;
};

// наш кастомный тип ноды для ReactFlow
type GeoNode = Node<NodeData, "geo">;

const WIDTH = 200;
const HEIGHT = 56;

function nodeColor(t: LocationType) {
    switch (t) {
        case "COUNTRY":
            return "#1976d2";
        case "REGION":
            return "#9c27b0";
        case "CITY":
            return "#2e7d32";
        case "DISTRICT":
            return "#ff6f00";
        default:
            return "#607d8b";
    }
}

const DagreLayout = (nodes: GeoNode[], edges: Edge[]): GeoNode[] => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: "TB",
        nodesep: 40,
        ranksep: 80,
        marginx: 40,
        marginy: 40,
    });

    nodes.forEach((n) => g.setNode(n.id, { width: WIDTH, height: HEIGHT }));
    edges.forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);

    return nodes.map((n) => {
        const pos = g.node(n.id);
        return {
            ...n,
            position: { x: pos.x - WIDTH / 2, y: pos.y - HEIGHT / 2 },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
        };
    });
};

function makeNodesEdges(
    items: GeoLocation[],
    getLocalizedGeoName: (geo: {
        name: string;
        name_ru?: string | null;
        name_uz?: string | null;
    }) => string
): { baseNodes: GeoNode[]; edges: Edge[] } {
    const baseNodes: GeoNode[] = items.map((it) => ({
        id: it.id,
        type: "geo", // важный момент: совпадает с ключом в nodeTypes
        data: {
            label: getLocalizedGeoName(it),
            type: it.type,
        },
        position: { x: 0, y: 0 },
        style: {
            width: WIDTH,
            height: HEIGHT,
            borderRadius: 10,
            border: `1px solid ${nodeColor(it.type)}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "8px 10px",
            boxShadow: "0 1px 2px rgba(0,0,0,.04)",
            cursor: "pointer",
        },
    }));

    const edges: Edge[] = items
        .filter((it) => !!it.parent_id)
        .map((it) => ({
            id: `e-${it.parent_id}-${it.id}`,
            source: it.parent_id as string,
            target: it.id,
            type: "smoothstep",
            animated: false,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 16,
            },
            style: { stroke: "#b6b8be", strokeWidth: 1.5 },
        }));

    return { baseNodes, edges };
}

// кастомный нод
const DefaultNode = ({ data, selected }: NodeProps<GeoNode>) => {
    const color = nodeColor(data.type);

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                position: "relative",
                borderRadius: 1.25,
                border: `1px solid ${color}`,
                bgcolor: selected ? "#f0f7ff" : "#fff",
                boxShadow: selected
                    ? "0 0 0 2px rgba(25,118,210,.35)"
                    : "0 1px 2px rgba(0,0,0,.04)",
                cursor: "pointer",
                px: 1.25,
            }}
        >
            {/* невидимые, но рабочие Handle'ы */}
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

            <FiMapPin size={16} />
            <Typography
                noWrap
                title={data.label}
                sx={{ fontSize: 13, fontWeight: 600 }}
            >
                {data.label}
            </Typography>
            <Chip
                size="small"
                label={data.type}
                sx={{
                    ml: "auto",
                    fontSize: 10,
                    height: 20,
                    bgcolor: `${color}20`,
                    border: `1px solid ${color}`,
                }}
            />
        </Stack>
    );
};

// типы нод должны знать про GeoNode
const nodeTypes: NodeTypes = { geo: DefaultNode };

export function GeoTreeFlow({
                                items,
                                selectedId,
                                onSelect,
                                onAddCity,
                                onEditCity,
                            }: Props) {
    const { getLocalizedGeoName } = useLocalizedGeo();

    // 1) считаем layout только по items
    const { baseNodes, edges } = useMemo(
        () => makeNodesEdges(items, getLocalizedGeoName),
        [items, getLocalizedGeoName]
    );

    const laidOutNodes = useMemo(
        () => DagreLayout(baseNodes, edges),
        [baseNodes, edges]
    );

    // 2) помечаем выбранный узел
    const nodes: GeoNode[] = useMemo(
        () =>
            laidOutNodes.map((n) => ({
                ...n,
                selected: selectedId != null && n.id === selectedId,
            })),
        [laidOutNodes, selectedId]
    );

    const onNodeClick = useCallback(
        (e: any, node: GeoNode) => {
            onSelect(node.id);
            const t = items.find((i) => i.id === node.id)?.type;
            if (t === "CITY" && (e.metaKey || e.ctrlKey)) {
                onEditCity(node.id);
            }
        },
        [onSelect, onEditCity, items]
    );

    const onNodeDoubleClick = useCallback(
        (_e: any, node: GeoNode) => {
            const t = items.find((i) => i.id === node.id)?.type as
                | LocationType
                | undefined;
            if (t === "COUNTRY" || t === "REGION") onAddCity(node.id);
            if (t === "CITY") onEditCity(node.id);
        },
        [onAddCity, onEditCity, items]
    );

    return (
        <Box
            sx={{
                height: 420,
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            {/* важно: передать generic <GeoNode> в ReactFlow */}
            <ReactFlow<GeoNode>
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                panOnScroll
                zoomOnScroll
                panOnDrag
            >
                <Background />
                <MiniMap pannable />
                <Controls />
            </ReactFlow>
        </Box>
    );
}

export default GeoTreeFlow;
