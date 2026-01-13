import LinksList from "@/components/LinksList";
import { Link2 } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <div className="md:max-w-lg lg:max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <header className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                        <Link2 className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        My Bookmarked Links
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        All of my bookmarked links in one place.
                    </p>
                </header>

                {/* Links List */}
                <main>
                    <LinksList />
                </main>

                {/* Footer */}
                <footer className="text-center mt-12">
                    <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-2">
                        Developed by{" "}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://msar.me"
                        >
                            Saiful Alam
                        </a>
                        <span>|</span>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://github.com/4msar/link-hub"
                        >
                            Github
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
