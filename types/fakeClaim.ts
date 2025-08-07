export interface ImagePayload {
  userUploadImage: string[];
  image_url_payload: string[];
}

export interface FakeClaimItem {
  fakeClaimId: number;
  imagePayload: ImagePayload;
  status: number;
  itemId: number;
  suspectId: number;
  userId: number;
}
