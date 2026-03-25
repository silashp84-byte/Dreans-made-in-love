import { db, auth, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { DreamEntry, SimulatedUser } from '../../types';

const DREAMS_COLLECTION = 'dreams';
const USERS_PUBLIC_COLLECTION = 'users_public';
const USERS_PRIVATE_COLLECTION = 'users_private';
const FOLLOWS_COLLECTION = 'follows';

export const saveDreamEntryToFirestore = async (entry: DreamEntry) => {
  if (!auth.currentUser) return;
  const path = `${DREAMS_COLLECTION}/${entry.id}`;
  try {
    await setDoc(doc(db, DREAMS_COLLECTION, entry.id), {
      ...entry,
      authorUid: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || 'Anonymous',
      isPublic: entry.isPublic ?? false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteDreamEntryFromFirestore = async (id: string) => {
  const path = `${DREAMS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, DREAMS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToUserDreams = (userId: string, callback: (entries: DreamEntry[]) => void) => {
  const q = query(collection(db, DREAMS_COLLECTION), where('authorUid', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => doc.data() as DreamEntry);
    callback(entries.sort((a, b) => b.timestamp - a.timestamp));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, DREAMS_COLLECTION);
  });
};

export const subscribeToPublicDreams = (callback: (entries: DreamEntry[]) => void) => {
  const q = query(collection(db, DREAMS_COLLECTION), where('isPublic', '==', true));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => doc.data() as DreamEntry);
    callback(entries.sort((a, b) => b.timestamp - a.timestamp));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, DREAMS_COLLECTION);
  });
};

export const toggleFollowInFirestore = async (followerUid: string, followingUid: string, isFollowing: boolean) => {
  const followId = `${followerUid}_${followingUid}`;
  const path = `${FOLLOWS_COLLECTION}/${followId}`;
  try {
    if (isFollowing) {
      await deleteDoc(doc(db, FOLLOWS_COLLECTION, followId));
    } else {
      await setDoc(doc(db, FOLLOWS_COLLECTION, followId), {
        followerUid,
        followingUid,
        createdAt: Date.now(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const subscribeToFollowedUsers = (followerUid: string, callback: (followedUserIds: Set<string>) => void) => {
  const q = query(collection(db, FOLLOWS_COLLECTION), where('followerUid', '==', followerUid));
  return onSnapshot(q, (snapshot) => {
    const followedIds = new Set(snapshot.docs.map(doc => doc.data().followingUid as string)) as Set<string>;
    callback(followedIds);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, FOLLOWS_COLLECTION);
  });
};

export const syncUserProfile = async (user: any) => {
  if (!user) return;
  const publicPath = `${USERS_PUBLIC_COLLECTION}/${user.uid}`;
  const privatePath = `${USERS_PRIVATE_COLLECTION}/${user.uid}`;
  
  try {
    const publicDoc = await getDoc(doc(db, USERS_PUBLIC_COLLECTION, user.uid));
    if (!publicDoc.exists()) {
      await setDoc(doc(db, USERS_PUBLIC_COLLECTION, user.uid), {
        uid: user.uid,
        username: user.displayName || 'Dream Weaver',
        avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`,
        bio: 'Dreaming of a better world.',
        createdAt: new Date().toISOString(),
      });
    }

    const privateDoc = await getDoc(doc(db, USERS_PRIVATE_COLLECTION, user.uid));
    if (!privateDoc.exists()) {
      await setDoc(doc(db, USERS_PRIVATE_COLLECTION, user.uid), {
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
        role: 'user',
      });
    } else {
      await updateDoc(doc(db, USERS_PRIVATE_COLLECTION, user.uid), {
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, publicPath);
  }
};
