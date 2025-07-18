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
  date: string; // ✅ Add this
  time: string; // ✅ Add this
  location: string; // ✅ Add this
}

export interface LostItem {
  category: string;
  imageUrl: string[];
  description: string;
  status: number;
  userId: string;
}

export interface Description {
  category: string;
  location: string;
  description: string;
  date: string;
  time: string;
}
