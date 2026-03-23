import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a media file to Firebase Storage under users/{uid}/media/{pageId}/
 * and returns the permanent download URL.
 */
export async function uploadMedia(uid: string, pageId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `users/${uid}/media/${pageId}/${uniqueName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
