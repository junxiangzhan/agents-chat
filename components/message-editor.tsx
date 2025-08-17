
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { CheckIcon, XIcon } from './icons';

interface MessageEditorProps {
  msg: ChatMessage;
  onSave: (newText: string) => void;
  onCancel: () => void;
}

const MessageEditor: React.FC<MessageEditorProps> = ({ msg, onSave, onCancel }) => {
  const [editedText, setEditedText] = useState(msg.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    onSave(editedText);
  };
  
  const containerClasses = ['message-editor-container', msg.sender === 'System' ? 'system-message' : ''].join(' ');

  return (
    <div className={containerClasses}>
      <div className="message-editor-card">
        <p className="editor-label">編輯訊息 ({msg.sender})</p>
        <textarea
          ref={textareaRef}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={4}
          onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSave();
              }
              if (e.key === 'Escape') {
                onCancel();
              }
          }}
        />
        <div className="editor-actions">
          <button onClick={onCancel} className="action-button cancel-button" aria-label="取消編輯"><XIcon /></button>
          <button onClick={handleSave} className="action-button save-button" aria-label="儲存編輯"><CheckIcon /></button>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;
