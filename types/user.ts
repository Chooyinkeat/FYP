import exp from "constants";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  // and more...
}

interface UserProfile {
  uid: string;
  name: string;
  bio?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
export type { User, UserProfile };
