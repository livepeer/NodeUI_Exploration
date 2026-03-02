import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import PipelineNode from './components/PipelineNode'
import type { PipelineNodeData } from './components/PipelineNode'
import CustomEdge from './components/CustomEdge'
import AddNodeModal from './components/AddNodeModal'
import NodeEditSidebar from './components/NodeEditSidebar'
import type { NodeTypeDef } from './nodeTypeDefs'
import { EditSidebarContext } from './EditSidebarContext'
import './App.css'

const nodeTypes = { pipelineNode: PipelineNode }
const edgeTypes = { custom: CustomEdge }

const initialNodes: Node<PipelineNodeData>[] = [
  {
    id: 'model-selector',
    type: 'pipelineNode',
    position: { x: 148, y: 82 },
    data: {
      title: 'Model Selector',
      status: 'green',
      fields: [
        { id: 'unet_name', label: 'Unet_name', value: 'Null' },
        { id: 'weight_dtype', label: 'Weight_dtype', value: 'Default' },
      ],
    },
  },
  {
    id: 'text-encoder',
    type: 'pipelineNode',
    position: { x: 148, y: 210 },
    data: {
      title: 'Text Encoder',
      status: 'orange',
      fields: [
        { id: 'clip_name', label: 'Clip_Name', value: 'Null' },
        { id: 'type', label: 'Type', value: 'Stable_Diffus...' },
        { id: 'device', label: 'Device', value: 'Default' },
        { id: 'other_value', label: 'Other Value', value: 'Null' },
      ],
    },
  },
  {
    id: 'clip-text-encode',
    type: 'pipelineNode',
    position: { x: 390, y: 318 },
    data: {
      title: 'Clip Text Encode (Prompt)',
      status: 'gray',
      fields: [
        { id: 'value', label: 'Value', value: 'Text', textarea: true },
      ],
    },
  },
  {
    id: 'k-sampler',
    type: 'pipelineNode',
    position: { x: 630, y: 150 },
    data: {
      title: 'K Sampler',
      status: 'orange',
      fields: [
        { id: 'clip_name', label: 'Clip_Name', value: 'Null' },
        { id: 'type', label: 'Type', value: 'Stable_Diffus...' },
        { id: 'device', label: 'Device', value: 'Default' },
        { id: 'other_value_1', label: 'Other Value', value: 'Null' },
        { id: 'other_value_2', label: 'Other Value', value: 'Null' },
        { id: 'other_value_3', label: 'Other Value', value: 'Null' },
        { id: 'other_value_4', label: 'Other Value', value: 'Null' },
      ],
    },
  },
]

const initialEdges: Edge[] = []

// ── Inner component — inside ReactFlowProvider context ──────────────────────
function FlowApp() {
  const { screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [showModal, setShowModal] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)

  const openSidebar = useCallback((id: string) => setEditingNodeId(id), [])

  const onUpdateNode = useCallback(
    (id: string, updater: (data: PipelineNodeData) => PipelineNodeData) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: updater(n.data) } : n))
      )
    },
    [setNodes]
  )

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds)),
    [setEdges]
  )

  const addNode = useCallback(
    (def: NodeTypeDef) => {
      const id = `${def.typeId}-${Date.now()}`
      // Place at viewport center with a small random offset
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 80,
      })
      const newNode: Node<PipelineNodeData> = {
        id,
        type: 'pipelineNode',
        position,
        data: {
          title: def.title,
          status: def.status,
          fields: def.fields.map((f) => ({ ...f, id: `${id}-${f.id}` })),
        },
      }
      setNodes((nds) => [...nds, newNode])
    },
    [screenToFlowPosition, setNodes]
  )

  // Dim nodes that are NOT part of the current selection (works for single + multi-select)
  const anySelected = useMemo(() => nodes.some((n) => n.selected), [nodes])

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: anySelected && !n.selected ? 0.3 : 1,
          transition: 'opacity 0.2s ease',
        },
      })),
    [nodes, anySelected]
  )

  return (
    <EditSidebarContext.Provider value={openSidebar}>
    <div className="app">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <LogoIcon />
        </div>
        <nav className="sidebar-nav">
          <SidebarIcon icon={<CircleIcon />} />
          <SidebarIcon icon={<CircleIcon />} />
          <SidebarIcon icon={<CircleIcon />} />
        </nav>
        <nav className="sidebar-nav sidebar-nav--bottom">
          <SidebarIcon icon={<CircleIcon />} />
          <SidebarIcon icon={<CircleIcon />} />
          <SidebarIcon icon={<CircleIcon />} />
        </nav>
      </aside>

      {/* Main Canvas */}
      <main className="canvas">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.25}
          maxZoom={3}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          selectionOnDrag={true}
          panOnDrag={[1, 2]}
          nodesDraggable
          nodesConnectable
          elementsSelectable
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={64}
            size={1}
            color="rgba(255,255,255,0.03)"
          />
        </ReactFlow>
      </main>

      {/* Bottom Toolbar */}
      <div className="bottom-toolbar">
        <button className="bottom-toolbar__btn" title="Share">
          <ShareIcon />
        </button>
        <button className="bottom-toolbar__btn" title="Camera">
          <CameraIcon />
        </button>
        <button className="bottom-toolbar__btn" title="Draw">
          <DrawIcon />
        </button>
        <button className="bottom-toolbar__btn" title="Shape">
          <ShapeIcon />
        </button>
        <button className="bottom-toolbar__btn" title="Link">
          <LinkIcon />
        </button>
        <button
          className="bottom-toolbar__btn bottom-toolbar__btn--add"
          title="Add node"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Add Node Modal */}
      {showModal && (
        <AddNodeModal
          onAdd={addNode}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>

    {/* Edit Sidebar */}
    <NodeEditSidebar
      nodeId={editingNodeId}
      nodes={nodes}
      onClose={() => setEditingNodeId(null)}
      onUpdateNode={onUpdateNode}
    />
    </EditSidebarContext.Provider>
  )
}

// ── Sidebar helpers ──────────────────────────────────────────────────────────
function SidebarIcon({ icon }: { icon: React.ReactNode }) {
  return <button className="sidebar-icon">{icon}</button>
}

const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <circle cx="9" cy="9" r="6" fill="#ff4d6d" opacity="0.9" />
    <circle cx="17" cy="9" r="6" fill="#ffd166" opacity="0.9" />
    <circle cx="13" cy="17" r="6" fill="#06d6a0" opacity="0.9" />
  </svg>
)

const CircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5.5" stroke="#555" strokeWidth="1.2" />
  </svg>
)

// ── Bottom toolbar icons ─────────────────────────────────────────────────────
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 2l4 4-4 4M14 6H6a4 4 0 000 8" stroke="#666" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="4.5" width="13" height="9" rx="1.5" stroke="#666" strokeWidth="1.3" />
    <circle cx="8" cy="9" r="2.5" stroke="#666" strokeWidth="1.3" />
    <path d="M5.5 4.5V3.5a1 1 0 011-1h3a1 1 0 011 1v1" stroke="#666" strokeWidth="1.3" />
  </svg>
)

const DrawIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 13l7-7M10 3l3 3-7 7H3v-3z" stroke="#666" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ShapeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="#666" strokeWidth="1.3" />
  </svg>
)

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L7.5 3.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5L8.5 12.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 4v10M4 9h10" stroke="#111" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ── Root export — wraps everything in ReactFlowProvider ──────────────────────
export default function App() {
  return (
    <ReactFlowProvider>
      <FlowApp />
    </ReactFlowProvider>
  )
}
