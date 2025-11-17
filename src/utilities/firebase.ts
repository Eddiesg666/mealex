import { useCallback, useEffect, useState } from 'react';
import { type Profile } from '../types/Profile.ts';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, push, ref, update } from 'firebase/database';
import { flushSync } from 'react-dom';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type NextOrObserver, type User} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const database = getDatabase(firebase);

export const useDataQuery = (path: string): [Record<string, Profile> | undefined, boolean, Error | undefined] => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setData(undefined);
    setLoading(true);
    setError(undefined);
    return onValue(ref(database, path), (snapshot) => {
        setData( snapshot.val() );
        setLoading(false);
      }, (error) => {
        setError(error);
        setLoading(false);
      }
    );
  }, [ path ]);

  return [ data, loading, error ];
};

export const timestampMessage = (message: string) => (
  `${new Date().toLocaleString()}: ${message}`
);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in, photo:", user.photoURL);
    if (!user.email?.endsWith('@u.northwestern.edu')) {
      console.log("Invalid email domain detected, signing out");
      await signOut(auth);
    }
  } else {
    console.log("No user logged in");
  }
});

// store a value under a path
export const useDataUpdate = (path: string): [(value:object) => void, string | undefined, Error | undefined] => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<Error>();
  const updateData = useCallback((value: object) => {
    update(ref(database, path), value)
    .then(() => { 
      setMessage(timestampMessage('Update succeeded'));
    })
    .catch((error: Error) => {
      setMessage(timestampMessage('Update failed'));
      setError(error);
    })
  }, [path]);

  return [updateData, message, error];
};

// add a value under a Firebase-generated key
export const useDataPush = (path: string): [(value:object) => void, string | undefined, Error | undefined] => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<Error>();
  const pushData = useCallback((value: object) => {
    push(ref(database, path), value)
    .then(() => { 
      setMessage(timestampMessage('Update succeeded'));
    })
    .catch((error: Error) => {
      setMessage(timestampMessage('Update failed'));
      setError(error);
    })
  }, [path]);

  return [pushData, message, error];
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const user = result.user;
    
    if (!user.email?.endsWith('@u.northwestern.edu')) {
      await signOut(auth);
      alert('Only Northwestern University (@u.northwestern.edu) emails are allowed to sign in.');
      throw new Error('Invalid email domain');
    }
    
    return result;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

const firebaseSignOut = () => signOut(auth);

export { firebaseSignOut as signOut };

export interface AuthState {
  user: User | null,
  isAuthenticated: boolean,
  isInitialLoading: boolean
}

export const addAuthStateListener = (fn: NextOrObserver<User>) => (
  onAuthStateChanged(auth, fn)
);

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState(auth.currentUser)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const isAuthenticated = !!user;

  useEffect(() => addAuthStateListener((user: User | null) => {
      flushSync(() => {
        setUser(user);
        setIsInitialLoading(false);
      })
    }), [])

  return {user, isAuthenticated, isInitialLoading };
};

export const useCheckFirstTimeUser = (userId: string): boolean => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [data] = useDataQuery(`/profiles/${userId}`);

  useEffect(() => {
    if (!userId) {
      setIsFirstTime(true);
      return;
    }

    if (data === null) {
      setIsFirstTime(true);
    } else if (data && data[userId]) {
      setIsFirstTime(false);
    }
  }, [userId, data]);

  return isFirstTime;
};