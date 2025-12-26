import { stripe } from "../lib/stripe";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // ✅ unwrap the search params
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">
          No session_id found in URL.
        </p>
      </div>
    );
  }

  // Retrieve Stripe session if needed
  const session = await stripe.checkout.sessions.retrieve(session_id);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-xl text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Payment Successful!
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Thank you! Your payment is confirmed.
        </p>
        <p className="mt-4 text-sm">
          Payment session ID:
          <span className="font-mono text-green-500 block mt-1">
            {session_id}
          </span>
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Customer email: {session?.customer_email || "N/A"}
        </p>
        <a
          href="/"
          className="mt-6 inline-flex w-full justify-center bg-[#00b875] text-white py-3 px-6 rounded-lg hover:bg-green-600 font-medium"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
