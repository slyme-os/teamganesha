import { CrowdLevel, CrowdReport, PhotoFeedItem } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';

const INITIAL_PHOTOS: PhotoFeedItem[] = [
  {
    id: 'photo-1',
    pandalId: 'lalbaugcha-raja',
    pandalName: 'Lalbaugcha Raja',
    userName: 'Rohan Sharma (Girgaon)',
    imageUrl: '/images/pandals/lalbaug_360.png',
    caption: 'Maha Aarti Darshan at 8 PM. Magnificent atmosphere! Bappa Morya! 🙏',
    pranams: 342,
    createdAt: '10 mins ago',
  },
  {
    id: 'photo-2',
    pandalId: 'gsb-seva-mandal',
    pandalName: 'GSB Seva Mandal',
    userName: 'Priya Naik (Matunga)',
    imageUrl: '/images/pandals/gsb_360.png',
    caption: 'Gold Ganesha Abhishek Seva completed. Queue is moving smoothly.',
    pranams: 189,
    createdAt: '25 mins ago',
  },
  {
    id: 'photo-3',
    pandalId: 'chinchpokli-chintamani',
    pandalName: 'Chinchpokli Cha Chintamani',
    userName: 'Aditya Kadam (Dadad)',
    imageUrl: '/images/pandals/chintamani_360.png',
    caption: 'Subhanallah heritage decor! Chintamani blessing us all.',
    pranams: 254,
    createdAt: '1 hour ago',
  },
  {
    id: 'photo-4',
    pandalId: 'khetwadi-cha-raja',
    pandalName: 'Khetwadi Cha Raja',
    userName: 'Neha Patil (Girgaon)',
    imageUrl: '/images/pandals/khetwadi_360.png',
    caption: '40ft floral decor looks out of this world in person! Multi-colored roses and marigolds.',
    pranams: 142,
    createdAt: '2 hours ago',
  },
];

class PandalService {
  private localReports: CrowdReport[] = [];
  private localPhotos: PhotoFeedItem[] = INITIAL_PHOTOS;

  async submitCrowdReport(pandalId: string, status: CrowdLevel, waitMinutes: number, name?: string): Promise<CrowdReport> {
    const report: CrowdReport = {
      id: 'report-' + Date.now(),
      pandalId,
      reportedStatus: status,
      estimatedWaitMinutes: waitMinutes,
      reporterName: name || 'Devotee',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('crowd_reports').insert([{
          pandal_id: pandalId,
          reported_status: status,
          estimated_wait_minutes: waitMinutes,
          reporter_name: name || 'Devotee',
        }]);
      } catch (err) {
        console.warn('Supabase insert fallback to local state', err);
      }
    }

    this.localReports.unshift(report);
    return report;
  }

  async getLatestCrowdReports(pandalId: string): Promise<CrowdReport[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('crowd_reports')
          .select('*')
          .eq('pandal_id', pandalId)
          .order('created_at', { ascending: false })
          .limit(5);
        if (data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            pandalId: item.pandal_id,
            reportedStatus: item.reported_status,
            estimatedWaitMinutes: item.estimated_wait_minutes,
            reporterName: item.reporter_name,
            timestamp: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch fallback to local state', err);
      }
    }

    return this.localReports.filter(r => r.pandalId === pandalId);
  }

  async submitPhoto(photo: Omit<PhotoFeedItem, 'id' | 'pranams' | 'createdAt'>): Promise<PhotoFeedItem> {
    const newItem: PhotoFeedItem = {
      ...photo,
      id: 'photo-' + Date.now(),
      pranams: 1,
      createdAt: 'Just now',
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('photos').insert([{
          pandal_id: photo.pandalId,
          pandal_name: photo.pandalName,
          user_name: photo.userName,
          image_url: photo.imageUrl,
          caption: photo.caption,
        }]);
      } catch (err) {
        console.warn('Supabase photo insert fallback to local state', err);
      }
    }

    this.localPhotos.unshift(newItem);
    return newItem;
  }

  async getPhotoFeed(): Promise<PhotoFeedItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            pandalId: item.pandal_id,
            pandalName: item.pandal_name,
            userName: item.user_name,
            imageUrl: item.image_url,
            caption: item.caption,
            pranams: item.pranams || 1,
            createdAt: 'Recent',
          }));
        }
      } catch (err) {
        console.warn('Supabase photo feed fallback to local state', err);
      }
    }

    return this.localPhotos;
  }

  incrementPranam(photoId: string): number {
    const photo = this.localPhotos.find(p => p.id === photoId);
    if (photo) {
      photo.pranams += 1;
      return photo.pranams;
    }
    return 1;
  }
}

export const pandalService = new PandalService();
