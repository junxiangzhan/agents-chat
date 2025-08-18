
export interface CharacterProfile {
  name: string;
  personality: string;
  identity: string;
}

export interface ChatMessage {
  sender: string;
  text: string;
}

export interface SimulationData {
  worldview: string;
  charA: CharacterProfile;
  charB: CharacterProfile;
  model: string;
  conversation?: ChatMessage[];
}
