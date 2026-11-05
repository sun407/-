import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ResumeData } from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID (Critical: AI Studio custom DB ID)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Institutional Admin Constants
export const ADMIN_EMAILS = ['sun@suwonrehab.or.kr'];
export const ADMIN_PASSCODE = 'suwon2026'; // 수원시장애인종합복지관 실무자용 마스터 비밀번호

// Connection test as required by Firebase integration guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// 7 days in milliseconds (1 week photo retention policy)
export const PHOTO_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface CloudResumeRecord {
  id: string;
  userId: string;
  title: string;
  applicantName?: string;
  status?: '대기' | '검토중' | '취업연계' | '완료';
  adminNotes?: string;
  resumeData: ResumeData;
  photoUploadedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Check if a photo timestamp is expired (> 7 days).
 */
export function isPhotoExpired(photoUploadedAt?: string | null): boolean {
  if (!photoUploadedAt) return false;
  const uploadTime = new Date(photoUploadedAt).getTime();
  if (isNaN(uploadTime)) return false;
  return Date.now() - uploadTime > PHOTO_RETENTION_MS;
}

/**
 * Check if a user is an authorized administrator.
 */
export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === user.email?.toLowerCase());
}

/**
 * Save or update a resume in Firestore.
 * Automatically enforces 1-week photo retention policy.
 */
export async function saveResumeToFirestore(
  userId: string,
  resumeId: string,
  title: string,
  resumeData: ResumeData,
  existingPhotoUploadedAt?: string | null,
  status: '대기' | '검토중' | '취업연계' | '완료' = '대기',
  adminNotes: string = ''
): Promise<CloudResumeRecord> {
  const path = `resumes/${resumeId}`;
  const now = new Date().toISOString();

  // Handle Photo uploaded timestamp and 1-week automatic expiration
  let photoUploadedAt: string | null = null;
  const clonedData: ResumeData = JSON.parse(JSON.stringify(resumeData));

  if (clonedData.personal.photoUrl) {
    const timestampToCheck = existingPhotoUploadedAt || now;
    if (isPhotoExpired(timestampToCheck)) {
      clonedData.personal.photoUrl = null;
      photoUploadedAt = null;
    } else {
      photoUploadedAt = existingPhotoUploadedAt || now;
    }
  }

  const record: CloudResumeRecord = {
    id: resumeId,
    userId,
    title: title || clonedData.personal.name || '알기 쉬운 이력서',
    applicantName: clonedData.personal.name || '미입력',
    status,
    adminNotes,
    resumeData: clonedData,
    photoUploadedAt,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, 'resumes', resumeId);
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      const prevData = existingSnap.data();
      record.createdAt = prevData.createdAt || now;
      if (!record.adminNotes && prevData.adminNotes) {
        record.adminNotes = prevData.adminNotes;
      }
      if (prevData.status) {
        record.status = status !== '대기' ? status : prevData.status;
      }
    }
    await setDoc(docRef, record);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Submit resume from general access (applicant).
 */
export async function submitApplicantResume(
  resumeData: ResumeData,
  existingPhotoUploadedAt?: string | null
): Promise<CloudResumeRecord> {
  const resumeId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const userId = auth.currentUser ? auth.currentUser.uid : 'applicant_public';
  const title = `${resumeData.personal.name || '신청자'} 님의 이력서`;
  return saveResumeToFirestore(userId, resumeId, title, resumeData, existingPhotoUploadedAt, '대기', '');
}

/**
 * Fetch all resumes for an individual user from Firestore.
 */
export async function fetchUserResumes(userId: string): Promise<{
  resumes: CloudResumeRecord[];
  cleanedPhotosCount: number;
}> {
  const collectionPath = 'resumes';
  try {
    const q = query(
      collection(db, collectionPath),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const resumes: CloudResumeRecord[] = [];
    let cleanedPhotosCount = 0;

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as CloudResumeRecord;
      data.id = docSnap.id;

      if (data.resumeData?.personal?.photoUrl && isPhotoExpired(data.photoUploadedAt)) {
        data.resumeData.personal.photoUrl = null;
        data.photoUploadedAt = null;
        cleanedPhotosCount++;

        try {
          await updateDoc(docSnap.ref, {
            'resumeData.personal.photoUrl': null,
            photoUploadedAt: null,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Failed to persist photo cleanup for doc', docSnap.id, err);
        }
      }

      resumes.push(data);
    }

    resumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return { resumes, cleanedPhotosCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Admin: Fetch ALL resumes across all users and applicants.
 * Automatically inspects and purges expired photos (> 7 days).
 */
export async function fetchAllResumesForAdmin(): Promise<{
  resumes: CloudResumeRecord[];
  cleanedPhotosCount: number;
}> {
  const collectionPath = 'resumes';
  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const resumes: CloudResumeRecord[] = [];
    let cleanedPhotosCount = 0;

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as CloudResumeRecord;
      data.id = docSnap.id;

      // Auto-purge photo older than 1 week
      if (data.resumeData?.personal?.photoUrl && isPhotoExpired(data.photoUploadedAt)) {
        data.resumeData.personal.photoUrl = null;
        data.photoUploadedAt = null;
        cleanedPhotosCount++;

        try {
          await updateDoc(docSnap.ref, {
            'resumeData.personal.photoUrl': null,
            photoUploadedAt: null,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Admin auto photo cleanup failed for doc', docSnap.id, err);
        }
      }

      resumes.push(data);
    }

    resumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return { resumes, cleanedPhotosCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Admin: Update status and consultation notes of a resume.
 */
export async function updateResumeAdminMeta(
  resumeId: string,
  updates: { status?: '대기' | '검토중' | '취업연계' | '완료'; adminNotes?: string }
): Promise<void> {
  const path = `resumes/${resumeId}`;
  try {
    const docRef = doc(db, 'resumes', resumeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a resume from Firestore.
 */
export async function deleteResumeFromFirestore(_userId: string, resumeId: string): Promise<void> {
  const path = `resumes/${resumeId}`;
  try {
    const docRef = doc(db, 'resumes', resumeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Admin: Manually trigger scanning and purging of expired photos (> 1 week) across all resumes.
 */
export async function purgeAllExpiredPhotos(_userId?: string): Promise<number> {
  const { cleanedPhotosCount } = await fetchAllResumesForAdmin();
  return cleanedPhotosCount;
}

export const purgeExpiredPhotosNow = purgeAllExpiredPhotos;

// Auth Helper Functions
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}
