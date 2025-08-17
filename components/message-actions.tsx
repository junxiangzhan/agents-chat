
import React from 'react';
import { EditIcon, TrashIcon } from './icons';

interface MessageActionsProps {
    onEdit: () => void;
    onDelete: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="message-actions">
      <button onClick={onEdit} className="action-button edit-button" aria-label="Edit message"><EditIcon /></button>
      <button onClick={onDelete} className="action-button delete-button" aria-label="Delete message"><TrashIcon /></button>
    </div>
  );
};

export default MessageActions;
