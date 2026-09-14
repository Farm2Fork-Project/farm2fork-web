import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-boundary">
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link className="btn btn-primary" href="/">
        Back to home
      </Link>
    </div>
  );
}
