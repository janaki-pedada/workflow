// frontend/src/pages/StackBuilder.tsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
} from 'reactflow';
import { ArrowLeft, Settings, Upload, Search, MessageSquare, Send, Play } from 'lucide-react';
import 'reactflow/dist/style.css';
import './StackBuilder.css';

// Use require to bypass TypeScript import issues
const ReactFlowHooks = require('reactflow');
const { useNodesState, useEdgesState, ConnectionMode } = ReactFlowHooks;

// Define types locally to avoid import issues
type Connection = any;
type Edge = any;
type Node = any;

const nodeTypes = {};

interface StackBuilderProps {
  stackId: number | null;
  onBack: () => void;
  onTestChat: () => void;
}

// Component configuration data
const componentConfigs = {
  userQuery: {
    label: 'User Query',
    description: 'Enter point for queries',
    icon: MessageSquare,
    fields: [
      { name: 'placeholder', label: 'Query', type: 'textarea', placeholder: 'Write your query here' }
    ]
  },
  knowledgeBase: {
    label: 'Knowledge Base',
    description: 'Let LLM search info in your file',
    icon: Upload,
    fields: [
      { name: 'file', label: 'Upload File', type: 'file', accept: '.pdf' },
      { name: 'embeddingModel', label: 'Embedding Model', type: 'select', 
        options: ['text-embedding-3-large', 'text-embedding-ada-002', 'all-MiniLM-L6-v2'] },
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key' }
    ]
  },
  llm: {
    label: 'LLM (OpenAI)',
    description: 'Run a query with OpenAI LLM',
    icon: Settings,
    fields: [
      { name: 'model', label: 'Model', type: 'select', 
        options: ['GPT-4', 'GPT-3.5-turbo', 'GPT-4-mini', 'Gemini-1.5-flash'] },
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key' },
      { name: 'prompt', label: 'Prompt', type: 'textarea', 
        placeholder: 'You are a helpful PDF assistant. Use web search if the PDF lacks context {context}\n\nUser Query: {query}' },
      { name: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 1, step: 0.1, defaultValue: 0.7 },
      { name: 'webSearch', label: 'WebSearch Tool', type: 'select', 
        options: ['SerpAPI', 'Brave Search', 'None'] }
    ]
  },
  webSearch: {
    label: 'Web Search',
    description: 'Search the web for additional information',
    icon: Search,
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key' },
      { name: 'searchEngine', label: 'Search Engine', type: 'select', 
        options: ['Google', 'Bing', 'Brave'] }
    ]
  },
  output: {
    label: 'Output',
    description: 'Displays the final response',
    icon: Send,
    fields: []
  }
};

// Global workflow configuration storage
let globalWorkflowConfig: any = null;

const StackBuilder: React.FC<StackBuilderProps> = ({ stackId, onBack, onTestChat }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  // Function to handle configuration changes
  const handleConfigChange = (fieldName: string, value: string) => {
    if (!selectedNode) return;

    // Update the node's configuration
    setNodes((nds: Node[]) =>
      nds.map((node: Node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  [fieldName]: value
                }
              }
            }
          : node
      )
    );

    // Also update the selectedNode state immediately
    setSelectedNode((prev: Node | null) => prev ? {
      ...prev,
      data: {
        ...prev.data,
        config: {
          ...prev.data.config,
          [fieldName]: value
        }
      }
    } : null);
  };

  // Function to add a new node to the canvas
  const addNode = (type: string, label: string) => {
    const position = {
      x: Math.random() * 400,
      y: Math.random() * 400,
    };

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      position,
      data: { 
        label,
        type,
        config: { ...componentConfigs[type as keyof typeof componentConfigs] }
      },
    };

    setNodes((nds: Node[]) => [...nds, newNode]);
  };

  // Function to handle file upload to Knowledge Base
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/kb/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('File uploaded successfully:', result);
        alert('PDF processed successfully!');
        
        // Update the node configuration with the collection name
        if (selectedNode) {
          setNodes((nds: Node[]) =>
            nds.map((node: Node) =>
              node.id === selectedNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      config: {
                        ...node.data.config,
                        collectionName: result.collection_name
                      }
                    }
                  }
                : node
            )
          );
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to test LLM connection
  const testLLMConnection = async () => {
    if (!selectedNode) return;

    const config = selectedNode.data.config;
    
    // Check if API key is provided
    if (!config.apiKey) {
      alert('Please enter an API key first');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/llm/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: 'Hello! This is a test connection. Are you working?',
          api_key: config.apiKey,
          model: config.model
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ LLM connection successful!\nResponse: ${result.answer}`);
      } else {
        const errorData = await response.json();
        console.error('LLM API Error:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Connection failed');
      }
    } catch (error) {
      console.error('LLM test error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`❌ Error testing LLM connection: ${errorMessage}`);
    }
  };

  // Debug function to check what's stored
  const debugConfig = () => {
    if (selectedNode) {
      console.log('Current config:', selectedNode.data.config);
      alert(`API Key value: "${selectedNode.data.config.apiKey}"\nLength: ${selectedNode.data.config.apiKey?.length || 0} characters`);
    }
  };

  // Function to save workflow configuration
  const saveWorkflowConfig = () => {
    const llmNode = nodes.find((node: Node) => node.data.type === 'llm');
    const kbNode = nodes.find((node: Node) => node.data.type === 'knowledgeBase');
    
    if (llmNode) {
      globalWorkflowConfig = {
        apiKey: llmNode.data.config.apiKey,
        model: llmNode.data.config.model,
        customPrompt: llmNode.data.config.prompt,
        hasKnowledgeBase: kbNode !== undefined,
        collectionName: kbNode?.data.config.collectionName
      };
      console.log('Workflow config saved:', globalWorkflowConfig);
      alert('Workflow configuration saved! You can now test the chat.');
    } else {
      alert('Please add and configure an LLM component first!');
    }
  };

  return (
    <div className="stack-builder">
      <header className="builder-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>GenAI Stack</h1>
        <div className="builder-title">
          <h2>Chat With AI</h2>
          <span className="stack-status">[Z]</span>
        </div>
        <button className="test-chat-button" onClick={() => {
          saveWorkflowConfig();
          onTestChat();
        }}>
          <Play size={16} />
          Test Chat
        </button>
      </header>

      <div className="builder-content">
        {/* Components Panel */}
        <div className="components-panel">
          <h3>Components</h3>
          <div className="component-list">
            {Object.entries(componentConfigs).map(([key, config]) => (
              <div
                key={key}
                className="component-item"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', key);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => addNode(key, config.label)}
              >
                <config.icon size={18} />
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* React Flow Workspace */}
        <div className="workspace">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_: React.MouseEvent, node: Node) => setSelectedNode(node)}
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Configuration Panel */}
        <div className="configuration-panel">
          {selectedNode ? (
            <div className="config-content">
              <h3>{selectedNode.data.label}</h3>
              <p className="config-description">{selectedNode.data.config.description}</p>
              
              {selectedNode.data.config.fields.map((field: any) => (
                <div key={field.name} className="config-field">
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={selectedNode.data.config[field.name] || ''}
                      onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      value={selectedNode.data.config[field.name] || ''}
                      onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'file' ? (
                    <input
                      type="file"
                      accept={field.accept}
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                  ) : field.type === 'range' ? (
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={selectedNode.data.config[field.name] || field.defaultValue || 0}
                      onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={selectedNode.data.config[field.name] || ''}
                      onChange={(e) => {
                        handleConfigChange(field.name, e.target.value);
                      }}
                      onPaste={(e) => {
                        // Handle paste events specifically
                        const pastedValue = e.clipboardData.getData('text');
                        handleConfigChange(field.name, pastedValue);
                        e.preventDefault();
                      }}
                      className={field.type === 'password' ? 'api-key-input' : ''}
                    />
                  )}
                </div>
              ))}

              {selectedNode.data.type === 'llm' && (
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <button 
                    className="test-button"
                    onClick={testLLMConnection}
                  >
                    Test Connection
                  </button>
                  <button 
                    className="debug-button"
                    onClick={debugConfig}
                    style={{ background: '#666' }}
                  >
                    Debug Config
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="config-placeholder">
              <p>Select a component to configure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StackBuilder;
export { globalWorkflowConfig };