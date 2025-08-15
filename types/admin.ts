export interface TotalRows {
  total_rows: number;
}

export interface User {
  username: string;
  email: string;
  contact: string;
  profile: string;
  status: number;
}

export interface Report {
  report_id: number;
  title: string;
  description: string;
  reason: string;
  status: number;
  created_date: string;
  last_updated_date: string;
  user_id: number;
  case_id: number;
  fake_claim_id: number;
  image_payload: string;
  item_id: number;
  suspect_id: number;
}

export interface Table {
  user_id: number;
  username: string;
  email: string;
  contact: string;
  profile: string;
  status: number;
  created_date: string;
  found_count: number;
  lost_count: number;
}
