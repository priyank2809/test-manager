import { Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import MultiSelect from "../../components/ui/MultiSelect";
import Select from "../../components/ui/Select";
import NumberStepper from "../../components/ui/NumberStepper";
import Field from "../../components/ui/Field";
import { useTestForm } from "../../hooks/useTestForm";
import { createTest, updateTest } from "../../api/tests";
import { useTestsStore } from "../../store/testsStore";
import { useState } from "react";
import type { TestType, Difficulty } from "../../types/models";

export default function TestCreatePage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    isEditMode,
    isLoadingInitial,
    loadError,
    subjects,
    topics,
    subTopics,
    selectedSubjectId,
    selectedTopicIds,
    selectedSubTopicIds,
    setSelectedSubTopicIds,
    handleSubjectChange,
    handleTopicsChange,
    computedTotalMarks,
    buildPayload,
  } = useTestForm(testId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const saveTest = async (
    values: Parameters<typeof buildPayload>[0],
    status?: "draft"
  ) => {
    if (!selectedSubjectId) {
      setSubmitError("Please select a subject.");
      return null;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildPayload(values, status);
      const result = isEditMode
        ? await updateTest(testId as string, payload)
        : await createTest(payload);
      useTestsStore.getState().invalidate();
      return result;
    } catch {
      setSubmitError("Failed to save the test. Please try again.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraft = handleSubmit(async (values) => {
    const result = await saveTest(values, "draft");
    if (result) navigate("/dashboard");
  });

  const onNext = handleSubmit(async (values) => {
    const result = await saveTest(values);
    if (result) navigate(`/tests/${result.id}/questions`);
  });

  if (isLoadingInitial) {
    return (
      <AppLayout>
        <div className="text-text-secondary text-sm">Loading test...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <p className="text-sm text-text-secondary">
          Test Creation / Create Test / Chapter Wise
        </p>
        <h1 className="text-xl font-semibold text-text-primary mt-1">
          {isEditMode ? "Edit Test" : "Create New Test"}
        </h1>
      </div>

      <div className="bg-bg-page border border-border-light rounded-xl shadow-sm p-6 max-w-4xl">
        <div className="inline-flex items-center gap-1 bg-brand-semi-white/70 border border-border-light rounded-lg p-1 mb-6">
          {(["chapterwise", "pyq", "mock"] as TestType[]).map((t) => (
            <label
              key={t}
              className={`px-4 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                watch("type") === t
                  ? "bg-bg-page text-brand shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <input
                type="radio"
                value={t}
                {...register("type")}
                className="hidden"
              />
              {t === "chapterwise"
                ? "Chapterwise"
                : t === "pyq"
                ? "PYQ"
                : "Mock Test"}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          <Field label="Subject">
            <Select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              <option value="">Choose from Drop-down</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Name of Test" error={errors.name?.message}>
            <input
              type="text"
              placeholder="Enter name of Test"
              className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              {...register("name")}
            />
          </Field>

          <Field label="Topic">
            <MultiSelect
              options={topics}
              selectedIds={selectedTopicIds}
              onChange={handleTopicsChange}
              disabled={!selectedSubjectId}
            />
          </Field>

          <Field label="Sub Topic">
            <MultiSelect
              options={subTopics}
              selectedIds={selectedSubTopicIds}
              onChange={setSelectedSubTopicIds}
              disabled={selectedTopicIds.length === 0}
            />
          </Field>

          <Field label="Duration (Minutes)" error={errors.duration?.message}>
            <input
              type="number"
              placeholder="Enter the time"
              className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              {...register("duration", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Test Difficulty Level">
            <div className="flex items-center gap-6 pt-2.5">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-2 text-sm capitalize cursor-pointer"
                >
                  <input
                    type="radio"
                    value={d}
                    {...register("difficulty")}
                    className="accent-brand"
                  />
                  {d}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium text-text-primary mb-3">
            Marking Scheme:
          </p>
          <div className="grid grid-cols-5 gap-4">
            <Field label="Wrong Answer">
              <Controller
                name="wrong_marks"
                control={control}
                render={({ field }) => (
                  <NumberStepper
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field label="Unattempted">
              <Controller
                name="unattempt_marks"
                control={control}
                render={({ field }) => (
                  <NumberStepper
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field label="Correct Answer">
              <Controller
                name="correct_marks"
                control={control}
                render={({ field }) => (
                  <NumberStepper
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field
              label="No of Questions"
              error={errors.total_questions?.message}
            >
              <input
                type="number"
                placeholder="Ex:250"
                className="w-full rounded-lg border border-border-light px-3 py-2.5 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                {...register("total_questions", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Total Marks">
              <input
                type="text"
                disabled
                value={computedTotalMarks || ""}
                placeholder="Ex:250 Marks"
                className="w-full rounded-lg border border-border-light px-3 py-2.5 text-sm bg-brand-semi-white text-text-secondary placeholder:text-text-placeholder"
              />
            </Field>
          </div>
        </div>

        {(loadError || submitError) && (
          <p className="text-sm text-danger mt-4">
            {submitError ?? loadError}
          </p>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSaveDraft}
            className="text-sm font-medium text-brand hover:underline disabled:opacity-60"
          >
            Save as Draft
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-border-light text-text-primary text-sm font-medium px-6 py-2.5 hover:bg-brand-semi-white/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onNext}
              className="rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-6 py-2.5 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Next"}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}