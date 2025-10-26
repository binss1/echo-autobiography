import jsPDF from 'jspdf';

interface Chapter {
  title: string;
  content: any; // Tiptap JSON
}

interface ProjectData {
  title: string;
  chapters: Chapter[];
  author?: string;
}

/**
 * Tiptap JSON을 HTML 텍스트로 변환
 */
function tiptapToText(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;

  let text = '';

  if (content.content && Array.isArray(content.content)) {
    for (const node of content.content) {
      if (node.type === 'paragraph') {
        if (node.content && Array.isArray(node.content)) {
          for (const inlineNode of node.content) {
            if (inlineNode.type === 'text') {
              text += inlineNode.text;
            }
          }
        }
        text += '\n\n';
      } else if (node.type === 'heading') {
        text += '\n';
      }
    }
  }

  return text;
}

/**
 * 프로젝트 데이터를 PDF로 변환
 */
export async function generatePDF(data: ProjectData): Promise<Uint8Array> {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // 폰트 설정 (한글 지원)
  doc.setFont('helvetica');

  // 표지
  doc.setFontSize(20);
  doc.text(data.title, pageWidth / 2, 80, { align: 'center', maxWidth });

  if (data.author) {
    doc.setFontSize(14);
    doc.text(`저자: ${data.author}`, pageWidth / 2, 100, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.text(
    new Date().toLocaleDateString('ko-KR'),
    pageWidth / 2,
    110,
    { align: 'center' }
  );

  yPos = 140;

  // 챕터들
  for (const chapter of data.chapters) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    // 챕터 제목
    doc.setFontSize(16);
    doc.text(chapter.title, margin, yPos);
    yPos += 15;

    // 챕터 내용
    doc.setFontSize(11);
    const content = tiptapToText(chapter.content);
    const lines = doc.splitTextToSize(content, maxWidth);

    for (const line of lines) {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 7;
    }

    yPos += 10; // 챕터 간 간격
  }

  return doc.output('arraybuffer') as unknown as Uint8Array;
}
