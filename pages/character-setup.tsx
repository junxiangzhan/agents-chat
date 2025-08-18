
import React, { useState, useEffect, useRef } from 'react';
import type { CharacterProfile, ChatMessage, SimulationData } from '../types';
import { ArrowRightIcon, DownloadIcon, UploadIcon } from '../components/icons';
import CharacterInput from '../components/character-input';

interface CharacterSetupProps {
  onStart: (characterA: CharacterProfile, characterB: CharacterProfile, worldview: string, model: string, conversation?: ChatMessage[]) => void;
}

const LOCAL_STORAGE_KEY = 'ai-character-chat-profiles-with-worldview-v2';
const PREDEFINED_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
const CUSTOM_MODEL_VALUE = 'custom';

const CharacterSetup: React.FC<CharacterSetupProps> = ({ onStart }) => {
  const [characterA, setCharacterA] = useState<CharacterProfile>({ name: '伊娃船長', identity: '「奧德賽號」星艦上堅忍的船長', personality: '謹慎、有邏輯、被過去的失敗所困擾，深切關心她的船員。' });
  const [characterB, setCharacterB] = useState<CharacterProfile>({ name: 'J-4X', identity: '「奧德賽號」上過度樂觀的安卓助理', personality: '好奇、天真、遵循邏輯得出荒謬的結論，不斷尋求理解人類情感。' });
  const [worldview, setWorldview] = useState<string>('在一艘名為「奧德賽號」的孤獨星艦上，它正穿越一個未知的小行星帶。通訊系統已損壞，船員們只能依靠自己。');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [selectedModelOption, setSelectedModelOption] = useState<string>('gemini-2.5-flash');
  const [error, setError] = useState<string>('');
  const [partialUploadData, setPartialUploadData] = useState<Partial<SimulationData> | null>(null);
  const [uploadWithConversationData, setUploadWithConversationData] = useState<SimulationData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateModelStates = (newModelValue: string) => {
    setModel(newModelValue);
    if (PREDEFINED_MODELS.includes(newModelValue)) {
        setSelectedModelOption(newModelValue);
    } else {
        setSelectedModelOption(CUSTOM_MODEL_VALUE);
    }
  };
  
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { charA, charB, worldview: savedWorldview, model: savedModel } = JSON.parse(savedData);
        if (charA && charA.name && charB && charB.name) {
          setCharacterA(charA);
          setCharacterB(charB);
          if (typeof savedWorldview === 'string') {
            setWorldview(savedWorldview);
          }
          if (typeof savedModel === 'string') {
            updateModelStates(savedModel);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load profiles from local storage", e);
    }
  }, []);

  useEffect(() => {
    try {
        const dataToSave = { charA: characterA, charB: characterB, worldview, model };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
        console.error("Failed to save profiles to local storage", e);
    }
  }, [characterA, characterB, worldview, model]);
  
  const handleModelSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedModelOption(value);
    if (value !== CUSTOM_MODEL_VALUE) {
      setModel(value);
    }
  };

  const handleStart = () => {
    if (!characterA.name || !characterA.identity || !characterA.personality || 
        !characterB.name || !characterB.identity || !characterB.personality || !worldview || !model) {
      setError('所有欄位（包括世界觀和模型）都必須填寫。');
      return;
    }
    setError('');
    onStart(characterA, characterB, worldview, model);
  };

  const handleDownload = () => {
    try {
      const dataToSave = { worldview, charA: characterA, charB: characterB, model };
      const jsonString = JSON.stringify(dataToSave, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-characters-setting.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setError('');
    } catch (e) {
      setError("下載設定失敗。");
      console.error("Failed to download settings", e);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("檔案讀取錯誤。");
        
        const data: Partial<SimulationData> = JSON.parse(text);
        
        const isCompleteChar = (char: any): char is CharacterProfile => char && char.name && char.identity && char.personality;

        if (Array.isArray(data.conversation) && data.conversation.length > 0) {
            if (data.charA && isCompleteChar(data.charA) && data.charB && isCompleteChar(data.charB) && typeof data.worldview === 'string' && typeof data.model === 'string') {
                setUploadWithConversationData(data as SimulationData);
                return;
            }
        }
        
        const hasAnyValidKey = data.charA || data.charB || data.worldview !== undefined || data.model !== undefined;

        if (data.charA && isCompleteChar(data.charA) && data.charB && isCompleteChar(data.charB) && typeof data.worldview === 'string' && typeof data.model === 'string') {
          setCharacterA(data.charA);
          setCharacterB(data.charB);
          setWorldview(data.worldview);
          updateModelStates(data.model);
          setError('');
          setPartialUploadData(null);
        } else if (hasAnyValidKey) {
          setPartialUploadData(data);
          setError('');
        } else {
          setError("無效的檔案格式。請確認檔案包含角色與世界觀設定。");
        }
      } catch (err) {
        setError("讀取檔案失敗。請確認檔案為正確的 JSON 格式。");
        console.error("Failed to parse uploaded file", err);
      }
    };
    reader.onerror = () => {
        setError("讀取檔案時發生錯誤。");
    }
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleCancelPartialUpload = () => {
    setPartialUploadData(null);
  };

  const handleMergeUpload = () => {
    if (!partialUploadData) return;
    const { charA, charB, worldview: newWorldview, model: newModel } = partialUploadData;

    if (charA) setCharacterA(prev => ({ ...prev, ...charA }));
    if (charB) setCharacterB(prev => ({ ...prev, ...charB }));
    if (newWorldview !== undefined) setWorldview(newWorldview);
    if (newModel !== undefined) updateModelStates(newModel);
    
    setPartialUploadData(null);
  };

  const handleClearAndApplyUpload = () => {
    if (!partialUploadData) return;
    const { charA, charB, worldview: newWorldview, model: newModel } = partialUploadData;
    const blankProfile: CharacterProfile = { name: '', identity: '', personality: '' };

    setCharacterA({ ...blankProfile, ...charA });
    setCharacterB({ ...blankProfile, ...charB });
    setWorldview(newWorldview || '');
    updateModelStates(newModel || 'gemini-2.5-flash');

    setPartialUploadData(null);
  };

  const handleUploadConversation = () => {
    if (!uploadWithConversationData) return;
    const { charA, charB, worldview, model, conversation } = uploadWithConversationData;
    onStart(charA, charB, worldview, model, conversation);
    setUploadWithConversationData(null);
  };

  const handleUploadSettingsOnly = () => {
    if (!uploadWithConversationData) return;
    const { charA, charB, worldview, model } = uploadWithConversationData;
    setCharacterA(charA);
    setCharacterB(charB);
    setWorldview(worldview);
    updateModelStates(model);
    setUploadWithConversationData(null);
  };

  return (
    <>
      <div className="setup-container">
        <h2>設定世界觀與角色</h2>
        
        <div className="worldview-card">
          <h3>世界觀 / 故事背景</h3>
          <textarea
              name="worldview"
              value={worldview}
              onChange={(e) => setWorldview(e.target.value)}
              rows={3}
              placeholder="例如：在一個賽博龐克城市，霓虹燈在永不停歇的雨中閃爍。"
          />
        </div>

        <div className="characters-grid">
          <CharacterInput character={characterA} setCharacter={setCharacterA} title="角色一" />
          <CharacterInput character={characterB} setCharacter={setCharacterB} title="角色二" />
        </div>

        <hr />

        <div className="settings-card">
          <h3>模擬設定</h3>
          <div className="model-selection-group">
              <label htmlFor="model-name">語言模型</label>
              <select
                  id="model-name"
                  name="model-select"
                  value={selectedModelOption}
                  onChange={handleModelSelectChange}
              >
                  {PREDEFINED_MODELS.map(m => (
                      <option key={m} value={m}>{m}</option>
                  ))}
                  <option value={CUSTOM_MODEL_VALUE}>自訂模型...</option>
              </select>
              
              {selectedModelOption === CUSTOM_MODEL_VALUE && (
                  <input
                      type="text"
                      id="custom-model-name"
                      name="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="輸入自訂模型名稱"
                  />
              )}
              <p className="field-description">選擇或輸入您想用於模擬的 Google AI 模型名稱。</p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        
        <hr />
        
        <div className="file-actions">
          <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              accept=".json"
              hidden 
          />
          <button
            onClick={handleUploadClick}
            className="button-secondary"
          >
            <UploadIcon /> 上傳設定
          </button>
          <button
            onClick={handleDownload}
            className="button-secondary"
          >
            <DownloadIcon /> 下載設定
          </button>
        </div>

        <div className="start-action">
          <button
            onClick={handleStart}
            className="button-primary"
          >
            開始模擬 <ArrowRightIcon />
          </button>
        </div>
      </div>
      
      {partialUploadData && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>檔案內容不完整</h3>
                <p>您上傳的設定檔缺少部分欄位。您希望如何處理？</p>
                <div className="modal-actions">
                    <button onClick={handleCancelPartialUpload} className="button-secondary">取消上傳</button>
                    <button onClick={handleMergeUpload} className="button-secondary">保留已有欄位</button>
                    <button onClick={handleClearAndApplyUpload} className="button-secondary">清空已有欄位</button>
                </div>
            </div>
        </div>
      )}

      {uploadWithConversationData && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>偵測到對話記錄</h3>
                <p>您上傳的檔案包含對話記錄。請選擇匯入方式：</p>
                <div className="modal-actions">
                    <button onClick={() => setUploadWithConversationData(null)} className="button-secondary">取消</button>
                    <button onClick={handleUploadSettingsOnly} className="button-secondary">僅匯入設定</button>
                    <button onClick={handleUploadConversation} className="button-primary">匯入設定與對話</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default CharacterSetup;
