
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { getAiClient } from '../services/gemini-service';
import type { CharacterProfile, ChatMessage } from '../types';
import { PlayIcon, PauseIcon, SendIcon, BackIcon, BotIcon, BookOpenIcon, DownloadIcon } from '../components/icons';
import MessageEditor from '../components/message-editor';
import ChatBubble from '../components/chat-bubble';
import SimulationSettingsModal from '../components/simulation-settings-modal';

interface ConversationViewProps {
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  worldview: string;
  model: string;
  onBack: () => void;
  initialConversation?: ChatMessage[];
}

const ConversationView: React.FC<ConversationViewProps> = ({ characterA, characterB, worldview, model, onBack, initialConversation }) => {
  const [conversation, setConversation] = useState<ChatMessage[]>(initialConversation || [{ sender: 'System', text: '對話開始。' }]);
  const [isConversing, setIsConversing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'A' | 'B'>('A');
  const [systemEvent, setSystemEvent] = useState('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number } | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const chatA = useRef<Chat | null>(null);
  const chatB = useRef<Chat | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const initializeChats = useCallback(() => {
    const ai = getAiClient();
    if (!ai) {
      setApiKeyError('Google AI API 金鑰未設定。請設定 process.env.API_KEY 環境變數。');
      return;
    }
    setApiKeyError(null);

    const commonSystemInstruction = `這是對話的背景設定（世界觀）：「${worldview}」。請嚴格遵守此設定。`;
    const systemInstructionA = `${commonSystemInstruction} 你是 ${characterA.name}。你的身份是：「${characterA.identity}」。你的人格是：「${characterA.personality}」。你正在和 ${characterB.name} 對話。你的回覆必須只包含你的對話，不要有你的名字或任何格式。`;
    const systemInstructionB = `${commonSystemInstruction} 你是 ${characterB.name}。你的身份是：「${characterB.identity}」。你的人格是：「${characterB.personality}」。你正在和 ${characterA.name} 對話。你的回覆必須只包含你的對話，不要有你的名字或任何格式。`;
    
    try {
        chatA.current = ai.chats.create({ model, config: { systemInstruction: systemInstructionA } });
        chatB.current = ai.chats.create({ model, config: { systemInstruction: systemInstructionB } });
    } catch (error) {
        console.error('Error initializing chat:', error);
        setApiKeyError(`初始化模型「${model}」時發生錯誤。請確認模型名稱是否正確，以及您是否有權限使用。`);
    }
  }, [characterA, characterB, worldview, model]);

  useEffect(() => {
    initializeChats();
  }, [initializeChats]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const advanceConversation = useCallback(async () => {
    if (!isConversing || isLoading || !chatA.current || !chatB.current || editingMessage) return;

    setIsLoading(true);
    const lastMessage = conversation[conversation.length - 1];
    
    if (!lastMessage) {
        setConversation(prev => [...prev, { sender: 'System', text: '對話紀錄為空，無法繼續。對話已暫停。' }]);
        setIsConversing(false);
        setIsLoading(false);
        return;
    }
    
    if (lastMessage.sender === 'System' && systemEvent) {
      // Let AI respond to the new system event
    } else if (lastMessage.sender !== 'System' && lastMessage.sender === (currentTurn === 'A' ? characterB.name : characterA.name)) {
        // This is the expected flow, continue.
    } else if (lastMessage.sender === 'System') {
        // This is the start of the conversation, continue.
    } else {
        setIsLoading(false);
        return;
    }
    
    try {
      const currentChat = currentTurn === 'A' ? chatA.current : chatB.current;
      const currentCharacter = currentTurn === 'A' ? characterA : characterB;

      const response = await currentChat.sendMessage({ message: lastMessage.text });

      setConversation(prev => [...prev, { sender: currentCharacter.name, text: response.text }]);
      setCurrentTurn(prev => (prev === 'A' ? 'B' : 'A'));
    } catch (error) {
      console.error('Error generating content:', error);
      setConversation(prev => [...prev, { sender: 'System', text: `發生 API 錯誤。對話已暫停。詳細資訊： ${error instanceof Error ? error.message : '未知錯誤'}` }]);
      setIsConversing(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConversing, isLoading, conversation, currentTurn, characterA, characterB, systemEvent, editingMessage]);
  
  useEffect(() => {
    if (isConversing) {
        const timer = setTimeout(advanceConversation, 1500); // Add a small delay for natural pacing
        return () => clearTimeout(timer);
    }
  }, [isConversing, conversation, advanceConversation]);

  const handleToggleConversation = () => {
    if (apiKeyError || editingMessage) return;
    setIsConversing(prev => !prev);
  };

  const handleSendSystemEvent = () => {
    if (systemEvent.trim()) {
      setConversation(prev => [...prev, { sender: 'System', text: `[事件：${systemEvent.trim()}]` }]);
      setSystemEvent('');
      setIsConversing(true); // Automatically resume after event
    }
  };

  const handleDeleteMessage = (indexToDelete: number) => {
    setConversation(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleStartEdit = (index: number) => {
    setIsConversing(false); // Pause conversation when editing
    setEditingMessage({ index });
  };
  
  const handleCancelEdit = () => {
    setEditingMessage(null);
  };
  
  const handleSaveEdit = (index: number, newText: string) => {
    setConversation(prev => {
      const newConversation = [...prev];
      if (newConversation[index]) {
        newConversation[index].text = newText;
      }
      return newConversation;
    });
    setEditingMessage(null);
  };
  
 const handleAddMessage = (sender: string) => {
    const newText = sender === 'System' ? '[事件：]' : '';
    const newMessage: ChatMessage = { sender, text: newText };
    
    setConversation(prev => {
      const newIndex = prev.length;
      setTimeout(() => {
        handleStartEdit(newIndex);
        conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return [...prev, newMessage];
    });
  };

  const handleDownload = () => {
    try {
        const dataToSave = {
            worldview,
            charA: characterA,
            charB: characterB,
            model,
            conversation
        };
        const jsonString = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
        link.download = `ai-chat-${characterA.name}-${characterB.name}-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Failed to download conversation", e);
    }
  };

  const getStatusText = () => {
    if(isConversing) return '進行中';
    if(editingMessage) return '編輯中';
    return '已暫停';
  };
  const getStatusClass = () => {
    if(isConversing) return 'status-active';
    if(editingMessage) return 'status-editing';
    return 'status-paused';
  }

  return (
    <>
      <div className="conversation-container">
        <header className="conversation-header">
          <button onClick={onBack} className="back-button"><BackIcon /> 返回設定</button>
          <div className="header-title">
            <h2>{characterA.name} & {characterB.name}</h2>
            <div className="header-subtitle">
              <p className={getStatusClass()}>{getStatusText()}</p>
              <span>&bull;</span>
              <p className="model-name-display">{model}</p>
            </div>
          </div>
          <div className="header-actions">
            <button
                onClick={handleDownload}
                className="settings-button"
                aria-label="下載對話"
                title="下載對話"
            >
                <DownloadIcon />
            </button>
            <button 
              onClick={() => setIsSettingsVisible(true)} 
              className="settings-button" 
              aria-label="查看設定"
              title="查看設定"
            >
              <BookOpenIcon />
            </button>
            <button onClick={handleToggleConversation} disabled={!!apiKeyError || !!editingMessage} className="play-pause-button">
              {isConversing ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
        </header>

        <div className="conversation-log">
          {apiKeyError && <div className="api-error">{apiKeyError}</div>}
          {conversation.map((msg, index) => (
              editingMessage?.index === index ? (
                  <MessageEditor
                      key={`${index}-editor`}
                      msg={msg}
                      onSave={(newText) => handleSaveEdit(index, newText)}
                      onCancel={handleCancelEdit}
                  />
              ) : (
                  <ChatBubble 
                      key={index} 
                      msg={msg} 
                      index={index}
                      characterA={characterA}
                      isConversing={isConversing}
                      onStartEdit={handleStartEdit}
                      onDeleteMessage={handleDeleteMessage}
                  />
              )
          ))}
          {isLoading && (
              <div className="loading-indicator">
                  <div className="loading-bubble">
                    <BotIcon />
                    <span>輸入中...</span>
                  </div>
              </div>
          )}
          <div ref={conversationEndRef} />
        </div>

        {!isConversing && !apiKeyError && !editingMessage && (
          <footer className="conversation-footer">
            <div className="system-event-input">
              <p>對話已暫停。你可以引入一個新事件。</p>
              <div className="input-group">
                <input
                  type="text"
                  value={systemEvent}
                  onChange={(e) => setSystemEvent(e.target.value)}
                  placeholder="例如：一個奇怪的警報開始響起。"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSystemEvent()}
                />
                <button onClick={handleSendSystemEvent} className="send-button">
                  <SendIcon />
                </button>
              </div>
            </div>
            <div className="manual-edit-actions">
              <p>或手動編輯對話</p>
              <div className="button-group">
                  <button onClick={() => handleAddMessage(characterA.name)} className="button-add-a">新增 {characterA.name} 的訊息</button>
                  <button onClick={() => handleAddMessage(characterB.name)} className="button-add-b">新增 {characterB.name} 的訊息</button>
                  <button onClick={() => handleAddMessage('System')} className="button-add-system">新增系統事件</button>
              </div>
            </div>
          </footer>
        )}
      </div>
      <SimulationSettingsModal
          isOpen={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
          characterA={characterA}
          characterB={characterB}
          worldview={worldview}
      />
    </>
  );
};

export default ConversationView;
