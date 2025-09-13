// frontend/src/pages/Dashboard.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import './Dashboard.css';

interface Stack {
  id: number;
  name: string;
  description: string;
}

interface DashboardProps {
  stacks: Stack[];
  onNewStack: () => void;
  onEditStack: (stackId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stacks, onNewStack, onEditStack }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>GenAI Stack</h1>
      </header>
      
      <div className="dashboard-content">
        <h2>My Stacks</h2>
        
        <div className="stacks-grid">
          {/* Create New Stack Card */}
          <div className="stack-card create-new">
            <div className="stack-card-content">
              <Plus size={48} className="plus-icon" />
              <h3>Create New Stack</h3>
              <p>Start building your generative AI apps with our essential tools and frameworks</p>
            </div>
            <button className="new-stack-btn" onClick={onNewStack}>
              + New Stack
            </button>
          </div>

          {/* Existing Stacks */}
          {stacks.map(stack => (
            <div key={stack.id} className="stack-card">
              <div className="stack-card-content">
                <h3>{stack.name}</h3>
                <p>{stack.description}</p>
              </div>
              <button 
                className="edit-stack-btn" 
                onClick={() => onEditStack(stack.id)}
              >
                Edit Stack 💬
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;