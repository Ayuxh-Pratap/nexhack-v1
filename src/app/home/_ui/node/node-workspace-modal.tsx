"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  X,
  Play,
  Save,
  Zap,
  Database,
  Mail,
  Webhook,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  MousePointer,
  Hand,
    Stethoscope,
    Heart,
    Brain,
    Baby,
    Shield,
    Activity,
    Eye,
    Bone,
    Pill,
    User,
    Settings,
    Trash2,
    Edit3,
    Copy,
    Move,
    GripVertical,
    Plus,
    Minus,
    Grid3X3,
    Layers,
    Workflow,
} from "lucide-react"
import { cn } from "@/lib/utils"

// React Flow imports
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    NodeTypes,
    EdgeTypes,
    ReactFlowProvider,
    ReactFlowInstance,
    NodeMouseHandler,
    EdgeMouseHandler,
    ConnectionLineType,
    Panel,
    useReactFlow,
    BackgroundVariant,
    NodeChange,
    EdgeChange,
    applyNodeChanges,
    applyEdgeChanges,
    getConnectedEdges,
    getIncomers,
    getOutgoers,
    Handle,
    Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface NodeWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
    chatId?: string // Optional chat ID for context
}

// Custom Node Types for React Flow
interface HealthcareNodeData {
    label: string
    specialty: string
    description: string
    icon: React.ReactNode
    priority: number
    color: string
}

// Custom Healthcare Node Component - Premium n8n Style
const HealthcareNodeComponent = ({ data, selected }: { data: HealthcareNodeData, selected?: boolean }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editPriority, setEditPriority] = useState(data.priority)
    const [isHovered, setIsHovered] = useState(false)

    const handlePriorityChange = (newPriority: number) => {
        setEditPriority(newPriority)
        data.priority = newPriority
    }

    return (
        <div
            className={cn(
                "relative group min-w-[280px] transition-all duration-300 ease-out"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Node Shadow */}
            <div className={cn(
                "absolute inset-0 rounded-xl transition-all duration-300",
                selected
                    ? "shadow-2xl shadow-gray-400/20 dark:shadow-gray-600/20"
                    : isHovered
                        ? "shadow-xl shadow-gray-300/15 dark:shadow-gray-700/15"
                        : "shadow-lg shadow-gray-200/10 dark:shadow-gray-800/10"
            )} />

            {/* Main Node Container */}
            <div className={cn(
                "relative px-5 py-4 rounded-xl border backdrop-blur-sm",
                "bg-background/80 dark:bg-background/90",
                selected
                    ? "border-border ring-2 ring-border/30"
                    : "border-border/50",
                "hover:border-border",
                "transition-all duration-300 ease-out"
            )}>
                {/* Node Actions */}
                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <div className="flex gap-1.5">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="size-7 text-xs bg-white/90 dark:bg-gray-700/90 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <Edit3 className="size-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="destructive"
                            className="size-7 text-xs bg-red-500/90 hover:bg-red-600 backdrop-blur-sm border border-red-400/50 hover:border-red-500 transition-all duration-200"
                            onClick={() => {
                                console.log('Delete node:', data.label)
                            }}
                        >
                            <X className="size-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Node Content */}
                <div className="flex items-center gap-4">
                    {/* Icon Container */}
                    <div className={cn(
                        "size-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300",
                        "bg-gradient-to-br from-emerald-500 to-green-600",
                        "hover:from-emerald-400 hover:to-green-500",
                        "ring-1 ring-emerald-100/50 dark:ring-emerald-900/50"
                    )}>
                        <div className="text-white drop-shadow-sm">
                            {data.icon}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base text-foreground mb-1">
                            {data.label}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                            {data.specialty}
                        </div>
                        <div className="text-xs text-muted-foreground/80">
                            {data.description}
                        </div>
                    </div>

                    {/* Priority Badge */}
                    {isEditing ? (
                        <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1.5">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="size-6 p-0 hover:bg-muted"
                                onClick={() => handlePriorityChange(Math.max(1, editPriority - 1))}
                            >
                                <Minus className="size-3" />
                            </Button>
                            <input
                                type="number"
                                value={editPriority}
                                onChange={(e) => handlePriorityChange(parseInt(e.target.value) || 1)}
                                className="w-10 h-6 text-xs text-center border border-border rounded bg-background focus:ring-2 focus:ring-border/50"
                                min="1"
                                max="10"
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                className="size-6 p-0 hover:bg-muted"
                                onClick={() => handlePriorityChange(Math.min(10, editPriority + 1))}
                            >
                                <Plus className="size-3" />
                            </Button>
                        </div>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-muted hover:scale-105 transition-all duration-200 px-3 py-1.5 font-medium"
                            onClick={() => setIsEditing(true)}
                        >
                            Priority {data.priority}
                        </Badge>
                    )}
                </div>

        {/* React Flow Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="w-4 h-4 bg-blue-500 border-2 border-white dark:border-gray-800 hover:bg-blue-600 hover:scale-110 transition-all duration-200 shadow-lg"
          style={{ left: -8 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 hover:bg-emerald-600 hover:scale-110 transition-all duration-200 shadow-lg"
          style={{ right: -8 }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="w-4 h-4 bg-purple-500 border-2 border-white dark:border-gray-800 hover:bg-purple-600 hover:scale-110 transition-all duration-200 shadow-lg"
          style={{ top: -8 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="w-4 h-4 bg-orange-500 border-2 border-white dark:border-gray-800 hover:bg-orange-600 hover:scale-110 transition-all duration-200 shadow-lg"
          style={{ bottom: -8 }}
        />
            </div>
        </div>
    )
}

// Node Types Configuration
const nodeTypes: NodeTypes = {
    healthcareNode: HealthcareNodeComponent,
}

// Icon mapping for specialties
const specialtyIconMap: Record<string, React.ComponentType<any>> = {
    general_medicine: Stethoscope,
    pediatrics: Baby,
    cardiology: Heart,
    neurology: Brain,
    infectious_disease: Shield,
    emergency_medicine: Activity,
    dermatology: Eye,
    orthopedics: Bone,
    psychiatry: Pill,
    gastroenterology: Database,
    endocrinology: Activity,
    oncology: Shield,
    pulmonology: Activity,
    nephrology: Activity,
    rheumatology: Activity,
    ophthalmology: Eye,
    otolaryngology: Activity,
    anesthesiology: Activity,
    radiology: Activity,
    pathology: Activity,
    surgery: Activity,
    obstetrics_gynecology: Activity,
    urology: Activity,
    plastic_surgery: Activity,
    forensic_medicine: Activity,
    sports_medicine: Activity,
    geriatrics: Activity,
    occupational_medicine: Activity,
    public_health: Activity,
}

// Main React Flow Component
function NodeWorkspaceFlow({ healthcareSpecialists }: { healthcareSpecialists: any[] }) {
    const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([])
    const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([])
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
    const [isMinimapVisible, setIsMinimapVisible] = useState(false)
    const [selectedNodes, setSelectedNodes] = useState<string[]>([])
    const [selectedEdges, setSelectedEdges] = useState<string[]>([])
    const [savedConfigurations, setSavedConfigurations] = useState<Array<{ name: string, nodes: Node[], edges: Edge[] }>>([])

    // Convert healthcare specialists to React Flow nodes
    const convertToReactFlowNode = (specialist: any, index: number): Node => ({
        id: specialist.id,
        type: 'healthcareNode',
        position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
        data: {
            label: specialist.label,
            specialty: specialist.specialty,
            description: specialist.description,
            icon: <specialist.icon className="size-4 text-white" />,
            priority: 1,
            color: specialist.color
        }
    })

    // Add node to canvas
    const addNodeToCanvas = (specialist: any) => {
        const newNode = convertToReactFlowNode(specialist, reactFlowNodes.length)
        setReactFlowNodes((nds) => [...nds, newNode])
    }

    // Enhanced node change handler
    const onNodesChangeEnhanced = useCallback((changes: NodeChange[]) => {
        setReactFlowNodes((nds) => {
            const updatedNodes = applyNodeChanges(changes, nds)

            // Handle node deletion
            changes.forEach((change) => {
                if (change.type === 'remove') {
                    const nodeId = change.id
                    // Remove connected edges when node is deleted
                    setReactFlowEdges((eds) =>
                        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
                    )
                    // Remove from selected nodes
                    setSelectedNodes((prev) => prev.filter(id => id !== nodeId))
                }
            })

            return updatedNodes
        })
    }, [])

    // Enhanced edge change handler
    const onEdgesChangeEnhanced = useCallback((changes: EdgeChange[]) => {
        setReactFlowEdges((eds) => {
            const updatedEdges = applyEdgeChanges(changes, eds)

            // Handle edge deletion
            changes.forEach((change) => {
                if (change.type === 'remove') {
                    const edgeId = change.id
                    setSelectedEdges((prev) => prev.filter(id => id !== edgeId))
                }
            })

            return updatedEdges
        })
    }, [])

    // Handle connections with validation
    const onConnect = useCallback((params: Connection) => {
        // Prevent self-connections
        if (params.source === params.target) return

        // Check if connection already exists
        const existingConnection = reactFlowEdges.find(
            edge => edge.source === params.source && edge.target === params.target
        )
        if (existingConnection) return

    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#3b82f6', 
        strokeWidth: 3,
        filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
      },
      label: 'Collaborates',
      labelStyle: { fill: '#3b82f6', fontWeight: 600 },
      labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    }

        setReactFlowEdges((eds) => addEdge(newEdge, eds))
    }, [reactFlowEdges])

    // Handle node selection
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (event.ctrlKey || event.metaKey) {
            // Multi-select
            setSelectedNodes((prev) =>
                prev.includes(node.id)
                    ? prev.filter(id => id !== node.id)
                    : [...prev, node.id]
            )
        } else {
            // Single select
            setSelectedNodes([node.id])
        }
    }, [])

    // Handle edge selection
    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        if (event.ctrlKey || event.metaKey) {
            setSelectedEdges((prev) =>
                prev.includes(edge.id)
                    ? prev.filter(id => id !== edge.id)
                    : [...prev, edge.id]
            )
        } else {
            setSelectedEdges([edge.id])
        }
    }, [])

    // Delete selected nodes and edges
    const deleteSelected = useCallback(() => {
        setReactFlowNodes((nds) => nds.filter(node => !selectedNodes.includes(node.id)))
        setReactFlowEdges((eds) => eds.filter(edge => !selectedEdges.includes(edge.id)))
        setSelectedNodes([])
        setSelectedEdges([])
    }, [selectedNodes, selectedEdges])

    // Clear all nodes and edges
    const clearAll = useCallback(() => {
        setReactFlowNodes([])
        setReactFlowEdges([])
        setSelectedNodes([])
        setSelectedEdges([])
    }, [])

    // Save current configuration
    const saveConfiguration = useCallback((name: string) => {
        const newConfig = {
            name,
            nodes: reactFlowNodes,
            edges: reactFlowEdges,
        }
        setSavedConfigurations((prev) => [...prev, newConfig])
    }, [reactFlowNodes, reactFlowEdges])

    // Load configuration
    const loadConfiguration = useCallback((config: { name: string, nodes: Node[], edges: Edge[] }) => {
        setReactFlowNodes(config.nodes)
        setReactFlowEdges(config.edges)
        setSelectedNodes([])
        setSelectedEdges([])
    }, [])

    // Handle node drag from palette
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()

        const specialistId = event.dataTransfer.getData('application/reactflow')
        if (!specialistId) return

        const specialist = healthcareSpecialists.find((s: any) => s.id === specialistId)
        if (!specialist) return

        const position = reactFlowInstance?.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        }) || { x: 0, y: 0 }

        const newNode: Node = {
            id: `${specialist.id}-${Date.now()}`,
            type: 'healthcareNode',
            position,
            data: {
                label: specialist.label,
                specialty: specialist.specialty,
                description: specialist.description,
                icon: <specialist.icon className="size-4 text-white" />,
                priority: 1,
                color: specialist.color
            }
        }

        setReactFlowNodes((nds) => [...nds, newNode])
    }, [reactFlowInstance])

    return (
        <div className="flex-1 relative overflow-hidden bg-background">
            <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                onNodesChange={onNodesChangeEnhanced}
                onEdgesChange={onEdgesChangeEnhanced}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                className="bg-background"
                deleteKeyCode={['Backspace', 'Delete']}
                multiSelectionKeyCode={['Control', 'Meta']}
        connectionLineStyle={{
          stroke: '#3b82f6',
          strokeWidth: 3,
          strokeDasharray: '5,5',
        }}
            >
                <Controls className="bg-background/90 border border-border/50 rounded-xl shadow-lg backdrop-blur-sm" />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1.5} 
          className="opacity-60"
          color="#94a3b8"
        />
        {isMinimapVisible && (
          <MiniMap 
            className="bg-background/90 border border-border/50 rounded-xl shadow-lg backdrop-blur-sm"
            nodeColor="#3b82f6"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        )}

                {/* Top Control Panel */}
                <Panel position="top-left">
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsMinimapVisible(!isMinimapVisible)}
                            className="h-9 px-4 hover:bg-muted transition-all duration-200"
                        >
                            {isMinimapVisible ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                        </Button>
                        <div className="h-6 w-px bg-border/50" />
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={deleteSelected}
                            disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
                            className="h-9 px-4 hover:scale-105 transition-all duration-200"
                        >
                            <Trash2 className="size-4 mr-2" />
                            Delete Selected
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={clearAll}
                            disabled={reactFlowNodes.length === 0}
                            className="h-9 px-4 hover:scale-105 transition-all duration-200"
                        >
                            <X className="size-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </Panel>

                {/* Connection Help Panel */}
                {reactFlowNodes.length >= 2 && (
                    <Panel position="top-center">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                                <Workflow className="size-4" />
                            </div>
                            <span className="font-medium">💡 Drag from handles to connect nodes</span>
                        </div>
                    </Panel>
                )}
                {/* Bottom Info Panel */}
                <Panel position="bottom-center">
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="size-2 rounded-full bg-muted-foreground/60"></div>
                            <span className="font-medium">Nodes: {reactFlowNodes.length}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="size-2 rounded-full bg-muted-foreground/60"></div>
                            <span className="font-medium">Connections: {reactFlowEdges.length}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="size-2 rounded-full bg-muted-foreground/60"></div>
                            <span className="font-medium">Selected: {selectedNodes.length + selectedEdges.length}</span>
                        </div>
                    </div>
                </Panel>

                {/* Save/Load Panel */}
                <Panel position="top-right">
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const name = prompt('Enter configuration name:')
                                if (name) saveConfiguration(name)
                            }}
                            className="h-9 px-4 hover:scale-105 transition-all duration-200"
                        >
                            <Save className="size-4 mr-2" />
                            Save
                        </Button>
                        {savedConfigurations.length > 0 && (
                            <div className="relative">
                                <select
                                    onChange={(e) => {
                                        const config = savedConfigurations.find(c => c.name === e.target.value)
                                        if (config) loadConfiguration(config)
                                    }}
                                    className="h-9 px-3 text-sm border border-border/50 rounded-lg bg-background/90 backdrop-blur-sm hover:bg-muted/50 transition-all duration-200"
                                    defaultValue=""
                                >
                                    <option value="">Load Config</option>
                                    {savedConfigurations.map((config) => (
                                        <option key={config.name} value={config.name}>
                                            {config.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}

export function NodeWorkspaceModal({ isOpen, onClose, chatId }: NodeWorkspaceModalProps) {
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Fetch current user
    const { data: userData, error: userError } = useQuery(
        trpc.user.getProfile.queryOptions()
    )

    // Fetch available nodes from database
    const { data: nodesData, isLoading: isLoadingNodes, error: nodesError } = useQuery(
        trpc.node.getAvailableNodes.queryOptions({
            includeInactive: false,
            includeUserNodes: true,
            limit: 50,
            offset: 0
        })
    )

    // Fetch active chat nodes if chatId is provided
    const { data: activeChatNodes } = useQuery({
        ...trpc.chatNode.getActiveChatNodes.queryOptions({ 
            chatId: chatId || '', 
            includeInactive: false 
        }),
        enabled: !!chatId
    })

    // Convert database nodes to healthcare specialists format
    const healthcareSpecialists = nodesData?.nodes?.map(node => {
        const IconComponent = specialtyIconMap[node.specialty] || Stethoscope
        return {
            id: node.id,
            label: node.name,
            description: node.description,
            specialty: node.specialty,
            icon: IconComponent,
            color: "blue" // Default color, can be customized later
        }
    }) || []

    // Activate workspace for chat mutation
    const activateWorkspaceMutation = useMutation(
        trpc.nodeWorkspace.activateWorkspaceForChat.mutationOptions({
            onSuccess: (data) => {
                console.log("Workspace activated successfully:", data)
                toast.success("Medical team activated!", { 
                    description: `${data.summary.successful} specialists are now active for this chat` 
                })
                // Refresh active chat nodes
                if (chatId) {
                    queryClient.invalidateQueries({
                        queryKey: trpc.chatNode.getActiveChatNodes.queryOptions({ chatId }).queryKey
                    })
                }
                onClose() // Close the modal after activation
            },
            onError: (error) => {
                console.error("Failed to activate workspace:", error)
                toast.error("Failed to activate medical team", { 
                    description: error.message 
                })
            }
        })
    )

    // Save workspace configuration mutation
    const saveWorkspaceMutation = useMutation(
        trpc.nodeWorkspace.saveWorkspaceConfiguration.mutationOptions({
            onSuccess: (data) => {
                console.log("Workspace saved successfully:", data)
                toast.success("Workspace saved!", { 
                    description: `Configuration "${data.configuration.name}" saved successfully` 
                })
            },
            onError: (error) => {
                console.error("Failed to save workspace:", error)
                toast.error("Failed to save workspace", { 
                    description: error.message 
                })
            }
        })
    )

    const handleActivateTeam = () => {
        if (!chatId) {
            toast.error("No chat selected", { 
                description: "Please select a chat to activate the medical team" 
            })
            return
        }

        if (userError) {
            toast.error("Authentication required", { 
                description: "Please log in to activate medical teams" 
            })
            return
        }

        // For now, we'll create a simple configuration from the current React Flow state
        // In a full implementation, this would come from the React Flow canvas
        // Use the first available node from the database to ensure it exists
        const firstNode = healthcareSpecialists[0]
        if (!firstNode) {
            toast.error("No specialists available", {
                description: "Please ensure specialists are loaded before activating"
            })
            return
        }

        const mockNodes = [
            {
                id: "node-1",
                type: "healthcareNode",
                position: { x: 100, y: 100 },
                data: {
                    label: firstNode.label, // Use the actual label from the database
                    specialty: firstNode.specialty,
                    description: firstNode.description,
                    priority: 1,
                    color: "blue"
                }
            }
        ]

        const mockEdges: any[] = []

        console.log("Using node for activation:", firstNode)
        console.log("Mock nodes being created:", mockNodes)

        // Save the configuration first
        saveWorkspaceMutation.mutate({
            name: `Medical Team - ${new Date().toLocaleDateString()}`,
            description: "Activated medical specialist team",
            nodes: mockNodes,
            edges: mockEdges,
            isActive: true
        }, {
            onSuccess: (saveData) => {
                console.log("Workspace saved successfully:", saveData)
                console.log("Mock nodes being activated:", mockNodes)
                
                // Then activate it for the chat
                activateWorkspaceMutation.mutate({
                    configurationId: saveData.configuration.id,
                    chatId,
                    replaceExisting: true
                })
            },
            onError: (error) => {
                console.error("Failed to save workspace:", error)
                toast.error("Failed to save workspace", {
                    description: error.message || "Please try again"
                })
            }
        })
    }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
        onClose()
      }
    }
        if (isOpen) {
    document.addEventListener("keydown", handleEscape)
        }
        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
  }, [isOpen, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
                {/* <DialogOverlay className="bg-black/90 backdrop-blur-md" /> */}
        <DialogContent
          className={cn(
                        "w-[80vw] h-[90vh] !max-w-none sm:!max-w-none max-h-none",
            "fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
                        "border border-border/60",
                        "bg-background",
                        "p-0 gap-0 rounded-xl overflow-hidden",
                        "shadow-2xl shadow-black/25 dark:shadow-black/50",
                        "ring-2 ring-border/30",
                        "backdrop-blur-sm",
                    )}
                >
                    {/* Hidden DialogTitle for accessibility */}
                    <DialogTitle className="sr-only">
                        Healthcare Node Workspace - Build your medical specialist team
                    </DialogTitle>
                    <div className="flex items-center justify-between h-14 px-6 bg-muted/30 border-b border-border/50">
                        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shadow-lg">
                                    <Workflow className="size-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <span className="text-lg font-semibold text-foreground">Healthcare Node Workspace</span>
                                    <p className="text-xs text-muted-foreground">Build your medical specialist team</p>
                </div>
              </div>
                            <div className="h-6 w-px bg-border/50" />
                            <Badge variant="secondary" className="text-xs px-3 py-1">
                                Complete Node Setup
              </Badge>
            </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-9 px-4 text-sm hover:bg-muted">
                                <Save className="size-4 mr-2" />
                                Save Team
              </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 px-4 text-sm"
                                onClick={handleActivateTeam}
                                disabled={activateWorkspaceMutation.isPending || saveWorkspaceMutation.isPending || !chatId || !!userError}
                            >
                                {activateWorkspaceMutation.isPending || saveWorkspaceMutation.isPending ? (
                                    <>
                                        <div className="size-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Activating...
                                    </>
                                ) : (
                                    <>
                                        <Play className="size-4 mr-2" />
                                        Activate Team
                                    </>
                                )}
              </Button>
                            <div className="h-6 w-px bg-border/50 mx-2" />
                            <Button variant="ghost" size="icon" className="size-9 hover:bg-muted" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
                        {/* Node Palette Sidebar */}
                        <div className="w-96 bg-muted/20 border-r border-border/50 overflow-y-auto backdrop-blur-sm">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center shadow-lg">
                                        <Layers className="size-5 text-muted-foreground" />
                </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Specialist Library</h3>
                                        <p className="text-xs text-muted-foreground">Drag to canvas to add</p>
              </div>
            </div>

                                <div className="space-y-3">
                                    {isLoadingNodes ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Loading specialists...
              </div>
              </div>
                                    ) : nodesError ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-center text-muted-foreground">
                                                <div className="text-sm">Failed to load specialists</div>
                                                <div className="text-xs mt-1">Please try again later</div>
                </div>
              </div>
                                    ) : healthcareSpecialists.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-center text-muted-foreground">
                                                <div className="text-sm">No specialists available</div>
                                                <div className="text-xs mt-1">Contact your administrator</div>
                    </div>
                  </div>
                                    ) : (
                                        healthcareSpecialists.map((specialist) => (
                                            <HealthcareNodePaletteItem
                                                key={specialist.id}
                                                specialist={specialist}
                                                onAddToCanvas={() => { }}
                                                isSelected={selectedSpecialty === specialist.id}
                                                onClick={() => setSelectedSpecialty(
                                                    selectedSpecialty === specialist.id ? null : specialist.id
                                                )}
                                            />
                                        ))
              )}
            </div>
                  </div>
                </div>

                        {/* React Flow Canvas */}
                        <ReactFlowProvider>
                            <NodeWorkspaceFlow healthcareSpecialists={healthcareSpecialists} />
                        </ReactFlowProvider>
          </div>

                    {/* Status Bar */}
                    <div className="h-10 px-6 bg-muted/20 border-t border-border/50 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <User className="size-4 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">Complete Node Setup</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Workflow className="size-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Drag, Connect & Manage</span>
            </div>
            <div className="flex items-center gap-2">
                                <Settings className="size-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Save/Load Configurations</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-muted-foreground/60 animate-pulse" />
                                <span className="text-muted-foreground font-medium">All Features Active</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

// Healthcare Node Palette Item Component
function HealthcareNodePaletteItem({
    specialist,
    onAddToCanvas,
    isSelected,
    onClick,
}: {
    specialist: {
        id: string
  label: string
  description: string
        specialty: string
        icon: React.ComponentType<any>
        color: string
    }
    onAddToCanvas: () => void
    isSelected: boolean
    onClick: () => void
}) {
    const onDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData('application/reactflow', specialist.id)
        event.dataTransfer.effectAllowed = 'move'
    }
    const Icon = specialist.icon

  return (
    <div
      className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group border backdrop-blur-sm",
                "transform hover:scale-101",
                isSelected
                    ? "bg-muted/50 border-border shadow-md"
                    : "bg-background/80 border-border/50 hover:bg-muted/30 hover:border-border hover:shadow-md"
            )}
            onClick={onClick}
            draggable
            onDragStart={onDragStart}
        >
            <div className={cn(
                "size-10 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md",
                "bg-muted/80",
                "hover:bg-muted",
                "ring-1 ring-border/30"
            )}>
                <Icon className="size-5 text-muted-foreground drop-shadow-sm" />
        </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{specialist.label}</div>
                <div className="text-xs text-muted-foreground">{specialist.specialty}</div>
      </div>
            <Button
                size="sm"
                variant="ghost"
                className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/90 border border-border/50 backdrop-blur-sm hover:bg-muted"
                onClick={(e) => {
                    e.stopPropagation()
                    onAddToCanvas()
                }}
            >
                <Plus className="size-3" />
            </Button>
    </div>
  )
}
