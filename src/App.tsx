// frontend/src/App.tsx
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import CreateStack from './pages/CreateStack';
import StackBuilder from './pages/StackBuilder';
import ChatInterface from './pages/ChatInterface';
import './App.css';

function App() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentStack, setCurrentStack] = useState<number | null>(null);
  const [stacks, setStacks] = useState([
    { id: 1, name: 'Chat With AI', description: 'Chat with a smart AI' },
    { id: 2, name: 'Content Writer', description: 'Helps you write content' },
    { id: 3, name: 'Content Summarizer', description: 'Helps you summarize content' },
    { id: 4, name: 'Information Finder', description: 'Helps you find relevant information' }
  ]);

  const handleCreateStack = (name: string, description: string) => {
    const newStack = {
      id: Date.now(),
      name,
      description
    };
    setStacks(prev => [...prev, newStack]);
    setShowCreateModal(false);
    setCurrentStack(newStack.id);
    setCurrentView('builder');
  };

  const handleNewStack = () => {
    setShowCreateModal(true);
  };

  const handleEditStack = (stackId: number) => {
    setCurrentStack(stackId);
    setCurrentView('builder');
  };

  const handleTestChat = () => {
    setCurrentView('chat');
  };

  const handleBackToBuilder = () => {
    setCurrentView('builder');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentStack(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <ChatInterface 
            workflowId={currentStack?.toString() || ''}
            onBack={handleBackToBuilder}
          />
        );
      case 'builder':
        return (
          <StackBuilder 
            stackId={currentStack} 
            onBack={handleBackToDashboard}
            onTestChat={handleTestChat}
          />
        );
      case 'dashboard':
      default:
        return (
          <>
            <Dashboard 
              stacks={stacks}
              onNewStack={handleNewStack}
              onEditStack={handleEditStack}
            />
            {showCreateModal && (
              <CreateStack
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateStack}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;