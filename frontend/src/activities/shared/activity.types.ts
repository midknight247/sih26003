/**
 * Shared Activity System Contracts matching Rule 3.1.4 criteria.
 * Every individual task layout (Categorization, Reminiscence, Matching, Sequencing)
 * must conform to these shared property interfaces.
 */

export interface ActivityConfiguration {
  activityId: string;
  difficultyTier: 'low' | 'medium' | 'high';
  assistanceLevel: number; // Level of automated support cues to unlock
  timeoutSeconds: number;
}

export interface ActivityContent {
  promptText: string;
  mediaUrl?: string;
  correctSequence?: string[];
  optionsPool: string[];
}

export interface InteractionEvent {
  timestamp: number;
  actionType: 'click' | 'drag_start' | 'drop' | 'timeout' | 'assistance_request';
  targetElementId: string;
  isCorrectMetric: boolean;
  dwellTimeMs: number;
}

export interface ActivityProps {
  configuration: ActivityConfiguration;
  content: ActivityContent;
  onEvent: (event: InteractionEvent) => void;
  onComplete: () => void;
  onAbandon: () => void;
}
