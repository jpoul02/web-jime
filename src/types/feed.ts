export interface InstaPhoto {
  id: number;
  photo_url: string;
}

export interface InstaPost {
  id: number;
  name: string;
  profile_photo_url: string | null;
  dedicatoria: string | null;
  photos: InstaPhoto[];
  created_at: string;
}
