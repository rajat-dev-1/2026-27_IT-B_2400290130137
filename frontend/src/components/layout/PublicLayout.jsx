import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-ink flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full pt-20">
        <Outlet />
      </main>
    </div>
  );
}
