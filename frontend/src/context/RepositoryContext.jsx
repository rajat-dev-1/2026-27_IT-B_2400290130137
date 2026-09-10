import { createContext, useState, useEffect, useCallback } from 'react';
import { repositoryApi } from '../services/repositoryApi';
import { useAuth } from '../hooks/useAuth';

export const RepositoryContext = createContext();

export function RepositoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(isAuthenticated);
  const [repositoryError, setRepositoryError] = useState(null);

  const fetchRepositories = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingRepositories(true);
    setRepositoryError(null);
    try {
      const data = await repositoryApi.getRepositories();
      // Ensure data is an array
      const repos = Array.isArray(data) ? data : [];
      setRepositories(repos);
      
      // Auto-select first repo if none selected and repos exist
      if (repos.length > 0) {
         setSelectedRepository(prev => {
            // Keep existing if it's still in the list
            if (prev && repos.find(r => r.id === prev.id)) return prev;
            return repos[0];
         });
      }
    } catch (error) {
      setRepositoryError('We could not load your repositories. Try again.');
      setRepositories([]);
    } finally {
      setIsLoadingRepositories(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRepositories();
    } else {
      setRepositories([]);
      setSelectedRepository(null);
    }
  }, [isAuthenticated, fetchRepositories]);

  const selectRepository = useCallback(async (repositoryOrId) => {
    let repo = typeof repositoryOrId === 'string' 
      ? repositories.find(r => r.id === repositoryOrId) 
      : repositoryOrId;
      
    if (repo) {
      setSelectedRepository(repo);
    } else if (typeof repositoryOrId === 'string') {
      // Attempt to fetch if it's an ID not in our list yet
      try {
        const fetchedRepo = await repositoryApi.getRepository(repositoryOrId);
        setSelectedRepository(fetchedRepo);
      } catch (err) {
        setRepositoryError('This repository could not be loaded.');
      }
    }
  }, [repositories]);

  const refreshSelectedRepository = useCallback(async () => {
    if (!selectedRepository) return;
    try {
      const updated = await repositoryApi.getRepository(selectedRepository.id);
      setSelectedRepository(updated);
    } catch (error) {
      console.error('Failed to refresh selected repository:', error);
    }
  }, [selectedRepository]);

  const value = {
    repositories,
    selectedRepository,
    isLoadingRepositories,
    repositoryError,
    fetchRepositories,
    selectRepository,
    refreshSelectedRepository
  };

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}
