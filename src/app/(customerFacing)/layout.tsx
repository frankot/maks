import Nav from "./_components/Nav";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function CustomerFacingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </>
  );
}
