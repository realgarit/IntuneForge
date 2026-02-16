import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { PackageProvider, usePackage } from '@/contexts/PackageContext';
import { syncDetectionRulesWithVersion } from '@/lib/package-config';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AppCatalog } from '@/components/AppCatalog';
import { MyPackages } from '@/components/MyPackages';
import { PackageEditor } from '@/components/PackageEditor';
import { LinkHealth } from '@/components/LinkHealth';
import { LogViewer } from '@/components/LogViewer';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { CatalogApp } from '@/lib/app-catalog';

export type View = 'dashboard' | 'catalog' | 'packages' | 'editor' | 'settings' | 'link-health';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { setCurrentConfig, createNewConfig, setSelectedFile } = usePackage();

  const handleCatalogSelect = (app: CatalogApp, file: File) => {
    // Initialize a new config from the catalog app
    const newConfig = createNewConfig();
    setSelectedFile(file);

    setCurrentConfig({
      ...newConfig,
      name: app.name,
      displayName: app.name,
      publisher: app.publisher,
      version: app.version,
      description: app.description,
      packageType: app.filename.toLowerCase().endsWith('.msi') ? 'MSI' : 'EXE',
      sourceType: 'url',
      sourceUrl: app.downloadUrl,
      setupFileName: app.filename,
      iconUrl: app.iconUrl,
      installCommandLine: app.installCommand,
      uninstallCommandLine: app.uninstallCommand,
      detectionRules: syncDetectionRulesWithVersion(app.detectionRules || [], app.version),
      updatedAt: new Date().toISOString(),
    });

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
        return <PackageEditor onComplete={() => setCurrentView('packages')} />;
      case 'link-health':
        return <LinkHealth />;
      case 'settings':
        return <Dashboard onNavigate={setCurrentView} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-8 mb-10">
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-10rem)]">
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            settingsOpen={settingsOpen}
            onSettingsOpenChange={setSettingsOpen}
          />
          <div className="flex-1 flex flex-col">
            {renderView()}
          </div>
        </div>
      </main>

      <LogViewer />

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>
          IntuneForge v1.3.0 • Open Source Win32 Packager •{' '}
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
