export interface TotalRows {
  total_rows: number;
}

export interface Report {
  report_id: number;
  title: string;
  description: string;
  reason: string;
  status: number;
  created_date: string; // ISO date string
  last_updated_date: string; // ISO date string
  user_id: number;
  case_id: number;
  fake_claim_id: number;
  image_payload: string; // stringified JSON
  item_id: number;
  suspect_id: number;
}
