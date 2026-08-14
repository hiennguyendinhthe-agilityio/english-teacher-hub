import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const SAMPLE_ESSAY_TEXT = `The graph below shows the number of people who visited a museum from 2000 to 2010. Overall, it can be seen that the number of visitors increased over the period.

In 2000, there were around 10,000 visitors. This number stayed the same until 2002. After that, it started to rise and reached exactly 20,000 in 2005. Between 2005 and 2007, the number went up slowly. However, from 2007 to 2010, there was a big jump in visitors, hitting a peak of 40,000 at the end of the period.

Looking at the details, the biggest increase was in the last three years. This shows that the museum became much more popular recently. In contrast, the first few years were very quiet.`;

export const useAIStore = create(
  persist(
    (set) => ({
      // --- Lesson Planner State ---
      plannerParams: {
        topic: 'Job Interview Preparation',
        cefrLevel: 'B2',
        ageGroup: 'Adults',
        duration: '45',
        method: 'PPP Framework'
      },
      plannerData: null,
      setPlannerParams: (params) => set((state) => ({ plannerParams: { ...state.plannerParams, ...params } })),
      setPlannerData: (data) => set({ plannerData: data }),

      // --- Worksheet Generator State ---
      worksheetParams: {
        topic: 'Unit 1: My New School',
        cefrLevel: 'A2',
        type: 'Vocabulary Fill-in-the-blanks',
        questionCount: 5,
      },
      worksheetData: null,
      worksheetAnswers: {},
      setWorksheetParams: (params) => set((state) => ({ worksheetParams: { ...state.worksheetParams, ...params } })),
      setWorksheetData: (data) => set({ worksheetData: data, worksheetAnswers: {} }), // Reset answers when new data is generated
      setWorksheetAnswer: (idx, opt) => set((state) => ({
        worksheetAnswers: { ...state.worksheetAnswers, [idx]: opt }
      })),
      resetWorksheetAnswers: () => set({ worksheetAnswers: {} }),

      // --- Essay Grader State ---
      essayParams: {
        essayText: SAMPLE_ESSAY_TEXT,
        gradingScale: 'IELTS Writing Band (1.0 - 9.0)'
      },
      essayFeedback: null,
      setEssayParams: (params) => set((state) => ({ essayParams: { ...state.essayParams, ...params } })),
      setEssayFeedback: (feedback) => set({ essayFeedback: feedback }),

      // --- AI Importer State ---
      importerParams: {
        text: ''
      },
      importerData: null,
      setImporterParams: (params) => set((state) => ({ importerParams: { ...state.importerParams, ...params } })),
      setImporterData: (data) => set({ importerData: data }),

      // --- Global Actions ---
      savedLessons: [],
      saveLesson: (lessonData) => set((state) => {
        // Prevent duplicate saving of the exact same lesson id
        if (state.savedLessons.find(l => l.id === lessonData.id)) return state;
        return { savedLessons: [lessonData, ...state.savedLessons] };
      }),
      deleteSavedLesson: (id) => set((state) => ({
        savedLessons: state.savedLessons.filter(l => l.id !== id)
      })),
      clearAllHistory: () => set({
        plannerData: null,
        worksheetData: null,
        worksheetAnswers: {},
        essayFeedback: null,
        importerData: null
        // Note: We deliberately do not clear savedLessons here so they remain persisted
      })
    }),
    {
      name: 'english-teacher-hub-ai-storage', // key in localStorage
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
