
import React from 'react';
import type { CharacterProfile } from '../types';

interface CharacterInputProps {
  character: CharacterProfile;
  setCharacter: React.Dispatch<React.SetStateAction<CharacterProfile>>;
  title: string;
}

const CharacterInput: React.FC<CharacterInputProps> = ({ character, setCharacter, title }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="character-input-card">
      <h3>{title}</h3>
      <div className="form-fields">
        <div>
          <label htmlFor={`name-${title}`}>名字</label>
          <input
            type="text"
            id={`name-${title}`}
            name="name"
            value={character.name}
            onChange={handleChange}
            placeholder="例如：伊娃船長"
          />
        </div>
        <div>
          <label htmlFor={`identity-${title}`}>身份 / 角色</label>
          <input
            type="text"
            id={`identity-${title}`}
            name="identity"
            value={character.identity}
            onChange={handleChange}
            placeholder="例如：一位堅忍的星艦船長"
          />
        </div>
        <div>
          <label htmlFor={`personality-${title}`}>人格特質</label>
          <textarea
            id={`personality-${title}`}
            name="personality"
            value={character.personality}
            onChange={handleChange}
            rows={3}
            placeholder="例如：謹慎、有邏輯、被過去的失敗所困擾，深切關心船員。"
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterInput;
