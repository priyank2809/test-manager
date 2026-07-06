import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSubjects } from "../api/subjects";
import { getTopicsBySubject } from "../api/topics";
import { getSubTopicsByTopics } from "../api/subtopics";
import { getTestById } from "../api/tests";
import type { Subject, Topic, SubTopic, TestType, Difficulty, TestPayload, } from "../types/models";

export const testFormSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  type: z.enum(["chapterwise", "pyq", "mock"]),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  correct_marks: z.number(),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_questions: z.number().min(1, "At least 1 question required"),
});

export type TestFormValues = z.infer<typeof testFormSchema>;

const DEFAULT_VALUES: TestFormValues = {
  name: "",
  type: "chapterwise",
  duration: 60,
  difficulty: "easy",
  wrong_marks: -1,
  unattempt_marks: 0,
  correct_marks: 5,
  total_questions: 1,
};

/**
 * Shared logic for the "test details" form used in both the TestCreatePage and EditTestModal
 */
export function useTestForm(testId?: string) {
  const isEditMode = Boolean(testId);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedSubTopicIds, setSelectedSubTopicIds] = useState<string[]>([]);

  const [isLoadingInitial, setIsLoadingInitial] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { watch, reset } = form;
  const correctMarks = watch("correct_marks");
  const totalQuestions = watch("total_questions");

  const computedTotalMarks = useMemo(() => {
    const c = Number(correctMarks) || 0;
    const q = Number(totalQuestions) || 0;
    return c * q;
  }, [correctMarks, totalQuestions]);

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => setLoadError("Failed to load subjects."));
  }, []);

  useEffect(() => {
    if (!isEditMode || !testId || subjects.length === 0) return;

    let cancelled = false;

    (async () => {
      try {
        const test = await getTestById(testId);
        if (cancelled) return;

        reset({
          name: test.name,
          type: test.type,
          duration: test.total_time,
          difficulty: test.difficulty,
          correct_marks: test.correct_marks,
          wrong_marks: test.wrong_marks,
          unattempt_marks: test.unattempt_marks,
          total_questions: test.total_questions,
        });

        const matchedSubject = subjects.find((s) => s.name === test.subject);
        if (matchedSubject) {
          setSelectedSubjectId(matchedSubject.id);
          const topicList = await getTopicsBySubject(matchedSubject.id);
          if (cancelled) return;
          setTopics(topicList);

          const matchedTopicIds = topicList
            .filter((t) => test.topics.includes(t.name))
            .map((t) => t.id);
          setSelectedTopicIds(matchedTopicIds);

          if (matchedTopicIds.length > 0) {
            const subTopicList = await getSubTopicsByTopics(matchedTopicIds);
            if (cancelled) return;
            setSubTopics(subTopicList);
            const matchedSubTopicIds = subTopicList
              .filter((st) => test.sub_topics.includes(st.name))
              .map((st) => st.id);
            setSelectedSubTopicIds(matchedSubTopicIds);
          }
        }
      } catch {
        if (!cancelled) setLoadError("Failed to load test details.");
      } finally {
        if (!cancelled) setIsLoadingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, testId, subjects.length]);

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicIds([]);
    setSelectedSubTopicIds([]);
    setSubTopics([]);
    if (!subjectId) {
      setTopics([]);
      return;
    }
    try {
      const topicList = await getTopicsBySubject(subjectId);
      setTopics(topicList);
    } catch {
      setLoadError("Failed to load topics for this subject.");
    }
  };

  const handleTopicsChange = async (topicIds: string[]) => {
    setSelectedTopicIds(topicIds);
    setSelectedSubTopicIds([]);
    if (topicIds.length === 0) {
      setSubTopics([]);
      return;
    }
    try {
      const subTopicList = await getSubTopicsByTopics(topicIds);
      setSubTopics(subTopicList);
    } catch {
      setLoadError("Failed to load sub-topics.");
    }
  };

  const buildPayload = (
    values: TestFormValues,
    status?: "draft"
  ): TestPayload => ({
    name: values.name,
    type: values.type as TestType,
    subject: selectedSubjectId,
    topics: selectedTopicIds,
    sub_topics: selectedSubTopicIds,
    correct_marks: values.correct_marks,
    wrong_marks: values.wrong_marks,
    unattempt_marks: values.unattempt_marks,
    difficulty: values.difficulty as Difficulty,
    total_time: values.duration,
    total_marks: computedTotalMarks,
    total_questions: values.total_questions,
    ...(status ? { status } : {}),
  });

  return {
    ...form,
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
  };
}