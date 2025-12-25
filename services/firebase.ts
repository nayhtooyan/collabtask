import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { Task } from '../types';

// REAL FIREBASE CONFIG (coming from .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if config is loaded
console.log('Firebase Config Loaded:', {
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain
});

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_api_key')) {
  console.error('❌ Firebase configuration is missing or invalid! Check your .env file');
  console.error('Current API Key:', firebaseConfig.apiKey ? 'Present but might be placeholder' : 'Missing');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure auth settings
auth.useDeviceLanguage(); // Use browser language for verification emails

// ---------------------- AUTH SERVICES ----------------------

export const registerUser = async (email: string, password: string, username: string) => {
  try {
    console.log('Attempting registration for:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Registration successful, user created:', userCredential.user.uid);

    // Set username for profile
    if (username.trim()) {
      await updateProfile(userCredential.user, { displayName: username });
      console.log('✅ Username set:', username);
    }

    // Send verification email
    await sendEmailVerification(userCredential.user);
    console.log('✅ Verification email sent to:', email);

    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Registration error:', error.code, error.message);
    
    // Rethrow with more user-friendly messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    console.log('Attempting login for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login successful for:', userCredential.user.email);
    
    // IMPORTANT: Reload user to get latest data including emailVerified status
    await userCredential.user.reload();
    
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Login error:', error.code, error.message);
    
    // User-friendly error messages
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ Logout successful');
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    throw error;
  }
};

export const resendVerification = async (user: FirebaseUser) => {
  try {
    await sendEmailVerification(user);
    console.log('✅ Verification email resent to:', user.email);
  } catch (error: any) {
    console.error('❌ Resend verification error:', error);
    throw error;
  }
};

// ---------------------- TASK DATABASE SERVICES ----------------------

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  try {
    console.log('Setting up task subscription for user:', userId);
    
    const q = query(
      collection(db, 'tasks'), 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('📋 Tasks updated, count:', snapshot.docs.length);
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        callback(tasks);
      }, 
      (error) => {
        console.error('❌ Error listening to tasks:', error.code, error.message);
        
        // Check for missing index error
        if (error.code === 'failed-precondition') {
          console.error('⚠️ Missing Firestore index. Please create a composite index for tasks collection.');
        }
        
        // Return empty array on error
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error('❌ Error setting up task subscription:', error);
    // Return a cleanup function that does nothing
    return () => {};
  }
};

export const addTaskToDb = async (task: Omit<Task, 'id'>) => {
  try {
    console.log('Adding task:', task.title);
    
    const taskWithTimestamp = {
      ...task,
      createdAt: task.createdAt || Date.now(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'tasks'), taskWithTimestamp);
    console.log('✅ Task added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding task:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to add tasks. Please make sure you are logged in.');
    }
    
    throw error;
  }
};

export const updateTaskInDb = async (taskId: string, updates: Partial<Task>) => {
  try {
    console.log('Updating task:', taskId);
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Task updated:', taskId);
  } catch (error: any) {
    console.error('❌ Error updating task:', error.code, error.message);
    throw error;
  }
};

export const deleteTaskFromDb = async (taskId: string) => {
  try {
    console.log('Deleting task:', taskId);
    await deleteDoc(doc(db, 'tasks', taskId));
    console.log('✅ Task deleted:', taskId);
  } catch (error: any) {
    console.error('❌ Error deleting task:', error.code, error.message);
    throw error;
  }
};

// Helper function to check Firebase connection
export const checkFirebaseConnection = () => {
  const isConnected = auth.currentUser !== null;
  console.log('Firebase connection check:', isConnected ? 'Connected' : 'Not connected');
  return isConnected;
};