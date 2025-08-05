export interface AIResponse {
  filename: string;
  previewUrl: string;
  category: string; // Added category field
  metadata: {
    item_type: string;
    color: string;
    brand: string;
    material: string;
    condition: string;
  };
  questions: {
    level_1: { question: string; answer: string }[];
    level_2: { question: string; answer: string }[];
  };
}
