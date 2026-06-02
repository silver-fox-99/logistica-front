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
import { FiGlobe, FiMap, FiNavigation, FiCompass, FiHelpCircle } from "react-icons/fi";
import type { GeoLocation, LocationType } from "@/shared/api/adminGeoApi";
import { useLocalizedGeo } from "@/shared/utils/lookupUtils";

export const GEO_TYPE_RU: Record<LocationType, string> = {
    COUNTRY: "Страна",
    REGION: "Регион",
    CITY: "Город",
    DISTRICT: "Район",
    OTHER: "Другое",
};

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

const WIDTH = 220;
const HEIGHT = 58;

export function nodeColor(t: LocationType) {
    switch (t) {
        case "COUNTRY":
            return "#6366f1"; // Indigo
        case "REGION":
            return "#a855f7"; // Purple
        case "CITY":
            return "#14b8a6"; // Teal
        case "DISTRICT":
            return "#f97316"; // Orange
        default:
            return "#64748b"; // Slate
    }
}

export function LocationIcon({ type, size = 16, color }: { type: LocationType; size?: number; color?: string }) {
    switch (type) {
        case "COUNTRY":
            return <FiGlobe size={size} color={color} />;
        case "REGION":
            return <FiMap size={size} color={color} />;
        case "CITY":
            return <FiNavigation size={size} color={color} style={{ transform: "rotate(45deg)" }} />;
        case "DISTRICT":
            return <FiCompass size={size} color={color} />;
        default:
            return <FiHelpCircle size={size} color={color} />;
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
            spacing={1.25}
            sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                position: "relative",
                borderRadius: 2,
                border: `2px solid ${selected ? color : `${color}40`}`,
                bgcolor: selected ? `${color}08` : "#fff",
                boxShadow: selected
                    ? `0 0 0 3px ${color}25, 0 4px 12px ${color}10`
                    : "0 2px 4px rgba(0,0,0,.03)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                px: 1.5,
                "&:hover": {
                    borderColor: color,
                    boxShadow: `0 4px 12px ${color}15`,
                }
            }}
        >
            {/* невидимые, но рабочие Handle'ы */}
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

            <LocationIcon type={data.type} color={color} size={18} />
            <Typography
                noWrap
                title={data.label}
                sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}
            >
                {data.label}
            </Typography>
            <Chip
                size="small"
                label={GEO_TYPE_RU[data.type] || data.type}
                sx={{
                    ml: "auto",
                    fontSize: 10,
                    fontWeight: 700,
                    height: 20,
                    bgcolor: `${color}12`,
                    color: color,
                    border: `1px solid ${color}30`,
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
