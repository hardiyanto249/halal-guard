
export enum ViolationType {
  RIBA = 'Riba',
  GHARAR = 'Gharar',
  MAYSIR = 'Maysir',
  HALAL = 'Halal', // Compliant
  SUSPICIOUS = 'Syubhat' // Suspicious
}

export enum ComplianceStatus {
  COMPLIANT = 'Patuh',
  NON_COMPLIANT = 'Tidak Patuh',
  NEEDS_REVIEW = 'Butuh Tinjauan'
}

export interface TransactionInput {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string; // e.g., "Credit", "Debit", "Investment"
}

export interface ComplianceBreakdown {
  ribaScore: number;    // 0-1 (1 is fully compliant/no riba)
  ghararScore: number;  // 0-1
  maysirScore: number;  // 0-1
  halalScore: number;   // 0-1 (Goods nature)
  justiceScore: number; // 0-1 (Fair pricing/terms)
}

export interface MaslahahBreakdown {
  economicJustice: number;       // 30%
  communityDevelopment: number;  // 25%
  educationalImpact: number;     // 20%
  environmental: number;         // 15%
  socialCohesion: number;        // 10%
}

export interface MaslahahAnalysis {
  totalScore: number; // 0-100
  breakdown: MaslahahBreakdown;
  longTermProjection: string; // Prediksi dampak jangka panjang
}

export interface AnalysisResult {
  transactionId: string;
  status: ComplianceStatus;
  violationType: ViolationType;
  confidenceScore: number; // Overall weighted score 0-100
  breakdown: ComplianceBreakdown;
  reasoning: string;
  suggestedCorrection?: string;
  maslahahAnalysis?: MaslahahAnalysis; // New field for social impact
}

export interface CombinedResult extends TransactionInput {
  analysis?: AnalysisResult;
}
