import { AuthProvider } from '@/contexts/AuthContext';
import { PackageProvider } from '@/contexts/PackageContext';
import { usePackage } from '@/contexts/PackageContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { FileUploader } from '@/components/FileUploader';
import { PackageDetails } from '@/components/PackageDetails';
import { InstallCommands } from '@/components/InstallCommands';
import { DetectionRules } from '@/components/DetectionRules';
import { Assignments } from '@/components/Assignments';
import { BuildSection } from '@/components/BuildSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users } from 'lucide-react';

function PackageEditor() {
  const { currentConfig } = usePackage();

  if (!currentConfig) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto">
      <Tabs defaultValue="package" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="package" className="gap-2">
            <Package className="h-4 w-4" />
            Package
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="package" className="mt-6 space-y-6">
          <FileUploader />
          <PackageDetails />
          <InstallCommands />
          <DetectionRules />
          <BuildSection />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6 space-y-6">
          <Assignments />
          <BuildSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
          <Sidebar />
          <PackageEditor />
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <p>
          IntuneForge • Open Source Win32 Packager •{' '}
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
        <AppContent />
      </PackageProvider>
    </AuthProvider>
  );
}

export default App;
