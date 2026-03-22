export type CommunityItemType = 'page' | 'stamp';

export interface CommunityItem {
  id: string;
  type: CommunityItemType;
  title: string;
  author: { name: string; avatar: string };
  colorTheme: string;
  stampCount?: number;   // for pages
  tags: string[];
  likes: number;
  savedCount: number;
  createdAt: string;
}
