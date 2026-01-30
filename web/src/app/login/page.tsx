import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center py-12">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-border",
            },
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
