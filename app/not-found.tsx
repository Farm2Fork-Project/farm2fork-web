import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-boundary">
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link className="btn btn-primary" href="/">
        Back to home
      </Link>
      <p>
        Or try <Link href="/how-it-works">how it works</Link>, the <Link href="/guides">guides</Link> or the{" "}
        <Link href="/faq">FAQ</Link>.
      </p>
    </div>
  );
}
