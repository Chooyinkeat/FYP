export interface FoundItem {
  imageUrl: string[];
  question: QuestionBlock[];
  status: number;
}

interface QuestionBlock {
  filename: string;
  metadata: {
    item_type: string;
    color: string;
    brand: string;
    material: string;
    condition: string;
  };
  questions: {
    question: string;
    answer: string;
  }[];
}

export interface LostItem {
  imageUrl: string[];
  description: string;
  status: number;
  userId: string;
}
