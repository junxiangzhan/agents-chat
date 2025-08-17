
import React from 'react';
import type { CharacterProfile, ChatMessage } from '../types';
import MessageActions from './message-actions';

interface ChatBubbleProps {
    msg: ChatMessage;
    index: number;
    characterA: CharacterProfile;
    isConversing: boolean;
    onStartEdit: (index: number) => void;
    onDeleteMessage: (index: number) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ msg, index, characterA, isConversing, onStartEdit, onDeleteMessage }) => {
    const isCharacterA = msg.sender === characterA.name;
    const isSystem = msg.sender === 'System';
    
    if (isSystem) {
      return (
        <div className="system-message-container">
            <div className="system-message-bubble">
                 <p>{msg.text}</p>
                {!isConversing && (
                  <MessageActions
                      onEdit={() => onStartEdit(index)}
                      onDelete={() => onDeleteMessage(index)}
                  />
                )}
            </div>
        </div>
      );
    }
    
    const containerClasses = ['chat-bubble-container', isCharacterA ? 'character-a' : 'character-b'].join(' ');
    
    return (
      <div className={containerClasses}>
        <div className="chat-bubble">
          <p className="sender-name">{msg.sender}</p>
          <p className="message-text">{msg.text}</p>
           {!isConversing && (
                <MessageActions
                    onEdit={() => onStartEdit(index)}
                    onDelete={() => onDeleteMessage(index)}
                />
            )}
        </div>
      </div>
    );
};

export default ChatBubble;
