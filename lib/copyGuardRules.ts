/**
 * Centralized list of prohibited phrases and regex patterns.
 * Designed to prevent clinical claims, shaming, or urgent language.
 */

export const BANNED_PHRASES = [
  // Urgency / Escalation
  'urgent', 'emergency', 'immediately', 'life-threatening', 'call an ambulance',
  
  // Diagnosis / Treatment Claims
  'diagnose', 'treatment plan', 'prescribe', 'dosage', 'increase dose', 'decrease dose', 'medical advice', 'clinical trial',
  
  // Risk Prediction
  'risk', 'predict', 'probability', 'you are likely',
  
  // Shame
  'failed', 'non-compliant', 'bad patient', 'wrong', 'lazy', 'guilty', 'shame',
  
  // Glucose Interpretation (Restricted to neutral counts only in app)
  'glucose level', 'hba1c', 'target range', 'high sugar', 'low sugar'
];

export const BANNED_REGEX = [
  /\b(cure|healing)\b/i,
  /\b(must|should)\s+(take|use)\b/i,
  /\b(doctor|physician)\s+recommends\b/i
];
