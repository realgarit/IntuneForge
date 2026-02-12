import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { PackageProvider } from '@/contexts/PackageContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AppCatalog } from '@/components/AppCatalog';
import { MyPackages } from '@/components/MyPackages';
import { PackageEditor } from '@/components/PackageEditor';
import { LogViewer } from '@/components/LogViewer';
import { TooltipProvider } from '@/components/ui/tooltip';

export type View = 'dashboard' | 'catalog' | 'packages' | 'editor' | 'settings';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // If a config is selected and we are in dashboard, we might want to stay there or switch to editor.
  // For now, let's just let the user navigate.

  const handleCatalogSelect = () => {
    setCurrentView('editor');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'catalog':
        return <AppCatalog onSelect={handleCatalogSelect} />;
      case 'packages':
        return <MyPackages onEdit={() => setCurrentView('editor')} />;
      case 'editor':
        return <PackageEditor />;
      case 'settings':
        return <Dashboard onNavigate={setCurrentView} />; // Fallback or dedicated view
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
      />

      <main className="flex-1 container mx-auto px-6 py-8 mb-10">
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-10rem)]">
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => {
              if (view === 'settings') {
                setSettingsOpen(true);
              } else {
                setCurrentView(view);
              }
            }}
          />
          <div className="flex-1 flex flex-col">
            {renderView()}
          </div>
        </div>
      </main>

      <LogViewer />

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>
          IntuneForge v1.2.0 • Open Source Win32 Packager •{' '}
          <a
            href="https://github.com/realgarit/intuneforge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PackageProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </PackageProvider>
    </AuthProvider>
  );
}

export default App;
