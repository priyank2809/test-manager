import type { TestStatus, Difficulty } from "../../types/models";

const STYLES: Record<string, string> = {
  live: "bg-success-bg text-success",
  draft: "bg-warning-bg text-warning-text",
  unpublished: "bg-gray-100 text-text-secondary",
  expired: "bg-red-50 text-danger",
};

export default function StatusBadge({ status }: { status: TestStatus }) {
  const label = status ?? "draft";
  const style = STYLES[label] ?? "bg-gray-100 text-text-secondary";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}
    >
      {label}
    </span>
  );
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-success-bg text-success",
  medium: "bg-warning-bg text-warning-text",
  hard: "bg-red-50 text-danger",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${DIFFICULTY_STYLES[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}