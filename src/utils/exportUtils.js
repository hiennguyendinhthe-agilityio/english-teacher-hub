/**
 * Utility functions to export Lesson Data to Anki Flashcard format (.csv)
 * and Microsoft Word document (.doc) with clean formatting.
 */

// 1. Export Vocabulary to Anki / Quizlet CSV
export function exportToAnkiCsv(vocabularyList, unitTitle = 'Vocabulary') {
  if (!vocabularyList || !vocabularyList.length) return;

  // Header
  const rows = [
    ['Word', 'Phonetics', 'Part of Speech', 'Vietnamese Meaning', 'Unit']
  ];

  vocabularyList.forEach(item => {
    rows.push([
      `"${(item.word || '').replace(/"/g, '""')}"`,
      `"${(item.transcription || '').replace(/"/g, '""')}"`,
      `"${(item.type || '').replace(/"/g, '""')}"`,
      `"${(item.meaning || '').replace(/"/g, '""')}"`,
      `"${unitTitle.replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanTitle = unitTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `anki_${cleanTitle}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 2. Export Entire Lesson Plan / Unit to Word (.doc)
export function exportLessonToWordDoc(lessonData) {
  if (!lessonData) return;

  const vocabHtml = (lessonData.vocabulary || []).map((v, i) => `
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${i + 1}</td>
      <td style="border: 1px solid #ccc; padding: 8px; font-weight: bold; color: #4338ca;">${v.word}</td>
      <td style="border: 1px solid #ccc; padding: 8px; font-style: italic; color: #6b7280;">${v.transcription || ''}</td>
      <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${v.type || ''}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">${v.meaning || ''}</td>
    </tr>
  `).join('');

  const grammarHtml = (lessonData.grammar || []).map(g => `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #4338ca; border-bottom: 2px solid #e0e7ff; padding-bottom: 4px;">${g.title}</h3>
      ${(g.sections || []).map(sec => `
        <div style="margin-left: 15px; margin-bottom: 12px;">
          <h4 style="color: #1f2937; margin-bottom: 6px;">${sec.subtitle}</h4>
          ${sec.points ? `<ul>${sec.points.map(p => `<li style="line-height: 1.6; margin-bottom: 4px;">${p}</li>`).join('')}</ul>` : ''}
          ${sec.formulas ? sec.formulas.map(f => `
            <div style="background: #f3f4f6; padding: 8px 12px; border-left: 4px solid #4338ca; margin: 6px 0; font-family: monospace;">
              <strong>${f.type}:</strong> ${f.text}
            </div>
          `).join('') : ''}
        </div>
      `).join('')}
    </div>
  `).join('');

  const practiceHtml = (lessonData.practice || []).map((q, i) => `
    <div style="margin-bottom: 15px; padding: 10px; background: #faf5ff; border-radius: 6px; border: 1px solid #f3e8ff;">
      <p style="font-weight: bold; margin-bottom: 6px;">Question ${i + 1}: ${q.question}</p>
      <div style="margin-left: 20px;">
        ${(q.options || []).map((opt, optIdx) => `
          <p style="margin: 3px 0; ${optIdx === q.correctAnswer ? 'color: #059669; font-weight: bold;' : ''}">
            ${String.fromCharCode(65 + optIdx)}. ${opt} ${optIdx === q.correctAnswer ? ' ✓ (Key)' : ''}
          </p>
        `).join('')}
      </div>
    </div>
  `).join('');

  const documentContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${lessonData.title}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #111827; }
        h1 { color: #3730a3; text-align: center; font-size: 20pt; margin-bottom: 10px; }
        h2 { color: #4338ca; font-size: 16pt; border-bottom: 2px solid #4338ca; margin-top: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
        th { background-color: #e0e7ff; color: #3730a3; border: 1px solid #ccc; padding: 10px; }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 11pt; color: #6b7280; margin: 0;">ENGLISH TEACHING TOOLKIT & CURRICULUM</p>
        <h1>${lessonData.title}</h1>
        <p style="font-size: 11pt; color: #4b5563;">Interactive Teaching Material & Student Worksheets</p>
      </div>

      <h2>I. VOCABULARY LIST</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">No.</th>
            <th style="width: 25%;">Word</th>
            <th style="width: 25%;">Phonetics</th>
            <th style="width: 10%;">Type</th>
            <th style="width: 35%;">Vietnamese Meaning</th>
          </tr>
        </thead>
        <tbody>
          ${vocabHtml}
        </tbody>
      </table>

      <h2>II. GRAMMAR & PRONUNCIATION</h2>
      ${grammarHtml}

      <h2>III. PRACTICE & QUIZZES (WITH ANSWER KEY)</h2>
      ${practiceHtml}

      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 10pt; color: #9ca3af;">
        Generated by Ms Van's English Class AI Toolkit · For Educational Use Only
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + documentContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanTitle = (lessonData.title || 'lesson').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${cleanTitle}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
