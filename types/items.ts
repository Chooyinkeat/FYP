export interface FoundItem {
  category: string;
  foundId: string;
  status: number;
  date: string;
  time: string;
  location: string;
  userId: string;
  image_url: string[];
  show_img: number;
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
  lostId: string;
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

export interface LostItemTable {
  category: string;
  description: {
    location: string;
    date: string;
    time: string;
  };
  status: number;
  lostId: string;
}

export interface FoundItemTable {
  category: string;
  location: string;
  date: string;
  time: string;
  status: number;
  foundId: string;
  userId: string;
}
