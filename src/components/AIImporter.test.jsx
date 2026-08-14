import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIImporter from './AIImporter';
import { LanguageProvider } from '../context/LanguageContext';

// Mock generateLessonFromText so no real API calls are made in unit tests
vi.mock('../services/aiService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateLessonFromText: vi.fn().mockResolvedValue({
      id: 'unit-6-community-service',
      title: 'Unit 6: COMMUNITY SERVICE & VOLUNTEERING',
      vocabulary: [
        { word: 'volunteer', type: '(v)', transcription: '/ˌvɒl.ənˈtɪər/', meaning: 'tình nguyện viên' },
        { word: 'charity', type: '(n)', transcription: '/ˈtʃær.ɪ.ti/', meaning: 'tổ chức từ thiện' },
        { word: 'donate', type: '(v)', transcription: '/dəʊˈneɪt/', meaning: 'quyên góp' },
      ],
      grammar: [{
        title: 'I. Present Perfect Tense',
        sections: [{ subtitle: 'Usage', points: ['Used for actions completed at an unspecified time.'], formulas: [], tags: [] }]
      }],
      phonetics: [{ title: 'Sounds /t/, /d/, /ɪd/', description: 'For -ed endings', examples: [] }],
      practice: [
        { id: 1, question: 'Which word means "to give money to help others"?', options: ['volunteer', 'donate', 'charity', 'community'], correctAnswer: 1, explanation: 'Donate means to give money or goods.' }
      ]
    })
  };
});

const renderComponent = () => {
  return render(
    <LanguageProvider>
      <AIImporter setActiveTab={vi.fn()} />
    </LanguageProvider>
  );
};

describe('AIImporter Component', () => {
  it('renders AI Importer with sample presets, tabs, and textarea', () => {
    renderComponent();
    expect(screen.getByText(/Trợ Lý Nhập Giáo Án AI|AI Lesson Importer/i)).toBeInTheDocument();
    expect(screen.getByText(/Mẫu Giáo Án Nhanh|Quick Sample Presets/i)).toBeInTheDocument();
    expect(screen.getByText(/Unit 6: Dịch Vụ Cộng Đồng|Unit 6: Community Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Tải File Lên|Upload Document/i)).toBeInTheDocument();
  });

  it('applies sample preset to textarea when clicked', () => {
    renderComponent();
    const presetBtn = screen.getByText(/Unit 6: Dịch Vụ Cộng Đồng|Unit 6: Community Service/i);
    fireEvent.click(presetBtn);

    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toContain('Unit 6: COMMUNITY SERVICE');
    expect(textarea.value).toContain('volunteer');
  });

  it('switches to file upload tab and shows drag-and-drop dropzone', () => {
    renderComponent();
    const uploadTabBtn = screen.getByText(/Tải File Lên|Upload Document/i);
    fireEvent.click(uploadTabBtn);

    expect(screen.getByText(/Kéo thả file vào đây|Drag & drop your file here/i)).toBeInTheDocument();
  });

  it('generates structured lesson and displays responsive extracted dashboard', async () => {
    renderComponent();
    const presetBtn = screen.getByText(/Unit 6: Dịch Vụ Cộng Đồng|Unit 6: Community Service/i);
    fireEvent.click(presetBtn);

    const submitBtn = screen.getByRole('button', { name: /Tạo Bài Giảng Tương Tác|Generate Interactive Lesson/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Nhập Bài Thành Công|Import Successful/i)).toBeInTheDocument();
    }, { timeout: 6000 });

    expect(screen.getByText(/Unit 6: COMMUNITY SERVICE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/volunteer/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Vào Học Bài Giảng|Start Interactive Lesson/i)).toBeInTheDocument();
    expect(screen.getByText(/Trình Chiếu TV|Classroom TV Presenter/i)).toBeInTheDocument();
  });
});
