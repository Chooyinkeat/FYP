export interface AIResponse {
  filename: string;
  metadata: {
    item_type: string;
    color: string;
    brand: string;
    material: string;
    condition: string;
  };
  questions: { question: string; answer: string }[];
}
