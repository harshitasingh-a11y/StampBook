export const FRAME_DESIGNS = ['classic', 'polaroid', 'postage', 'rounded', 'torn-edge'] as const;
export type FrameDesignId = (typeof FRAME_DESIGNS)[number];

export interface Stamp {
  id: string;
  pageId: string;
  slotPosition: number;          // 0-based index in grid
  mediaUrl: string | null;       // null = empty
  mediaType: 'photo' | 'video' | null;
  frameDesignId: FrameDesignId;
  filterId: string | null;
  captionText: string | null;
  rotation: number;              // -3 to +3 degrees
  createdAt: string;
}

export interface Page {
  id: string;
  bookId: string;
  position: number;              // 0-based page order
  stampCount: number;            // 1–4 (Phase 1), up to 6 later
  stamps: Stamp[];
  postmarkDate: string;
  postmarkLocation: string | null;
  createdAt: string;
}
