import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Member, Session, Visitor } from '../types';
import { initialMembers, initialSessions, initialVisitors } from '../data';

// Helper to seed Firestore if empty, prioritizing user's custom localStorage data to prevent data loss
export async function seedFirestoreIfEmpty() {
  try {
    // 1. Check if we have already run the migration
    const alreadyMigrated = localStorage.getItem('masonic_temple_migrated_to_firebase');
    
    // 2. Retrieve local storage data (user's real customized data)
    const localMembersStr = localStorage.getItem('lodge_members');
    const localSessionsStr = localStorage.getItem('lodge_sessions');
    const localVisitorsStr = localStorage.getItem('lodge_visitors');
    
    let localMembers: Member[] = [];
    let localSessions: Session[] = [];
    let localVisitors: Visitor[] = [];
    
    if (localMembersStr) {
      try {
        localMembers = JSON.parse(localMembersStr);
      } catch (e) {
        console.error("Error parsing local members for seeding", e);
      }
    }
    if (localSessionsStr) {
      try {
        localSessions = JSON.parse(localSessionsStr);
      } catch (e) {
        console.error("Error parsing local sessions for seeding", e);
      }
    }
    if (localVisitorsStr) {
      try {
        localVisitors = JSON.parse(localVisitorsStr);
      } catch (e) {
        console.error("Error parsing local visitors for seeding", e);
      }
    }

    // 3. SEED OR MIGRATE MEMBERS
    const membersSnap = await getDocs(collection(db, 'members'));
    if (membersSnap.empty) {
      console.log('Seeding members to Firestore...');
      const membersToSeed = localMembers.length > 0 ? localMembers : initialMembers;
      for (const m of membersToSeed) {
        await setDoc(doc(db, 'members', m.id), m);
      }
    } else if (localMembers.length > 0 && !alreadyMigrated) {
      console.log('Migrating local storage members to Firestore...');
      for (const lm of localMembers) {
        const q = query(collection(db, 'members'), where('email', '==', lm.email.trim().toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const docSnap = querySnap.docs[0];
          const existing = docSnap.data() as Member;
          // Merge local customized fields on top of existing Firestore data (to keep the firebase UID / other fields intact)
          const merged = { ...existing, ...lm, id: docSnap.id };
          await setDoc(doc(db, 'members', docSnap.id), merged);
        } else {
          await setDoc(doc(db, 'members', lm.id), lm);
        }
      }
    }

    // 4. SEED OR MIGRATE SESSIONS
    const sessionsSnap = await getDocs(collection(db, 'sessions'));
    if (sessionsSnap.empty) {
      console.log('Seeding sessions to Firestore...');
      const sessionsToSeed = localSessions.length > 0 ? localSessions : initialSessions;
      for (const s of sessionsToSeed) {
        await setDoc(doc(db, 'sessions', s.id), s);
      }
    } else if (localSessions.length > 0 && !alreadyMigrated) {
      console.log('Migrating local storage sessions to Firestore...');
      for (const ls of localSessions) {
        await setDoc(doc(db, 'sessions', ls.id), ls);
      }
    }

    // 5. SEED OR MIGRATE VISITORS
    const visitorsSnap = await getDocs(collection(db, 'visitors'));
    if (visitorsSnap.empty) {
      console.log('Seeding visitors to Firestore...');
      const visitorsToSeed = localVisitors.length > 0 ? localVisitors : initialVisitors;
      for (const v of visitorsToSeed) {
        await setDoc(doc(db, 'visitors', v.id), v);
      }
    } else if (localVisitors.length > 0 && !alreadyMigrated) {
      console.log('Migrating local storage visitors to Firestore...');
      for (const lv of localVisitors) {
        await setDoc(doc(db, 'visitors', lv.id), lv);
      }
    }

    // Mark as migrated to prevent repeating heavy queries on subsequent reloads
    if (localMembers.length > 0 || localSessions.length > 0 || localVisitors.length > 0) {
      localStorage.setItem('masonic_temple_migrated_to_firebase', 'true');
      console.log('Local storage successfully synchronized with Firebase.');
    }
  } catch (error) {
    console.error('Error seeding/migrating Firestore: ', error);
  }
}

// Set up real-time listener for a collection, ensuring IDs are synchronized properly
export function subscribeToCollection<T>(
  collectionName: string, 
  onUpdate: (data: T[]) => void,
  onError?: (err: any) => void
) {
  const q = collection(db, collectionName);
  return onSnapshot(q, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((doc) => {
      // Prioritize doc.id to keep key references stable in React components
      items.push({ id: doc.id, ...doc.data() } as T);
    });
    onUpdate(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, collectionName);
    if (onError) onError(error);
  });
}

// Log in user with seamless Firebase Auth automatic registration for pre-seeded members
export async function loginWithFirebase(email: string, password: string): Promise<User> {
  let cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === 'vm@loge.com') {
    cleanEmail = 'gaudin.bruno974@gmail.com';
  }

  try {
    // 1. Try to sign in with Firebase Auth directly
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return userCredential.user;
  } catch (authError: any) {
    console.log('Direct auth failed, checking Firestore for pre-seeded member migration...', authError.code);
    
    // 2. Query Firestore 'members' collection to see if a member matches this email
    let matchedMember: Member | null = null;
    let originalDocId: string | null = null;
    
    try {
      const q = query(collection(db, 'members'), where('email', '==', cleanEmail));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        matchedMember = docSnap.data() as Member;
        originalDocId = docSnap.id;
      }
    } catch (fsError) {
      console.error('Error querying members in Firestore during login:', fsError);
    }

    // 3. If matched and the password is correct, register them in Firebase Auth
    if (matchedMember && matchedMember.password === password) {
      try {
        console.log(`Migrating pre-seeded member ${cleanEmail} to Firebase Auth...`);
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const newUser = userCredential.user;

        // Create new member doc with uid as key
        const migratedMember: Member = {
          ...matchedMember,
          id: newUser.uid,
          loginId: cleanEmail
        };

        // Save to new path in Firestore
        await setDoc(doc(db, 'members', newUser.uid), migratedMember);

        // Delete old document if it was a different ID (e.g. m1, m2...)
        if (originalDocId && originalDocId !== newUser.uid) {
          await deleteDoc(doc(db, 'members', originalDocId));
        }

        return newUser;
      } catch (regError) {
        console.error('Error migrating user to Firebase Auth:', regError);
        throw regError;
      }
    }

    // If no match found or password incorrect, throw the original authentication error
    throw authError;
  }
}

// Sign out
export async function logoutFromFirebase() {
  await signOut(auth);
}

// Member Firestore Operations
export async function addMemberToFirestore(member: Member) {
  try {
    // Save to Firestore. Since this is added by an admin, the ID is standard.
    // If they log in later, they will be migrated to auth.uid.
    await setDoc(doc(db, 'members', member.id), member);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `members/${member.id}`);
  }
}

export async function updateMemberInFirestore(member: Member) {
  try {
    await setDoc(doc(db, 'members', member.id), member);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `members/${member.id}`);
  }
}

export async function deleteMemberFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'members', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `members/${id}`);
  }
}

// Session Firestore Operations
export async function addSessionToFirestore(session: Session) {
  try {
    await setDoc(doc(db, 'sessions', session.id), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `sessions/${session.id}`);
  }
}

export async function updateSessionInFirestore(session: Session) {
  try {
    await setDoc(doc(db, 'sessions', session.id), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `sessions/${session.id}`);
  }
}

export async function deleteSessionFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'sessions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `sessions/${id}`);
  }
}

// Visitor Firestore Operations
export async function addVisitorToFirestore(visitor: Visitor) {
  try {
    await setDoc(doc(db, 'visitors', visitor.id), visitor);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `visitors/${visitor.id}`);
  }
}

export async function updateVisitorInFirestore(visitor: Visitor) {
  try {
    await setDoc(doc(db, 'visitors', visitor.id), visitor);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `visitors/${visitor.id}`);
  }
}

export async function deleteVisitorFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'visitors', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `visitors/${id}`);
  }
}

// Full initialization and account seeding for Firebase Auth + Firestore
export async function initializeAllAccountsAndDatabase(
  onProgress: (status: string, progress: number) => void
) {
  try {
    onProgress("Préparation de l'initialisation du Temple...", 5);

    // Prioritize user's existing custom data from localStorage
    const localMembersStr = localStorage.getItem('lodge_members');
    const localSessionsStr = localStorage.getItem('lodge_sessions');
    const localVisitorsStr = localStorage.getItem('lodge_visitors');

    let sourceMembers = initialMembers;
    let sourceSessions = initialSessions;
    let sourceVisitors = initialVisitors;

    if (localMembersStr) {
      try {
        const parsed = JSON.parse(localMembersStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourceMembers = parsed;
          console.log("Using customized members from localStorage for account seeding.");
        }
      } catch (e) {
        console.error("Error parsing local members for initialization", e);
      }
    }
    if (localSessionsStr) {
      try {
        const parsed = JSON.parse(localSessionsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourceSessions = parsed;
          console.log("Using customized sessions from localStorage for account seeding.");
        }
      } catch (e) {
        console.error("Error parsing local sessions for initialization", e);
      }
    }
    if (localVisitorsStr) {
      try {
        const parsed = JSON.parse(localVisitorsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourceVisitors = parsed;
          console.log("Using customized visitors from localStorage for account seeding.");
        }
      } catch (e) {
        console.error("Error parsing local visitors for initialization", e);
      }
    }
    
    // 1. Seed initial sessions
    onProgress("Enregistrement des tenues initiales (sessions) dans Firestore...", 15);
    for (const s of sourceSessions) {
      await setDoc(doc(db, 'sessions', s.id), s);
    }
    
    // 2. Seed initial visitors
    onProgress("Enregistrement des visiteurs initiaux dans Firestore...", 25);
    for (const v of sourceVisitors) {
      await setDoc(doc(db, 'visitors', v.id), v);
    }

    // 3. Register and migrate each member
    let count = 0;
    const total = sourceMembers.length;

    for (const m of sourceMembers) {
      count++;
      const pct = Math.round(30 + (count / total) * 65);
      onProgress(`Création du compte pour ${m.firstName} ${m.lastName} (${m.email})...`, pct);

      const cleanEmail = m.email.trim().toLowerCase();

      try {
        // Create user in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, m.password || 'password123');
        const user = userCredential.user;

        // Save to Firestore with their real Auth UID as the ID
        const finalMember: Member = {
          ...m,
          id: user.uid,
          loginId: cleanEmail
        };
        await setDoc(doc(db, 'members', user.uid), finalMember);
        
        // Also sign out so we can create the next one
        await signOut(auth);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          onProgress(`${m.firstName} ${m.lastName} est déjà enregistré dans Auth. Synchronisation Firestore...`, pct);
          const q = query(collection(db, 'members'), where('email', '==', cleanEmail));
          const querySnap = await getDocs(q);
          if (querySnap.empty) {
            await setDoc(doc(db, 'members', m.id), m);
          } else {
            const docSnap = querySnap.docs[0];
            const existing = docSnap.data() as Member;
            const updated = { ...existing, ...m, id: docSnap.id };
            await setDoc(doc(db, 'members', docSnap.id), updated);
          }
        } else {
          console.error(`Error for ${m.firstName}:`, authErr);
          // Fallback write
          await setDoc(doc(db, 'members', m.id), m);
        }
      }
      
      // Delay to let auth settle and prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Mark as migrated so startup doesn't overwrite it again
    localStorage.setItem('masonic_temple_migrated_to_firebase', 'true');

    onProgress("Initialisation complétée avec succès ! Le Temple et les comptes sont opérationnels.", 100);
  } catch (err: any) {
    console.error("Initialization error:", err);
    throw err;
  }
}

// Get the latest session chrono (counter of regular sessions) from Firebase (config/settings document)
export async function getSessionChronoFromFirestore(): Promise<number> {
  try {
    const docRef = doc(db, 'config', 'settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().regularSessionChrono ?? 2;
    } else {
      // Initialize with 2 so that the next session is the 3rd (2 + 1 = 3)
      await setDoc(docRef, { regularSessionChrono: 2 });
      return 2;
    }
  } catch (error) {
    console.error("Error fetching session chrono:", error);
    return 2; // Fallback to 2 so next is 3
  }
}

// Increment session chrono in Firebase
export async function incrementSessionChronoInFirestore(): Promise<number> {
  try {
    const docRef = doc(db, 'config', 'settings');
    const docSnap = await getDoc(docRef);
    let newVal = 3;
    if (docSnap.exists()) {
      const current = docSnap.data().regularSessionChrono ?? 2;
      newVal = current + 1;
    }
    await setDoc(docRef, { regularSessionChrono: newVal }, { merge: true });
    return newVal;
  } catch (error) {
    console.error("Error incrementing session chrono:", error);
    return 3; // Fallback
  }
}


