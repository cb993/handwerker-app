import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB } from 'idb';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [db, setDb] = useState(null);
  const [syncQueue, setSyncQueue] = useState([]);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB('HandwerkerDB', 1, {
          upgrade(db) {
            // Projects store
            if (!db.objectStoreNames.contains('projects')) {
              const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
              projectStore.createIndex('status', 'status');
              projectStore.createIndex('createdAt', 'createdAt');
            }

            // Construction diary entries
            if (!db.objectStoreNames.contains('diaryEntries')) {
              const diaryStore = db.createObjectStore('diaryEntries', { keyPath: 'id' });
              diaryStore.createIndex('projectId', 'projectId');
              diaryStore.createIndex('date', 'date');
            }

            // Time tracking entries
            if (!db.objectStoreNames.contains('timeEntries')) {
              const timeStore = db.createObjectStore('timeEntries', { keyPath: 'id' });
              timeStore.createIndex('projectId', 'projectId');
              timeStore.createIndex('employeeId', 'employeeId');
              timeStore.createIndex('date', 'date');
            }

            // Employees
            if (!db.objectStoreNames.contains('employees')) {
              const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
              employeeStore.createIndex('name', 'name');
            }

            // Forms
            if (!db.objectStoreNames.contains('forms')) {
              const formStore = db.createObjectStore('forms', { keyPath: 'id' });
              formStore.createIndex('projectId', 'projectId');
              formStore.createIndex('type', 'type');
            }

            // Photos
            if (!db.objectStoreNames.contains('photos')) {
              const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
              photoStore.createIndex('diaryEntryId', 'diaryEntryId');
              photoStore.createIndex('formId', 'formId');
            }

            // Sync queue for offline actions
            if (!db.objectStoreNames.contains('syncQueue')) {
              db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
          }
        });
        setDb(database);
        console.log('IndexedDB initialized successfully');
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };

    initDB();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App is online');
      // Trigger sync when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Generic CRUD operations
  const saveData = async (storeName, data) => {
    if (!db) return null;
    
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      // Add timestamp if not present
      if (!data.createdAt) {
        data.createdAt = new Date().toISOString();
      }
      data.updatedAt = new Date().toISOString();
      
      const result = await store.put(data);
      await tx.complete;
      
      console.log(`Data saved to ${storeName}:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to save data to ${storeName}:`, error);
      throw error;
    }
  };

  const getData = async (storeName, id = null) => {
    if (!db) return null;
    
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      
      if (id) {
        const result = await store.get(id);
        return result;
      } else {
        const result = await store.getAll();
        return result;
      }
    } catch (error) {
      console.error(`Failed to get data from ${storeName}:`, error);
      throw error;
    }
  };

  const queryData = async (storeName, indexName, value) => {
    if (!db) return [];
    
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const result = await index.getAll(value);
      return result;
    } catch (error) {
      console.error(`Failed to query data from ${storeName}:`, error);
      throw error;
    }
  };

  const deleteData = async (storeName, id) => {
    if (!db) return;
    
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.delete(id);
      await tx.complete;
      console.log(`Data deleted from ${storeName}:`, id);
    } catch (error) {
      console.error(`Failed to delete data from ${storeName}:`, error);
      throw error;
    }
  };

  // Sync queue management
  const addToSyncQueue = async (action) => {
    if (!db) return;
    
    try {
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      
      const syncItem = {
        action,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      await store.add(syncItem);
      await tx.complete;
      
      console.log('Added to sync queue:', syncItem);
      
      // Try to sync immediately if online
      if (isOnline) {
        syncOfflineData();
      }
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline || !db) return;
    
    try {
      const pendingItems = await getData('syncQueue');
      console.log(`Syncing ${pendingItems.length} offline items...`);
      
      for (const item of pendingItems) {
        try {
          // Execute the action (this would be an API call in a real app)
          console.log('Syncing item:', item.action);
          
          // Remove from queue after successful sync
          await deleteData('syncQueue', item.id);
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
          // Keep in queue for retry
        }
      }
      
      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Photo handling
  const savePhoto = async (photoData, associatedId, type = 'diary') => {
    const photo = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: photoData, // Base64 or blob
      type,
      associatedId,
      createdAt: new Date().toISOString()
    };
    
    return await saveData('photos', photo);
  };

  const getPhotos = async (associatedId, type = 'diary') => {
    if (!db) return [];
    
    try {
      const tx = db.transaction('photos', 'readonly');
      const store = tx.objectStore('photos');
      const index = store.index(type === 'diary' ? 'diaryEntryId' : 'formId');
      const result = await index.getAll(associatedId);
      return result;
    } catch (error) {
      console.error('Failed to get photos:', error);
      return [];
    }
  };

  const value = {
    isOnline,
    db,
    saveData,
    getData,
    queryData,
    deleteData,
    addToSyncQueue,
    syncOfflineData,
    savePhoto,
    getPhotos,
    syncQueue
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
