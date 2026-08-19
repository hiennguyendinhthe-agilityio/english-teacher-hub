import { describe, it, expect } from 'vitest';
import { generateSmartResponse, normalizeText, isEnglishQuery } from './smartChatEngine';

describe('SmartChatEngine - Comprehensive 35+ Test Cases', () => {

  // ---------------------------------------------------------------------------
  // NHÓM 1: CHÀO HỎI & GIỚI THIỆU (GREETINGS & INTRODUCTIONS)
  // ---------------------------------------------------------------------------
  describe('Group 1: Greetings & Introductions', () => {
    it('TC01: Handles Vietnamese greeting "xin chào"', () => {
      const res = generateSmartResponse('xin chào');
      expect(res).toContain("Ms Van's English Class");
      expect(res).toContain('Trợ lý AI');
    });

    it('TC02: Handles English greeting "hello"', () => {
      const res = generateSmartResponse('hello');
      expect(res).toContain("Ms Van's English Class");
      expect(res).toContain('AI Learning Assistant');
    });

    it('TC03: Handles English greeting "hi there"', () => {
      const res = generateSmartResponse('hi');
      expect(res).toContain("Ms Van's English Class");
    });

    it('TC04: Handles "bạn là ai"', () => {
      const res = generateSmartResponse('bạn là ai');
      expect(res).toContain('Trợ lý Ảo của Ms Van');
    });

    it('TC05: Handles "who are you"', () => {
      const res = generateSmartResponse('who are you');
      expect(res).toContain("Ms Van's Virtual Assistant");
    });
  });

  // ---------------------------------------------------------------------------
  // NHÓM 2: HƯỚNG DẪN TÍNH NĂNG WEBSITE (WEBSITE TOOL GUIDES)
  // ---------------------------------------------------------------------------
  describe('Group 2: Website Feature Guides', () => {
    it('TC06: Explains Flashcard Builder (Vietnamese)', () => {
      const res = generateSmartResponse('cách học từ vựng bằng flashcard');
      expect(res).toContain('Flashcard Builder');
      expect(res).toContain('IPA');
      expect(res).toContain('Loa phát âm');
    });

    it('TC07: Explains Flashcard Builder (English)', () => {
      const res = generateSmartResponse('How to use flashcards to learn vocabulary?');
      expect(res).toContain('Flashcard Builder Guide');
      expect(res).toContain('Speaker icon');
    });

    it('TC08: Explains AI Importer (Vietnamese)', () => {
      const res = generateSmartResponse('làm sao để tạo bài học từ file word docx');
      expect(res).toContain('AI Importer');
      expect(res).toContain('docx');
      expect(res).toContain('4 kỹ năng');
    });

    it('TC09: Explains AI Importer (English)', () => {
      const res = generateSmartResponse('How can I upload curriculum documents to create lessons?');
      expect(res).toContain('AI Importer & Lesson Planner Guide');
      expect(res).toContain('Admin Dashboard');
    });

    it('TC10: Explains Worksheet Generator (Vietnamese)', () => {
      const res = generateSmartResponse('hướng dẫn in phiếu bài tập pdf');
      expect(res).toContain('Worksheet Generator');
      expect(res).toContain('PDF');
      expect(res).toContain('2 cột');
    });

    it('TC11: Explains Worksheet Generator (English)', () => {
      const res = generateSmartResponse('How to export printable worksheet to PDF?');
      expect(res).toContain('Worksheet Generator Guide');
      expect(res).toContain('Print / Export PDF');
    });

    it('TC12: Explains Essay Grader (Vietnamese)', () => {
      const res = generateSmartResponse('chấm điểm bài luận writing như thế nào');
      expect(res).toContain('Essay Grader');
      expect(res).toContain('thang 10');
      expect(res).toContain('ngữ pháp');
    });

    it('TC13: Explains Essay Grader (English)', () => {
      const res = generateSmartResponse('How does the essay grading feature work?');
      expect(res).toContain('Essay Grader Guide');
      expect(res).toContain('10-point scale');
    });

    it('TC14: Explains Classroom Presenter', () => {
      const res = generateSmartResponse('cách bật chế độ trình chiếu lên tivi lớp học');
      expect(res).toContain('Classroom Presenter');
      expect(res).toContain('Máy chiếu');
    });

    it('TC15: Explains Course Manager and Interactive Lesson', () => {
      const res = generateSmartResponse('quản lý khóa học course manager');
      expect(res).toContain('Course Manager');
      expect(res).toContain('Interactive Lesson');
    });
  });

  // ---------------------------------------------------------------------------
  // NHÓM 3: TÓM TẮT BÀI HỌC LỚP 6 (UNITS 1 - 5)
  // ---------------------------------------------------------------------------
  describe('Group 3: Grade 6 Curriculum Summaries', () => {
    it('TC16: Summarizes Unit 1: My New School', () => {
      const res = generateSmartResponse('tóm tắt bài học unit 1');
      expect(res).toContain('Unit 1: MY NEW SCHOOL');
      expect(res).toContain('Thì Hiện tại đơn');
      expect(res).toContain('calculator');
    });

    it('TC17: Summarizes Unit 2: My House', () => {
      const res = generateSmartResponse('nội dung unit 2 my house');
      expect(res).toContain('Unit 2: MY HOUSE');
      expect(res).toContain('There is');
      expect(res).toContain('town house');
    });

    it('TC18: Summarizes Unit 3: My Friends', () => {
      const res = generateSmartResponse('ngữ pháp unit 3 my friends');
      expect(res).toContain('Unit 3: MY FRIENDS');
      expect(res).toContain('Thì Hiện tại tiếp diễn');
      expect(res).toContain('clever');
    });

    it('TC19: Summarizes Unit 4: My Neighbourhood', () => {
      const res = generateSmartResponse('unit 4 my neighbourhood có gì');
      expect(res).toContain('Unit 4: MY NEIGHBOURHOOD');
      expect(res).toContain('So sánh hơn');
    });

    it('TC20: Summarizes Unit 5: Natural Wonders of Vietnam', () => {
      const res = generateSmartResponse('tổng hợp unit 5 natural wonders');
      expect(res).toContain('Unit 5: NATURAL WONDERS OF VIETNAM');
      expect(res).toContain('Must & Mustn\'t');
      expect(res).toContain('waterfall');
    });
  });

  // ---------------------------------------------------------------------------
  // NHÓM 4: HỎI ĐÁP NGỮ PHÁP TIẾNG ANH (ENGLISH GRAMMAR FAQ)
  // ---------------------------------------------------------------------------
  describe('Group 4: English Grammar FAQ', () => {
    it('TC21: Explains Present Simple tense', () => {
      const res = generateSmartResponse('cách dùng thì hiện tại đơn');
      expect(res).toContain('Present Simple');
      expect(res).toContain('S + V(s/es)');
    });

    it('TC22: Explains Articles "a" and "an"', () => {
      const res = generateSmartResponse('phân biệt a và an khi nào dùng an');
      expect(res).toContain('u - e - o - a - i');
      expect(res).toContain('an apple');
    });

    it('TC23: Explains Comparative Adjectives', () => {
      const res = generateSmartResponse('công thức so sánh hơn tính từ ngắn');
      expect(res).toContain('S1 + be + Adj-er + than + S2');
      expect(res).toContain('bigger than');
    });
  });

  // ---------------------------------------------------------------------------
  // NHÓM 5: BỘ LỌC CÂU HỎI NGOÀI LỀ (OFF-TOPIC FILTERING)
  // ---------------------------------------------------------------------------
  describe('Group 5: Off-Topic Filter', () => {
    it('TC24: Politely rejects Weather questions (Vietnamese)', () => {
      const res = generateSmartResponse('thời tiết ngày mai có mưa không');
      expect(res).toContain('chuyên biệt');
      expect(res).toContain('tiếng Anh');
    });

    it('TC25: Politely rejects Weather questions (English)', () => {
      const res = generateSmartResponse('What is the weather today in Hanoi?');
      expect(res).toContain('specialized');
      expect(res).toContain('English vocabulary');
    });

    it('TC26: Politely rejects Math questions', () => {
      const res = generateSmartResponse('1 + 1 bằng mấy giải toán giúp tôi');
      expect(res).toContain('Ms Van\'s English Class');
    });

    it('TC27: Politely rejects Programming / Coding questions', () => {
      const res = generateSmartResponse('hãy viết code python cho tôi');
      expect(res).toContain('chuyên về từ vựng, ngữ pháp tiếng Anh');
    });

    it('TC28: Politely rejects Politics / News questions', () => {
      const res = generateSmartResponse('ai là tổng thống mỹ');
      expect(res).toContain('học tập');
    });
  });

  // ---------------------------------------------------------------------------
  // NHÓM 6: SONG NGỮ VÀ TRƯỜNG HỢP BIÊN (BILINGUAL & EDGE CASES)
  // ---------------------------------------------------------------------------
  describe('Group 6: Bilingual & Edge Cases', () => {
    it('TC29: Handles empty string cleanly', () => {
      const res = generateSmartResponse('');
      expect(res).toContain('chưa nghe rõ');
    });

    it('TC30: Handles punctuation only "????"', () => {
      const res = generateSmartResponse('????');
      expect(res).toContain('chưa nghe rõ');
    });

    it('TC31: Handles English punctuation only "??"', () => {
      const res = generateSmartResponse('help ???');
      expect(res).toContain("English studies");
    });

    it('TC32: Handles completely random string (fallback menu)', () => {
      const res = generateSmartResponse('xyzabc123456');
      expect(res).toContain('Chương trình tiếng Anh lớp 6');
      expect(res).toContain('Công cụ website');
    });

    it('TC33: Handles English random query (English fallback menu)', () => {
      const res = generateSmartResponse('what is xyzabc123456');
      expect(res).toContain('Grade 6 Lessons');
      expect(res).toContain('Flashcards');
    });

    it('TC34: Normalizes multiple spaces correctly', () => {
      expect(normalizeText('  xin   chào   bạn   ')).toBe('xin chào bạn');
    });

    it('TC35: Correctly detects English query markers', () => {
      expect(isEnglishQuery('How to use this web?')).toBe(true);
      expect(isEnglishQuery('cách sử dụng trang web')).toBe(false);
    });
  });
});
