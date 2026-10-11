export function MobilePaymentReturn({ orderId, result }: { orderId: string; result: "complete" | "cancel" }) {
  const query = new URLSearchParams({ orderId, result });
  return <main className="cart-empty">
    <h1>{result === "cancel" ? "Checkout closed" : "Return from checkout"}</h1>
    <p>Return to the app to check your saved order. Payment status is confirmed by the server.</p>
    <a className="btn btn-primary" href={`farm2fork://app/payments?${query}`}>Return to Farm2Fork</a>
    <p>If the app does not open, launch Farm2Fork and continue payment from Orders.</p>
  </main>;
}
