import StatusBadge, { DifficultyBadge } from "./StatusBadge";
import { ClockIcon, DocumentIcon, ChartIcon, PencilIcon } from "./Icons";
import type { TestRecord } from "../../types/models";

interface TestSummaryCardProps {
  test: TestRecord;
  questionsCount: number;
  onEdit?: () => void;
}

export default function TestSummaryCard({
  test,
  questionsCount,
  onEdit,
}: TestSummaryCardProps) {
  return (
    <div className="bg-bg-page border border-border-light rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block bg-chip-dark text-white text-xs font-semibold px-3 py-1 rounded-full capitalize mb-2">
            {test.type}
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-text-primary">
              {test.name}
            </h2>
            <DifficultyBadge difficulty={test.difficulty} />
            {test.status && <StatusBadge status={test.status} />}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex items-center gap-4 text-sm text-text-secondary whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <ClockIcon /> {test.total_time} Min
            </span>
            <span className="flex items-center gap-1.5">
              <DocumentIcon /> {questionsCount} Q's
            </span>
            <span className="flex items-center gap-1.5">
              <ChartIcon /> {test.total_marks} Marks
            </span>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label="Edit test details"
              className="text-text-secondary hover:text-brand transition-colors"
            >
              <PencilIcon />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm mt-3 pt-3 border-t border-border-light">
        <span className="text-text-secondary">
          Subject:{" "}
          <span className="text-text-primary font-medium">
            {test.subject}
          </span>
        </span>
        <span className="text-text-secondary">
          Topic:{" "}
          <span className="text-text-primary font-medium">
            {test.topics.join(", ") || "—"}
          </span>
        </span>
        <span className="text-text-secondary">
          Sub Topic:{" "}
          <span className="text-text-primary font-medium">
            {test.sub_topics.join(", ") || "—"}
          </span>
        </span>
      </div>
    </div>
  );
}