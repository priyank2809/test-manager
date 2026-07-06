import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import TestSummaryCard from "../../components/ui/TestSummaryCard";
import EditTestModal from "../../components/ui/EditTestModal";
import { getTestById, updateTest } from "../../api/tests";
import { useTestsStore } from "../../store/testsStore";
import { fetchQuestionsBulk } from "../../api/questions";
import type { TestRecord, QuestionRecord } from "../../types/models";

type LiveUntilOption = | "always" | "1week" | "2weeks" | "3weeks" | "1month" | "custom";

const OPTION_LABELS: Record<string, string> = {
  option1: "A",
  option2: "B",
  option3: "C",
  option4: "D",
};

function addDuration(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const [test, setTest] = useState<TestRecord | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [liveUntil, setLiveUntil] = useState<LiveUntilOption>("always");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");

  useEffect(() => {
    if (!testId) return;
    let cancelled = false;

    (async () => {
      try {
        const testRecord = await getTestById(testId);
        if (cancelled) return;
        setTest(testRecord);

        if (testRecord.questions && testRecord.questions.length > 0) {
          const qs = await fetchQuestionsBulk(testRecord.questions);
          if (cancelled) return;
          setQuestions(qs);
        }
      } catch {
        if (!cancelled) setError("Failed to load test details.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [testId]);

  const computeExpiryDate = (): string | null => {
    switch (liveUntil) {
      case "always":
        return null;
      case "1week":
        return addDuration(7);
      case "2weeks":
        return addDuration(14);
      case "3weeks":
        return addDuration(21);
      case "1month":
        return addDuration(30);
      case "custom":
        if (!customEndDate) return null;
        return new Date(
          `${customEndDate}T${customEndTime || "23:59"}`
        ).toISOString();
      default:
        return null;
    }
  };

  const handlePublish = async () => {
    if (!testId) return;
    setIsPublishing(true);
    setError(null);
    try {
      const scheduledDate =
        publishMode === "schedule" && scheduleDate
          ? new Date(`${scheduleDate}T${scheduleTime || "00:00"}`).toISOString()
          : null;
      const expiryDate = computeExpiryDate();

      await updateTest(testId, {
        status: "live",
        ...(scheduledDate ? { scheduled_date: scheduledDate } : {}),
        ...(expiryDate ? { expiry_date: expiryDate } : {}),
      });
      useTestsStore.getState().invalidate();

      setPublished(true);
    } catch {
      setError("Failed to publish the test. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-text-secondary text-sm">Loading...</div>
      </AppLayout>
    );
  }

  if (!test) {
    return (
      <AppLayout>
        <div className="text-danger text-sm">Test not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <p className="text-sm text-text-secondary">Test Creation</p>
        <h1 className="text-xl font-semibold text-text-primary mt-1">
          Test created
        </h1>
      </div>

      {published && (
        <div className="mb-6 rounded-lg bg-success-bg text-success px-4 py-3 text-sm font-medium flex items-center justify-between gap-4">
          <span>Test published successfully!</span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(`/tests/${test?.id}/view`)}
              className="rounded-lg bg-success text-white text-xs font-medium px-3 py-1.5 hover:opacity-90"
            >
              View Published Test
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-success text-xs font-medium underline"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <TestSummaryCard
          test={test}
          questionsCount={questions.length}
          onEdit={() => setIsEditModalOpen(true)}
        />
      </div>

      {/* Questions overview */}
      <div className="bg-bg-page border border-border-light rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-text-primary">
            Questions ({questions.length})
          </p>
          <button
            onClick={() => navigate(`/tests/${test.id}/questions`)}
            className="text-brand text-sm font-medium hover:underline"
          >
            Edit Questions
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-auto">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="border border-border-light rounded-lg p-4"
            >
              <p className="text-sm font-medium text-text-primary mb-2">
                {i + 1}. {q.question}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(["option1", "option2", "option3", "option4"] as const).map(
                  (opt) => (
                    <div
                      key={opt}
                      className={`px-3 py-1.5 rounded-md ${
                        q.correct_option === opt
                          ? "bg-success-bg text-success font-medium"
                          : "text-text-secondary"
                      }`}
                    >
                      {OPTION_LABELS[opt]}. {q[opt]}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publish settings */}
      <div className="bg-bg-page border border-border-light rounded-xl p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPublishMode("now")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              publishMode === "now"
                ? "bg-brand-semi-white text-brand border-brand"
                : "text-text-secondary border-border-light"
            }`}
          >
            Publish Now
          </button>
          <button
            onClick={() => setPublishMode("schedule")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              publishMode === "schedule"
                ? "bg-brand-semi-white text-brand border-brand"
                : "text-text-secondary border-border-light"
            }`}
          >
            Schedule Publish
          </button>
        </div>

        {publishMode === "schedule" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="rounded-lg border border-border-light px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="rounded-lg border border-border-light px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        )}

        <p className="text-sm font-medium text-text-primary mb-1">
          Live Until
        </p>
        <p className="text-sm text-text-secondary mb-4">
          Choose how long this test should remain available on the platform.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {(
            [
              ["always", "Always Available"],
              ["3weeks", "3 Weeks"],
              ["1week", "1 Week"],
              ["1month", "1 Month"],
              ["2weeks", "2 Weeks"],
              ["custom", "Custom Duration"],
            ] as [LiveUntilOption, string][]
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                checked={liveUntil === value}
                onChange={() => setLiveUntil(value)}
                className="accent-brand"
              />
              {label}
            </label>
          ))}
        </div>

        {liveUntil === "custom" && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-border-light px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            <input
              type="time"
              value={customEndTime}
              onChange={(e) => setCustomEndTime(e.target.value)}
              className="rounded-lg border border-border-light px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        )}

        {error && <p className="text-sm text-danger mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-border-light text-text-primary text-sm font-medium px-5 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || questions.length === 0}
            className="rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60"
          >
            {isPublishing ? "Publishing..." : "Confirm"}
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <EditTestModal
          testId={test.id}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={(updated) => {
            setTest(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}