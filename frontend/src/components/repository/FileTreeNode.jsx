import { useState, useEffect } from 'react';
import { Folder, FolderOpen, FileCode2, FileJson, FileText, File } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function FileTreeNode({ node, level, selectedFile, onSelectFile }) {
  const shouldExpandInitially =
    node.name === 'src' ||
    (selectedFile && selectedFile.path.startsWith(node.path + '/'));
  const [isExpanded, setIsExpanded] = useState(shouldExpandInitially);

  useEffect(() => {
    if (selectedFile && selectedFile.path.startsWith(node.path + '/')) {
      setIsExpanded(true);
    }
  }, [selectedFile, node.path]);

  const isSelected = selectedFile && selectedFile.path === node.path;
  const paddingLeft = level * 12 + 8;

  const handleClick = () => {
    if (node.isFile) {
      onSelectFile(node.data);
    } else {
      setIsExpanded(prev => !prev);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    if (!node.isFile) {
      if (e.key === 'ArrowRight' && !isExpanded) setIsExpanded(true);
      if (e.key === 'ArrowLeft' && isExpanded) setIsExpanded(false);
    }
  };

  const getFileIcon = (name) => {
    if (/\.(js|ts|jsx|tsx)$/.test(name)) return FileCode2;
    if (/\.json$/.test(name)) return FileJson;
    if (/\.md$/.test(name)) return FileText;
    return File;
  };

  const Icon = node.isFile
    ? getFileIcon(node.name)
    : isExpanded
      ? FolderOpen
      : Folder;

  const getHealthColor = (score) => {
    if (score === undefined || score === null) return 'bg-muted';
    if (score >= 80) return 'bg-primary';
    if (score >= 70) return 'bg-warning';
    if (score >= 50) return 'bg-high';
    return 'bg-critical';
  };

  const getHealthLabel = (score) => {
    if (score === undefined || score === null) return 'No health data';
    if (score >= 80) return `Healthy (${score})`;
    if (score >= 70) return `Needs review (${score})`;
    if (score >= 50) return `High risk (${score})`;
    return `Critical (${score})`;
  };

  const healthColor = node.isFile ? getHealthColor(node.data?.healthScore) : '';
  const healthLabel = node.isFile ? getHealthLabel(node.data?.healthScore) : '';

  return (
    <div role="treeitem" aria-selected={isSelected} className="flex flex-col w-full">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center w-full py-1.5 px-2 hover:bg-moss-surface text-left group transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          isSelected ? 'bg-primary-soft text-primary' : 'text-sage hover:text-ivory'
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        aria-expanded={!node.isFile ? isExpanded : undefined}
        aria-current={isSelected ? 'page' : undefined}
        title={node.path}
        aria-label={
          node.isFile
            ? `${node.name}${healthLabel ? `, ${healthLabel}` : ''}`
            : `${node.name} folder, ${isExpanded ? 'expanded' : 'collapsed'}`
        }
      >
        <Icon
          className={cn(
            'w-4 h-4 shrink-0 mr-2 opacity-70 group-hover:opacity-100 transition-opacity',
            isSelected ? 'text-primary opacity-100' : node.isFile ? 'text-muted' : 'text-sage'
          )}
          aria-hidden="true"
        />
        <span className="truncate text-sm font-medium mr-2 flex-1">{node.name}</span>

        {node.isFile && (
          <div
            className={cn('w-1.5 h-1.5 rounded-full shrink-0', healthColor)}
            aria-hidden="true"
            title={healthLabel}
          />
        )}
      </button>

      {!node.isFile && isExpanded && node.children && (
        <div
          role="group"
          aria-label={`${node.name} contents`}
          className="flex flex-col w-full motion-safe:animate-in motion-safe:slide-in-from-top-1 motion-safe:fade-in duration-150"
        >
          {node.children.map((child, i) => (
            <FileTreeNode
              key={`${child.path}-${i}`}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
