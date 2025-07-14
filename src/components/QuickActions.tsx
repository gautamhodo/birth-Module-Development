import React from "react";
import { FileText, ScrollText } from "lucide-react";
import "../styles/QuickActions.css";
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onQuickAction?: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickAction }) => {
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
    switch(action) {
      case 'birth-records':
        navigate('/birth-records');
        break;
      case 'death-records':
        navigate('/death-records');
        break;
      default:
        break;
    }
  };

  return (
    <div className="quick-actions-card">
      <div className="quick-actions-header">
        <span className="quick-actions-title">Quick Actions</span>
        <span className="quick-actions-subtitle">View Records</span>
      </div>
      <div className="quick-actions-grid">
        <button 
          onClick={() => handleQuickAction("birth-records")}
          className="quick-action-btn"
        >
          <FileText className="quick-action-btn-icon" />
          <span className="quick-action-btn-text">Birth Records</span>
        </button>
        <button 
          onClick={() => handleQuickAction("death-records")}
          className="quick-action-btn"
        >
          <ScrollText className="quick-action-btn-icon" />
          <span className="quick-action-btn-text">Death Records</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;