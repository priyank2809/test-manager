import { useEffect, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import TestSummaryCard from "../../components/ui/TestSummaryCard";
import EditTestModal from "../../components/ui/EditTestModal";
import Select from "../../components/ui/Select";
import Field from "../../components/ui/Field";
import RichTextEditor from "../../components/ui/RichTextEditor";
import { PlusIcon, DownloadIcon } from "../../components/ui/Icons";
import { getTestById, updateTest } from "../../api/tests";
import { createQuestionsBulk, fetchQuestionsBulk } from "../../api/questions";
import { getSubjects } from "../../api/subjects";
import { getTopicsBySubject } from "../../api/topics";
import { getSubTopicsByTopics } from "../../api/subtopics";
import { parseQuestionsCsv, CSV_TEMPLATE_HEADER, CSV_TEMPLATE_EXAMPLE_ROW, } from "../../utils/csvImport";
import type { TestRecord, QuestionPayload, CorrectOption, Difficulty, } from "../../types/models";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

const schema = z.object({
  question: z
    .string()
    .refine((val) => stripHtml(val).length > 0, "Question text is required"),
  option1: z.string().min(1, "Required"),
  option2: z.string().min(1, "Required"),
  option3: z.string().min(1, "Required"),
  option4: z.string().min(1, "Required"),
  correct_option: z.enum(["option1", "option2", "option3", "option4"]),
  explanation: z.string().optional(),
  media_url: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard", ""]).optional(),
  topic: z.string().optional(),
  sub_topic: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface LocalQuestion extends QuestionPayload {
  id?: string;
}

interface IdOption {
  id: string;
  name: string;
}

const emptyDefaults: FormValues = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_option: "option1",
  explanation: "",
  media_url: "",
  difficulty: "",
  topic: "",
  sub_topic: "",
};

export default function QuestionCreationPage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const [test, setTest] = useState<TestRecord | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [topicOptions, setTopicOptions] = useState<IdOption[]>([]);
  const [subTopicOptions, setSubTopicOptions] = useState<IdOption[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvMessage, setCsvMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const watchedMediaUrl = useWatch({ control, name: "media_url" });

  useEffect(() => {
    if (!testId) return;
    let cancelled = false;

    (async () => {
      try {
        const testRecord = await getTestById(testId);
        if (cancelled) return;
        setTest(testRecord);

        if (testRecord.questions && testRecord.questions.length > 0) {
          const existing = await fetchQuestionsBulk(testRecord.questions);
          if (cancelled) return;
          setQuestions(existing);
        }

        const subjects = await getSubjects();
        if (cancelled) return;
        const matchedSubject = subjects.find(
          (s) => s.name === testRecord.subject
        );
        if (matchedSubject) {
          setSubjectId(matchedSubject.id);
          const allTopics = await getTopicsBySubject(matchedSubject.id);
          if (cancelled) return;
          const scopedTopics = allTopics.filter((t) =>
            testRecord.topics.includes(t.name)
          );
          setTopicOptions(scopedTopics);

          if (scopedTopics.length > 0) {
            const allSubTopics = await getSubTopicsByTopics(
              scopedTopics.map((t) => t.id)
            );
            if (cancelled) return;
            const scopedSubTopics = allSubTopics.filter((st) =>
              testRecord.sub_topics.includes(st.name)
            );
            setSubTopicOptions(scopedSubTopics);
          }
        } else {
          setError(
            "Could not resolve this test's subject - question creation may fail."
          );
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

  const onAddQuestion = handleSubmit((values) => {
    if (!testId || !test) return;
    if (!subjectId) {
      setError(
        "Could not resolve this test's subject - cannot add question yet."
      );
      return;
    }
    // Only enforce the cap when adding a brand-new question - editing an
    // existing one (editingIndex !== null) never changes the count.
    if (editingIndex === null && questions.length >= test.total_questions) {
      setError(
        `This test is set to ${test.total_questions} question${
          test.total_questions === 1 ? "" : "s"
        }. Edit "No of Questions" on the test details to add more.`
      );
      return;
    }
    const newQuestion: LocalQuestion = {
      type: "mcq",
      question: values.question,
      option1: values.option1,
      option2: values.option2,
      option3: values.option3,
      option4: values.option4,
      correct_option: values.correct_option as CorrectOption,
      explanation: values.explanation || undefined,
      media_url: values.media_url || undefined,
      difficulty: (values.difficulty || undefined) as Difficulty | undefined,
      subject: subjectId,
      topic: values.topic || undefined,
      sub_topic: values.sub_topic || undefined,
      test_id: testId,
    };

    if (editingIndex !== null) {
      setQuestions((prev) =>
        prev.map((q, i) => (i === editingIndex ? { ...q, ...newQuestion } : q))
      );
      setEditingIndex(null);
    } else {
      setQuestions((prev) => [...prev, newQuestion]);
    }

    reset(emptyDefaults);
  });

  const loadQuestionIntoForm = (index: number) => {
    const q = questions[index];
    reset({
      question: q.question,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correct_option: q.correct_option,
      explanation: q.explanation ?? "",
      media_url: q.media_url ?? "",
      difficulty: (q.difficulty ?? "") as FormValues["difficulty"],
      topic: q.topic ?? "",
      sub_topic: q.sub_topic ?? "",
    });
    setEditingIndex(index);
  };

  const onDeleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      reset(emptyDefaults);
    }
  };

  const onClearForm = () => {
    reset(emptyDefaults);
    setEditingIndex(null);
  };

  const goToPrevQuestion = () => {
    if (editingIndex === null) {
      if (questions.length > 0) loadQuestionIntoForm(questions.length - 1);
      return;
    }
    if (editingIndex > 0) loadQuestionIntoForm(editingIndex - 1);
  };

  const goToNextQuestion = () => {
    if (editingIndex === null) return;
    if (editingIndex < questions.length - 1) {
      loadQuestionIntoForm(editingIndex + 1);
    } else {
      onClearForm();
    }
  };

  const onSaveAndContinue = async () => {
    if (!testId) return;
    if (questions.length === 0) {
      setError("Add at least 1 question before continuing.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const newOnes = questions.filter((q) => !q.id);
      let newIds: string[] = [];
      if (newOnes.length > 0) {
        // NOTE: /questions/bulk rejects any value (id or name) for
        // `topic`/`sub_topic` with a "not found" error - confirmed via
        // direct testing against the live staging API. This looks like
        // a backend validation bug (the `questions` table has no
        // `topic_id` column, and the string lookup never matches).
        // We keep the dropdowns in the UI per the spec, but omit these
        // two fields from the actual request so question creation isn't
        // blocked by it. `difficulty` is unaffected and sends fine.
        const created = await createQuestionsBulk(
          newOnes.map(({ id: _id, topic: _topic, sub_topic: _subTopic, ...rest }) => rest)
        );
        newIds = created.map((q) => q.id);
      }
      const existingIds = questions.filter((q) => q.id).map((q) => q.id as string);
      const allIds = [...existingIds, ...newIds];

      await updateTest(testId, {
        questions: allIds,
        total_questions: allIds.length,
        total_marks: allIds.length * (test?.correct_marks ?? 0),
      });

      navigate(`/tests/${testId}/publish`);
    } catch {
      setError("Failed to save questions. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCsvImport = async (file: File) => {
    if (!testId || !test) return;
    if (!subjectId) {
      setCsvMessage({
        type: "error",
        text: "Could not resolve this test's subject - cannot import yet.",
      });
      return;
    }

    const { questions: parsed, errors: parseErrors } = await parseQuestionsCsv(
      file
    );

    const remainingSlots = Math.max(0, test.total_questions - questions.length);
    const toImport = parsed.slice(0, remainingSlots);
    const overflow = parsed.length - toImport.length;

    const withMeta: LocalQuestion[] = toImport.map((q) => ({
      ...q,
      subject: subjectId,
      test_id: testId,
    }));

    setQuestions((prev) => [...prev, ...withMeta]);

    const parts: string[] = [];
    if (withMeta.length > 0) {
      parts.push(`Imported ${withMeta.length} question(s) from CSV.`);
    }
    if (parseErrors.length > 0) {
      parts.push(
        `${parseErrors.length} row(s) skipped: ${parseErrors.slice(0, 3).join(" ")}${
          parseErrors.length > 3 ? " …" : ""
        }`
      );
    }
    if (overflow > 0) {
      parts.push(
        `${overflow} row(s) not imported - would exceed this test's ${test.total_questions}-question limit.`
      );
    }
    if (parts.length === 0) {
      parts.push("No valid rows found in that CSV file.");
    }

    setCsvMessage({
      type: withMeta.length > 0 ? "success" : "error",
      text: parts.join(" "),
    });
  };

  const downloadCsvTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_HEADER + CSV_TEMPLATE_EXAMPLE_ROW], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
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

  const isAtLimit = questions.length >= test.total_questions;

  return (
    <AppLayout>
      <div className="mb-6">
        <p className="text-sm text-text-secondary">
          Test Creation / Add Questions
        </p>
      </div>

      <div className="mb-6">
        <TestSummaryCard
          test={test}
          questionsCount={questions.length}
          onEdit={() => setIsEditModalOpen(true)}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Question list */}
        <div className="col-span-1">
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-sm font-medium text-text-primary">
              Question creation
            </p>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            Total Questions . {test.total_questions}
          </p>

          <div className="space-y-2">
            {questions.length === 0 && (
              <p className="text-sm text-text-secondary">
                No questions added yet.
              </p>
            )}
            {questions.map((q, i) => (
              <div
                key={q.id ?? `pending-${i}`}
                className={`border rounded-lg px-3 py-2.5 text-sm flex items-center justify-between gap-2 ${
                  editingIndex === i
                    ? "border-brand bg-brand-semi-white"
                    : "border-border-light"
                }`}
              >
                <span className="truncate flex-1">
                  {i + 1}. {q.question}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => loadQuestionIntoForm(i)}
                    className="text-brand text-xs font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(i)}
                    className="text-danger text-xs font-medium hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question form */}
        <div className="col-span-2 bg-bg-page border border-border-light rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-text-primary">
              {editingIndex !== null
                ? `Editing Question ${editingIndex + 1}`
                : isAtLimit
                ? "All questions added"
                : `Question ${questions.length + 1}`}
              <span className="text-text-secondary font-normal">
                /{test.total_questions}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                title="Display only - not implemented"
                className="flex items-center gap-1.5 rounded-lg border border-border-light text-text-secondary text-xs font-medium px-3 py-1.5 opacity-60 cursor-not-allowed"
              >
                <PlusIcon className="w-3.5 h-3.5" /> MCQ
              </button>
              <button
                type="button"
                onClick={downloadCsvTemplate}
                title="Download a CSV template with the expected columns"
                className="text-text-secondary text-xs font-medium underline hover:text-brand"
              >
                Template
              </button>
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                disabled={isAtLimit}
                className="flex items-center gap-1.5 rounded-lg border border-border-light text-text-secondary text-xs font-medium px-3 py-1.5 hover:bg-brand-semi-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadIcon className="w-3.5 h-3.5" /> CSV
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvImport(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {csvMessage && (
            <p
              className={`text-xs rounded-md px-3 py-2 mb-4 ${
                csvMessage.type === "success"
                  ? "bg-success-bg text-success"
                  : "bg-warning-bg text-warning-text"
              }`}
            >
              {csvMessage.text}
            </p>
          )}

          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onClearForm}
              className="text-danger text-sm font-medium hover:underline"
            >
              Delete All Edits
            </button>
          </div>

          <form onSubmit={onAddQuestion} className="space-y-4">
            <div>
              <Controller
                name="question"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type here"
                  />
                )}
              />
              {errors.question && (
                <p className="text-xs text-danger mt-1">
                  {errors.question.message}
                </p>
              )}
            </div>

            <p className="text-sm font-medium text-text-primary">
              Type the options below
            </p>
            {(["option1", "option2", "option3", "option4"] as const).map(
              (opt) => (
                <div key={opt} className="flex items-center gap-3">
                  <input
                    type="radio"
                    value={opt}
                    {...register("correct_option")}
                    className="accent-brand"
                  />
                  <input
                    type="text"
                    placeholder="Type Option here"
                    className="flex-1 rounded-lg border border-border-light px-4 py-2 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    {...register(opt)}
                  />
                </div>
              )
            )}
            {(errors.option1 ||
              errors.option2 ||
              errors.option3 ||
              errors.option4) && (
              <p className="text-xs text-danger">All 4 options are required.</p>
            )}

            <Field label="Add Solution">
              <Controller
                name="explanation"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Type here"
                    minHeight="80px"
                  />
                )}
              />
            </Field>

            <Field label="Media URL (optional)">
              <input
                type="text"
                placeholder="https://..."
                className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                {...register("media_url")}
              />
              {watchedMediaUrl && (
                <img
                  src={watchedMediaUrl}
                  alt="Question media preview"
                  className="mt-2 max-h-40 rounded-md border border-border-light object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = "block";
                  }}
                />
              )}
            </Field>

            {editingIndex === null && isAtLimit && (
              <p className="text-xs text-warning-text bg-warning-bg rounded-md px-3 py-2">
                This test is set to {test.total_questions} question
                {test.total_questions === 1 ? "" : "s"}. Edit "No of
                Questions" on the test details to add more, or edit one of
                the questions on the left instead.
              </p>
            )}

            <button
              type="submit"
              disabled={editingIndex === null && isAtLimit}
              className="rounded-lg border border-brand text-brand text-sm font-medium px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? "Update Question" : "Add Another Question"}
            </button>
          </form>

          {/* Prev / Next navigation between already-added questions */}
          <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-border-light">
            <button
              type="button"
              onClick={goToPrevQuestion}
              disabled={questions.length === 0}
              className="text-text-secondary hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous question"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goToNextQuestion}
              disabled={editingIndex === null}
              className="text-text-secondary hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next question"
            >
              ›
            </button>
          </div>

          {/* Question settings: optional per-question metadata */}
          <div className="mt-6 pt-6 border-t border-border-light space-y-5">
            <p className="text-sm font-medium text-text-primary">
              Question settings
            </p>

            <Field label="Level of Difficulty">
              <Select {...register("difficulty")}>
                <option value="">Select from Drop-down</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </Field>

            <Field label="Topic">
              <Select
                {...register("topic")}
                disabled={topicOptions.length === 0}
              >
                <option value="">Select from Drop-down</option>
                {topicOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Sub-topic">
              <Select
                {...register("sub_topic")}
                disabled={subTopicOptions.length === 0}
              >
                <option value="">Select from Drop-down</option>
                {subTopicOptions.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-danger mt-4">{error}</p>}

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-lg bg-danger hover:bg-red-600 text-white text-sm font-medium px-5 py-2.5 transition-colors"
        >
          Exit Test Creation
        </button>
        <button
          onClick={onSaveAndContinue}
          disabled={isSaving}
          className="rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Next"}
        </button>
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