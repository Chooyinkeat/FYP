export interface Question {
  question: string;
  answer: string;
}

export interface QuestionPayloadItem {
  filename: string;
  questions: Question[];
}

export interface Props {
  questionPayload: QuestionPayloadItem[];
  userAnswers: string[][];
  setUserAnswers: React.Dispatch<React.SetStateAction<string[][]>>;
  onSubmitAnswers?: (userAnswers: string[][]) => void;
}
