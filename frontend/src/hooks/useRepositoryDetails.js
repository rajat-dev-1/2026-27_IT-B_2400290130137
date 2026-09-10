import { useState, useEffect, useCallback, useMemo } from 'react';
import { repositoryApi } from '../services/repositoryApi';
import { useAuth } from './useAuth';

export function useRepositoryDetails(repoId) {
  const { isAuthenticated } = useAuth();
  
  const [repository, setRepository] = useState(null);
  const [latestScan, setLatestScan] = useState(null);
  const [files, setFiles] = useState([]);
  const [issues, setIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDetails = useCallback(async (isRefresh = false) => {
    if (!repoId || !isAuthenticated) return;
    
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setDetailError(null);

    try {
      // 1. Fetch Repository Summary and Latest Scan first
      const [repoData, scanData] = await Promise.all([
        repositoryApi.getRepository(repoId),
        repositoryApi.getLatestScan(repoId).catch(() => null)
      ]);
      
      setRepository(repoData);
      setLatestScan(scanData);

      // 2. Only fetch files, issues, and recommendations if a completed scan exists
      if (scanData && scanData.status === 'completed') {
        try {
          const [filesData, issuesData, recsData] = await Promise.all([
            repositoryApi.getFiles(repoId).catch(() => []),
            repositoryApi.getIssues(repoId).catch(() => []),
            repositoryApi.getRecommendations(repoId).catch(() => [])
          ]);
          setFiles(Array.isArray(filesData) ? filesData : []);
          setIssues(Array.isArray(issuesData) ? issuesData : []);
          setRecommendations(Array.isArray(recsData) ? recsData : []);
        } catch (detailErr) {
          console.error("Failed to fetch detail data:", detailErr);
          setDetailError("We could not load all analysis details.");
        }
      } else {
        setFiles([]);
        setIssues([]);
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Failed to fetch repository:", err);
      setError("This repository could not be loaded, or you no longer have access to it.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [repoId, isAuthenticated]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const refresh = useCallback(() => {
    fetchDetails(true);
  }, [fetchDetails]);

  // Transform flat file paths into a nested tree structure
  const fileTree = useMemo(() => {
    if (!files || files.length === 0) return [];

    const root = [];
    const map = {};

    files.forEach(file => {
      const parts = file.path.split('/');
      let currentLevel = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        let existingNode = currentLevel.find(node => node.name === part);

        if (!existingNode) {
          existingNode = {
            name: part,
            path: currentPath,
            isFile,
            children: isFile ? undefined : [],
            data: isFile ? file : null
          };
          currentLevel.push(existingNode);
        }
        
        if (!isFile) {
          currentLevel = existingNode.children;
        }
      });
    });

    // Optional: Sort folders first, then files
    const sortTree = (nodes) => {
      nodes.sort((a, b) => {
        if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
        return a.isFile ? 1 : -1;
      });
      nodes.forEach(node => {
        if (node.children) sortTree(node.children);
      });
    };
    sortTree(root);

    return root;
  }, [files]);

  return {
    repository,
    latestScan,
    files,
    fileTree,
    issues,
    recommendations,
    isLoading,
    isRefreshing,
    error,
    detailError,
    refresh,
    selectedFile,
    setSelectedFile
  };
}
