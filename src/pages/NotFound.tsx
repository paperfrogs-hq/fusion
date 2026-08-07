import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="mx-auto max-w-measure-64 text-center">
        <p className="font-serif text-sm italic text-muted-foreground">404</p>
        <h1 className="mt-4 font-serif text-4xl font-light text-foreground">
          We can't find that page.
        </h1>
        <p className="mt-4 text-prose text-muted-foreground">
          The link is either old, mistyped, or from a part of the site we have since retired.
          The home page has everything that matters.
        </p>
        <Link
          to="/"
          className="link-underline mt-8 inline-flex items-center gap-2 font-serif text-base italic text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fusion
        </Link>
      </div>
    </div>
  );
};

export default NotFound;