import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './app/router';
import { Providers } from './app/providers';

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <Toaster 
        theme="dark" 
        toastOptions={{
          className: 'bg-moss-surface border-border text-ivory',
        }} 
      />
    </Providers>
  );
}

export default App;
