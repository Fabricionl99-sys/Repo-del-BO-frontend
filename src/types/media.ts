export type MediaModule =
  | 'chests'
  | 'shop'
  | 'avatars'
  | 'news'
  | 'branding'
  | 'settings'
  | 'predictions'
  | 'tournaments'
  | 'bonuses'
  | 'rankings'
  | 'wheels'
  | 'login_popups';

export type MediaPurpose =
  | 'thumbnail'
  | 'banner'
  | 'background'
  | 'logo'
  | 'icon'
  | 'main_image'
  | 'prize_image';

export type MediaSource = 'upload' | 'external';

export type MediaAspectRatio = 'square' | 'banner' | 'free';

export interface MediaValue {
  url: string;
  source: MediaSource;
}

export interface MediaContext {
  module: MediaModule;
  purpose: MediaPurpose;
}

export interface MediaDimensions {
  width: number;
  height: number;
}

export interface MediaUploadResponse {
  url: string;
  filename: string;
  size_kb: number;
  width: number;
  height: number;
  variants?: {
    thumb_64: string;
    thumb_128: string;
    thumb_256: string;
    full: string;
  };
}

export interface StorageFileItem {
  id: string;
  url: string;
  filename: string;
  module: MediaModule;
  purpose: MediaPurpose;
  size_kb: number;
  width: number;
  height: number;
  uploaded_at: string;
}
