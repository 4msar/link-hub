import LinksList from '@/components/LinksList';
import { Link2 } from 'lucide-react';

const Index = () => {
  // Replace with your actual API endpoint
  // const apiUrl = 'https://api.example.com/links';
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">My Links</h1>
          <p className="text-muted-foreground mt-1">All my important links in one place</p>
        </header>

        {/* Links List */}
        <main>
          <LinksList />
        </main>

        {/* Footer */}
        <footer className="text-center mt-12">
          <p className="text-xs text-muted-foreground/60">
            Powered by Links Aggregator
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
