export interface FoundItem {
  category: string;
  foundId: string;
  status: number;
  date: string;
  time: string;
  location: string;
  userId: string;
}

export interface QuestionBlock {
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
