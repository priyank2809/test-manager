import { Controller } from "react-hook-form";
import { useTestForm } from "../../hooks/useTestForm";
import { updateTest } from "../../api/tests";
import { useTestsStore } from "../../store/testsStore";
import { useState } from "react";
import MultiSelect from "./MultiSelect";
import Select from "./Select";
import NumberStepper from "./NumberStepper";
import Field from "./Field";
import { XIcon } from "./Icons";
import type { TestRecord, TestType, Difficulty } from "../../types/models";

interface EditTestModalProps {
  testId: string;
  onClose: () => void;
  onSaved: (updated: TestRecord) => void;
}

export default function EditTestModal({
  testId,
  onClose,
  onSaved,
}: EditTestModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSave = handleSubmit(async (values) => {
    if (!selectedSubjectId) {
      setSaveError("Please select a subject.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateTest(testId, buildPayload(values));
      useTestsStore.getState().invalidate();
      onSaved(updated);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-bg-page rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-bg-page">
          <h2 className="text-base font-semibold text-text-primary">
            Edit Test creation
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-secondary hover:text-text-primary"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-6">
          {isLoadingInitial ? (
            <div className="text-sm text-text-secondary py-10 text-center">
              Loading test details...
            </div>
          ) : (
            <>
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

                <Field
                  label="Duration (Minutes)"
                  error={errors.duration?.message}
                >
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
                      {...register("total_questions", {
                        valueAsNumber: true,
                      })}
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

              {(loadError || saveError) && (
                <p className="text-sm text-danger mt-4">
                  {saveError ?? loadError}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-border-light text-text-primary text-sm font-medium px-6 py-2.5 hover:bg-brand-semi-white/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={onSave}
                  className="rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-6 py-2.5 disabled:opacity-60 transition-colors"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}