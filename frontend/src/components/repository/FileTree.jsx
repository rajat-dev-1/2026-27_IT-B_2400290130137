import FileTreeNode from './FileTreeNode';

export default function FileTree({ nodes, selectedFile, onSelectFile }) {
  return (
    <div
      role="tree"
      aria-label="Repository file explorer"
      className="flex flex-col select-none py-1 w-full overflow-x-hidden"
    >
      {nodes.map((node, i) => (
        <FileTreeNode
          key={`${node.path}-${i}`}
          node={node}
          level={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
