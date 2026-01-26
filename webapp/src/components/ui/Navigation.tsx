import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

interface NavigationProps {
  initialTab?: 'PROFILE' | 'Echoroom' | 'Score';
  setScreen?: (screen: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ initialTab = 'PROFILE', setScreen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'Echoroom' | 'Score'>(initialTab);

  const handleClickScore = (tab: 'PROFILE' | 'Echoroom' | 'Score', route: string) => {
    setActiveTab(tab);
    if (setScreen) {
      setScreen(route);
    } else {
      navigate(`/${route}`);
    }
  };

  return (
    <div className="bottom-navigation">
      <button
        className={`nav-item nav-item-border ${activeTab === 'PROFILE' ? 'active' : ''}`}
        onClick={() => handleClickScore('PROFILE', 'dashboard')}
      >
        <span className={activeTab === 'PROFILE' ? 'nav-item-active' : 'nav-item-text'}>
          PROFILE
        </span>
      </button>
      <button
        className={`nav-item nav-item-border ${activeTab === 'Echoroom' ? 'active' : ''}`}
        onClick={() => handleClickScore('Echoroom', 'echo-rooms')}
      >
        <span className={activeTab === 'Echoroom' ? 'nav-item-active' : 'nav-item-text'}>
          Echoroom
        </span>
      </button>
      <button
        className={`nav-item ${activeTab === 'Score' ? 'active' : ''}`}
        onClick={() => handleClickScore('Score', 'user-selection')}
      >
        <span className={activeTab === 'Score' ? 'nav-item-active' : 'nav-item-text'}>
          Score
        </span>
      </button>
    </div>
  );
};

export default Navigation;

