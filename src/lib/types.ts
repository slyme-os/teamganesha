export type CrowdLevel = 'low' | 'medium' | 'high';

export interface Hotspot {
  id: string;
  title: string;
  type: 'info' | 'audio' | 'offering' | 'donate';
  pitch: number; // Vertical angle in degrees (-90 to 90)
  yaw: number;   // Horizontal angle in degrees (-180 to 180)
  description?: string;
}

export interface Pandal {
  id: string;
  name: string;
  tagline: string;
  location: string;
  area: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm: number; // Distance from user location (default estimated from Central Mumbai)
  crowdLevel: CrowdLevel;
  waitTimeMinutes: number;
  history: string;
  aartiTimings: string[];
  panoramaImage: string;
  thumbnailImage: string;
  upiDetails: {
    vpa: string;
    accountName: string;
    bankName: string;
    verified: boolean;
  };
  hotspots: Hotspot[];
  totalViews: number;
  totalPranams: number;
  isPopular: boolean;
}

export interface CrowdReport {
  id: string;
  pandalId: string;
  reportedStatus: CrowdLevel;
  estimatedWaitMinutes: number;
  reporterName?: string;
  timestamp: string;
}

export interface PhotoFeedItem {
  id: string;
  pandalId: string;
  pandalName: string;
  userName: string;
  imageUrl: string;
  caption: string;
  pranams: number;
  createdAt: string;
}
