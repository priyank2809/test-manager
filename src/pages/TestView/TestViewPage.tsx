import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import TestSummaryCard from "../../components/ui/TestSummaryCard";
import { getTestById } from "../../api/tests";
import { fetchQuestionsBulk } from "../../api/questions";
import type { TestRecord, QuestionRecord } from "../../types/models";

const OPTION_LABELS: Record<string, string> = {
  option1: "A",
  option2: "B",
  option3: "C",
  option4: "D",
};

export default function TestViewPage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const [test, setTest] = useState<TestRecord | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!cancelled) setError("Failed to load this test.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [testId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-text-secondary text-sm">Loading...</div>
      </AppLayout>
    );
  }

  if (error || !test) {
    return (
      <AppLayout>
        <div className="text-danger text-sm">{error ?? "Test not found."}</div>
      </AppLayout>
    );
  }

  const isLive = test.status === "live";

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            Test Creation / View Test
          </p>
          <h1 className="text-xl font-semibold text-text-primary mt-1">
            Final Test Output
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-lg border border-border-light text-text-primary text-sm font-medium px-5 py-2.5 hover:bg-brand-semi-white/60 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {isLive ? (
        <div className="mb-6 rounded-lg bg-success-bg text-success px-4 py-3 text-sm font-medium">
          This test is live and published on the platform
          {test.expiry_date &&
            ` until ${new Date(test.expiry_date).toLocaleString()}`}
          .
        </div>
      ) : (
        <div className="mb-6 rounded-lg bg-warning-bg text-warning-text px-4 py-3 text-sm font-medium">
          This test has not been published yet (status:{" "}
          {test.status ?? "draft"}).
        </div>
      )}

      <div className="mb-6">
        <TestSummaryCard test={test} questionsCount={questions.length} />
      </div>

      <div className="bg-bg-page border border-border-light rounded-xl shadow-sm p-6">
        <p className="text-sm font-medium text-text-primary mb-4">
          Questions ({questions.length})
        </p>

        {questions.length === 0 && (
          <p className="text-sm text-text-secondary">
            This test has no questions yet.
          </p>
        )}

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="border border-border-light rounded-lg p-4"
            >
              <div
                className="text-sm font-medium text-text-primary mb-2 [&_p]:inline [&_img]:max-h-32 [&_img]:rounded-md [&_img]:my-1 [&_img]:block"
                dangerouslySetInnerHTML={{
                  __html: `${i + 1}. ${q.question}`,
                }}
              />
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
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
              {q.explanation && (
                <div className="text-xs text-text-secondary border-t border-border-light pt-2 mt-2">
                  <span className="font-medium">Solution: </span>
                  <span
                    className="[&_p]:inline"
                    dangerouslySetInnerHTML={{ __html: q.explanation }}
                  />
                </div>
              )}
              {q.media_url && (
                <img
                  src={q.media_url}
                  alt={`Question ${i + 1} media`}
                  className="mt-2 max-h-40 rounded-md border border-border-light object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}