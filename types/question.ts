export interface Question {
  question: string;
  answer: string;
}

export interface QuestionLevels {
  level_1: Question[];
  level_2: Question[];
}

export interface QuestionPayloadItem {
  filename: string;
  questions: QuestionLevels;
}

export interface Props {
  questionPayload: QuestionPayloadItem[];
  userAnswers: Record<string, string>[];
  setUserAnswers: React.Dispatch<
    React.SetStateAction<Record<string, string>[]>
  >;
  onSubmitAnswers?: (userAnswers: Record<string, string>[]) => void;
  userId: string | null;
}
