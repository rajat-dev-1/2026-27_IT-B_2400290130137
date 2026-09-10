import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, FileCheck2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Skeleton from '../components/ui/Skeleton';
import { LoadingScreen, EmptyState, ErrorState } from '../components/ui/States';

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const colors = [
    { name: "Ink", var: "--ink", class: "bg-ink", hex: "#101613" },
    { name: "Pine", var: "--pine", class: "bg-pine", hex: "#16231D" },
    { name: "Slate", var: "--slate", class: "bg-slate", hex: "#1B2922" },
    { name: "Moss Surface", var: "--moss-surface", class: "bg-moss-surface", hex: "#23342B" },
    { name: "Border", var: "--border", class: "bg-border", hex: "#385044" },
    { name: "Ivory", var: "--ivory", class: "bg-ivory", hex: "#F1F4ED" },
    { name: "Sage", var: "--sage", class: "bg-sage", hex: "#A8B8AD" },
    { name: "Muted", var: "--muted", class: "bg-muted", hex: "#718477" },
    { name: "Primary", var: "--primary", class: "bg-primary", hex: "#68B984" },
    { name: "Primary Hover", var: "--primary-hover", class: "bg-primary-hover", hex: "#86D39B" },
    { name: "Primary Soft", var: "--primary-soft", class: "bg-primary-soft", hex: "#1E3A2A" },
    { name: "Info", var: "--info", class: "bg-info", hex: "#57A6C7" },
    { name: "AI", var: "--ai", class: "bg-ai", hex: "#C09AE8" },
    { name: "Warning", var: "--warning", class: "bg-warning", hex: "#D6A75C" },
    { name: "High", var: "--high", class: "bg-high", hex: "#D97757" },
    { name: "Critical", var: "--critical", class: "bg-critical", hex: "#D75757" },
  ];

  return (
    <div className="space-y-16 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-ivory mb-2">Design System</h1>
        <p className="text-sage">Internal component preview for CodeHealth AI.</p>
      </div>

      {/* Colors */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">Color Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {colors.map((color) => (
            <div key={color.name} className="flex flex-col">
              <div className={`h-16 w-full rounded-t-md border border-border ${color.class}`} />
              <div className="bg-moss-surface border-x border-b border-border rounded-b-md p-3">
                <div className="text-sm font-medium text-ivory">{color.name}</div>
                <div className="text-xs text-muted font-mono">{color.var}</div>
                <div className="text-xs text-sage font-mono mt-1">{color.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">Typography</h2>
        <div className="space-y-6">
          <div>
            <div className="text-xs text-muted mb-1 font-mono">text-4xl font-bold</div>
            <div className="text-4xl font-bold text-ivory">Repository Health</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 font-mono">text-2xl font-semibold</div>
            <div className="text-2xl font-semibold text-ivory">Analyze codebase</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 font-mono">text-lg font-medium</div>
            <div className="text-lg font-medium text-ivory">Card Title Here</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 font-mono">text-base text-sage</div>
            <div className="text-base text-sage">The quick brown fox jumps over the lazy dog.</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 font-mono">text-sm text-sage</div>
            <div className="text-sm text-sage">A slightly smaller supporting text used for descriptions.</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 font-mono">font-mono text-sm</div>
            <div className="font-mono text-sm text-info bg-moss-surface inline-block px-2 py-1 rounded border border-border">src/components/ui/Button.jsx</div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button leftIcon={FileCheck2}>With Icon</Button>
          <Button variant="secondary" onClick={() => toast.success("Toast generated!")}>Trigger Toast</Button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="high">High</Badge>
          <Badge variant="critical">Critical</Badge>
          <Badge variant="ai">AI Generated</Badge>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <Input label="Normal Input" placeholder="Enter something..." />
          <Input label="With Helper" placeholder="Enter something..." helper="This is a helpful message." />
          <Input label="Error State" placeholder="Enter something..." error="This field is required." defaultValue="Invalid data" />
          <Input label="Disabled" placeholder="Cannot type here..." disabled />
        </div>
      </section>

      {/* Cards & Skeletons */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">Cards & Skeletons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable>
            <h3 className="text-lg font-medium text-ivory mb-2">Hoverable Card</h3>
            <p className="text-sm text-sage">This card changes background color subtly on hover. It uses default md padding.</p>
          </Card>
          <Card padding="lg">
            <h3 className="text-lg font-medium text-ivory mb-4">Skeleton Loading</h3>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </Card>
        </div>
      </section>

      {/* Modals & Dialogs */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">Modals & Dialogs</h2>
        <div className="flex gap-4">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Button onClick={() => setIsConfirmOpen(true)} variant="secondary">Open Confirm Dialog</Button>
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          description="This is a simple modal used for detailed content or forms."
        >
          <div className="mt-4 space-y-4">
            <Input label="Repository Name" placeholder="e.g., codehealth-demo" />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsModalOpen(false)}>Done</Button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog 
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            toast.error("Action executed!");
            setIsConfirmOpen(false);
          }}
          title="Delete Repository?"
          description="This will remove the repository from your workspace. This action cannot be undone."
          variant="danger"
          confirmText="Delete"
        />
      </section>

      {/* Empty States */}
      <section>
        <h2 className="text-xl font-semibold text-ivory mb-6 border-b border-border pb-2">States (Loading, Empty, Error)</h2>
        <div className="space-y-6">
          <div className="border border-border rounded-lg overflow-hidden h-[300px]">
             <LoadingScreen title="Analyzing repository..." description="This might take a few moments." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState 
              icon={FileCheck2}
              title="No issues found"
              description="Your codebase is looking healthy. Run a new scan to double-check."
              action={<Button variant="secondary" size="sm">Run Scan</Button>}
            />
            <ErrorState 
              title="Failed to load data"
              description="There was an error communicating with the server."
              action={<Button variant="secondary" size="sm">Retry</Button>}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
