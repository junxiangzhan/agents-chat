
import React from 'react';
import type { CharacterProfile } from '../types';
import { XIcon } from './icons';

interface SimulationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  worldview: string;
}

const SimulationSettingsModal: React.FC<SimulationSettingsModalProps> = ({ isOpen, onClose, characterA, characterB, worldview }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h3>模擬設定</h3>
          <button onClick={onClose} className="action-button close-modal-button" aria-label="關閉" title="關閉">
            <XIcon />
          </button>
        </div>
        <div className="settings-modal-body">
            <div className="setting-section">
                <h4>世界觀</h4>
                <p>{worldview}</p>
            </div>
            <div className="setting-section">
                <h4>{characterA.name} (角色一)</h4>
                <p><strong>身份:</strong> {characterA.identity}</p>
                <p><strong>人格:</strong> {characterA.personality}</p>
            </div>
             <div className="setting-section">
                <h4>{characterB.name} (角色二)</h4>
                <p><strong>身份:</strong> {characterB.identity}</p>
                <p><strong>人格:</strong> {characterB.personality}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationSettingsModal;
