import AppLayout from "../../components/layout/AppLayout";

export default function TestTrackingPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">
          Test Tracking
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Analytics and performance tracking for published tests.
        </p>
      </div>
      <div className="bg-bg-page border border-border-light rounded-xl p-10 text-center text-text-secondary text-sm">
      </div>
    </AppLayout>
  );
}