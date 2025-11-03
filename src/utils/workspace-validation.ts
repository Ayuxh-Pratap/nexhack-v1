/**
 * Workspace Configuration Validation Utility
 * Validates and converts React Flow workspace configurations to backend-compatible formats
 */

import { z } from "zod";

// React Flow Node and Edge schemas
export const ReactFlowNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
    data: z.object({
        label: z.string(),
        specialty: z.string(),
        description: z.string(),
        priority: z.number().min(1).max(10),
        color: z.string().optional(),
    }),
});

export const ReactFlowEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
    animated: z.boolean().optional(),
    style: z.record(z.any()).optional(),
    label: z.string().optional(),
});

export const WorkspaceConfigurationSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    nodes: z.array(ReactFlowNodeSchema).min(1),
    edges: z.array(ReactFlowEdgeSchema).default([]),
    tags: z.array(z.string()).optional(),
});

export interface WorkspaceValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    convertedNodes: ConvertedNode[];
    nodeMapping: Record<string, string>; // React Flow ID -> Database Node ID mapping
}

export interface ConvertedNode {
    reactFlowId: string;
    nodeName: string;
    specialty: string;
    priority: number;
    position: { x: number; y: number };
    isValid: boolean;
    validationErrors: string[];
}

/**
 * Validates a workspace configuration and converts it for backend use
 */
export function validateWorkspaceConfiguration(
    nodes: any[],
    edges: any[],
    availableDbNodes: Array<{ id: string; name: string; specialty: string; isActive: boolean }>
): WorkspaceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const convertedNodes: ConvertedNode[] = [];
    const nodeMapping: Record<string, string> = {};

    // Validate nodes structure
    try {
        const validatedNodes = z.array(ReactFlowNodeSchema).parse(nodes);
        
        // Convert and validate each node
        for (const node of validatedNodes) {
            const nodeValidationErrors: string[] = [];
            let isValid = true;

            // Check if node exists in database
            const dbNode = availableDbNodes.find(n => n.name === node.data.label);
            
            if (!dbNode) {
                nodeValidationErrors.push(`Node "${node.data.label}" not found in available nodes`);
                isValid = false;
            } else if (!dbNode.isActive) {
                nodeValidationErrors.push(`Node "${node.data.label}" is inactive`);
                isValid = false;
            } else {
                // Create mapping for valid nodes
                nodeMapping[node.id] = dbNode.id;
            }

            // Validate priority
            if (node.data.priority < 1 || node.data.priority > 10) {
                nodeValidationErrors.push(`Invalid priority ${node.data.priority} for node "${node.data.label}"`);
                isValid = false;
            }

            // Validate position
            if (node.position.x < 0 || node.position.y < 0) {
                nodeValidationErrors.push(`Invalid position for node "${node.data.label}"`);
                isValid = false;
            }

            convertedNodes.push({
                reactFlowId: node.id,
                nodeName: node.data.label,
                specialty: node.data.specialty,
                priority: node.data.priority,
                position: node.position,
                isValid,
                validationErrors: nodeValidationErrors,
            });

            if (!isValid) {
                errors.push(...nodeValidationErrors);
            }
        }
    } catch (validationError) {
        if (validationError instanceof z.ZodError) {
            errors.push(...validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`));
        } else {
            errors.push('Invalid node structure');
        }
    }

    // Validate edges
    try {
        const validatedEdges = z.array(ReactFlowEdgeSchema).parse(edges);
        
        for (const edge of validatedEdges) {
            // Check if source and target nodes exist
            const sourceNode = convertedNodes.find(n => n.reactFlowId === edge.source);
            const targetNode = convertedNodes.find(n => n.reactFlowId === edge.target);
            
            if (!sourceNode) {
                errors.push(`Edge references non-existent source node: ${edge.source}`);
            }
            
            if (!targetNode) {
                errors.push(`Edge references non-existent target node: ${edge.target}`);
            }
            
            // Check for self-connections
            if (edge.source === edge.target) {
                warnings.push(`Self-connection detected for node: ${edge.source}`);
            }
            
            // Check for duplicate edges
            const duplicateEdge = validatedEdges.find(e => 
                e.id !== edge.id && 
                e.source === edge.source && 
                e.target === edge.target
            );
            
            if (duplicateEdge) {
                warnings.push(`Duplicate connection between ${edge.source} and ${edge.target}`);
            }
        }
    } catch (validationError) {
        if (validationError instanceof z.ZodError) {
            errors.push(...validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`));
        } else {
            errors.push('Invalid edge structure');
        }
    }

    // Additional business logic validations
    if (convertedNodes.length === 0) {
        errors.push('At least one valid node is required');
    }

    if (convertedNodes.length > 10) {
        warnings.push('Using more than 10 nodes may result in complex prompts and performance issues');
    }

    // Check for duplicate priorities
    const priorities = convertedNodes.map(n => n.priority);
    const duplicatePriorities = priorities.filter((priority, index) => 
        priorities.indexOf(priority) !== index
    );
    
    if (duplicatePriorities.length > 0) {
        warnings.push(`Duplicate priorities detected: ${duplicatePriorities.join(', ')}`);
    }

    // Check for specialty conflicts
    const specialtyCounts = convertedNodes.reduce((acc, node) => {
        acc[node.specialty] = (acc[node.specialty] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    Object.entries(specialtyCounts).forEach(([specialty, count]) => {
        if (count > 1) {
            warnings.push(`Multiple nodes with ${specialty} specialty detected`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        convertedNodes,
        nodeMapping,
    };
}

/**
 * Converts a validated workspace configuration to chat node format
 */
export function convertToChatNodes(
    convertedNodes: ConvertedNode[],
    nodeMapping: Record<string, string>,
    chatId: string,
    userId: string
): Array<{
    nodeId: string;
    priority: number;
    position: { x: number; y: number };
}> {
    return convertedNodes
        .filter(node => node.isValid && nodeMapping[node.reactFlowId])
        .map(node => ({
            nodeId: nodeMapping[node.reactFlowId],
            priority: node.priority,
            position: node.position,
        }));
}

/**
 * Validates that a workspace configuration can be activated for a chat
 */
export function validateWorkspaceActivation(
    workspaceConfig: any,
    availableDbNodes: Array<{ id: string; name: string; specialty: string; isActive: boolean }>,
    existingChatNodes: Array<{ nodeId: string; isActive: boolean }>
): {
    canActivate: boolean;
    errors: string[];
    warnings: string[];
    conflicts: Array<{ nodeId: string; conflict: string }>;
} {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: Array<{ nodeId: string; conflict: string }> = [];

    // Validate the workspace configuration
    const validation = validateWorkspaceConfiguration(
        workspaceConfig.nodes,
        workspaceConfig.edges,
        availableDbNodes
    );

    if (!validation.isValid) {
        errors.push(...validation.errors);
    }

    warnings.push(...validation.warnings);

    // Check for conflicts with existing chat nodes
    const validNodes = validation.convertedNodes.filter(n => n.isValid);
    
    for (const node of validNodes) {
        const dbNode = availableDbNodes.find(n => n.name === node.nodeName);
        if (dbNode) {
            const existingChatNode = existingChatNodes.find(cn => cn.nodeId === dbNode.id);
            
            if (existingChatNode && existingChatNode.isActive) {
                conflicts.push({
                    nodeId: dbNode.id,
                    conflict: `Node "${node.nodeName}" is already active in this chat`
                });
            }
        }
    }

    return {
        canActivate: errors.length === 0,
        errors,
        warnings,
        conflicts,
    };
}

/**
 * Generates a summary of workspace configuration characteristics
 */
export function getWorkspaceSummary(
    nodes: any[],
    edges: any[]
): {
    nodeCount: number;
    edgeCount: number;
    specialtyCount: number;
    specialties: string[];
    complexityLevel: 'simple' | 'moderate' | 'complex' | 'very_complex';
    estimatedTokens: number;
} {
    const specialties = [...new Set(nodes.map(n => n.data?.specialty).filter(Boolean))];
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const specialtyCount = specialties.length;

    let complexityLevel: 'simple' | 'moderate' | 'complex' | 'very_complex';
    if (nodeCount <= 2 && edgeCount <= 1) {
        complexityLevel = 'simple';
    } else if (nodeCount <= 4 && edgeCount <= 3) {
        complexityLevel = 'moderate';
    } else if (nodeCount <= 6 && edgeCount <= 5) {
        complexityLevel = 'complex';
    } else {
        complexityLevel = 'very_complex';
    }

    // Rough token estimate based on node count and complexity
    const baseTokens = nodeCount * 200; // ~200 tokens per node
    const edgeTokens = edgeCount * 50; // ~50 tokens per edge
    const complexityMultiplier = complexityLevel === 'simple' ? 1 : 
                                 complexityLevel === 'moderate' ? 1.2 :
                                 complexityLevel === 'complex' ? 1.5 : 2;
    
    const estimatedTokens = Math.ceil((baseTokens + edgeTokens) * complexityMultiplier);

    return {
        nodeCount,
        edgeCount,
        specialtyCount,
        specialties,
        complexityLevel,
        estimatedTokens,
    };
}
