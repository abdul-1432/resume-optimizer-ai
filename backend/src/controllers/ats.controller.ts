import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { z } from 'zod';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
export const atsUpload = upload.single('resume');

function extractTextFromBuffer(filename: string, buf: Buffer): Promise<string> {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return pdfParse(buf).then((d: any) => d.text as string);
  }
  if (lower.endsWith('.docx')) {
    return mammoth.extractRawText({ buffer: buf }).then((r) => r.value as string);
  }
  // fallback for txt/others
  return Promise.resolve(buf.toString('utf8'));
}

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreResume(resume: string, jd: string) {
  const rTokens = new Set(tokenize(resume));
  const jTokens = tokenize(jd);
  const total = jTokens.length || 1;
  let matched = 0;
  const missing: string[] = [];
  for (const t of jTokens) {
    if (rTokens.has(t)) matched++; else missing.push(t);
  }
  const score = Math.round((matched / total) * 100);
  return { score, missingKeywords: Array.from(new Set(missing)).slice(0, 50) };
}

export async function analyze(req: Request, res: Response, next: NextFunction) {
  try {
    const jdSchema = z.object({ jd: z.string().min(10) });
    const { jd } = jdSchema.parse({ jd: req.body.jd });
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume file is required (pdf, docx, or txt)' });
    }
    const resumeText = await extractTextFromBuffer(req.file.originalname, req.file.buffer);
    const { score, missingKeywords } = scoreResume(resumeText, jd);
    res.json({ success: true, data: { score, missingKeywords, resumeText } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return next({ statusCode: 400, message: 'JD too short' });
    next(err);
  }
}

export async function enhance(req: Request, res: Response, next: NextFunction) {
  try {
    const bodySchema = z.object({ resumeText: z.string().min(20), missingKeywords: z.array(z.string()).optional(), jd: z.string().optional() });
    const { resumeText, missingKeywords = [], jd = '' } = bodySchema.parse(req.body);

    const clusters: Record<string, string[]> = {
      python: ['numpy', 'pandas', 'scikit', 'scikit-learn', 'sklearn', 'django', 'flask', 'fastapi', 'tensorflow', 'pytorch'],
      javascript: ['react', 'node', 'node.js', 'vue', 'angular', 'express'],
      typescript: ['react', 'node', 'nestjs', 'next.js', 'nextjs'],
      java: ['spring', 'springboot', 'hibernate'],
      csharp: ['.net', 'asp.net', 'entity framework'],
      data: ['sql', 'nosql', 'mongodb', 'postgres', 'mysql', 'etl', 'airflow', 'dbt'],
      cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
    };

    const text = resumeText;
    const sentences = text.split(/(?<=[\.!?])\s+|\n+/);
    const lower = text.toLowerCase();

    const missingUnique = Array.from(new Set(missingKeywords.map((k) => k.toLowerCase())));

    // Map missing keywords to clusters based on base skill presence
    const injections: Record<number, string[]> = {};

    function findSentenceIndexWith(term: string): number {
      const idx = sentences.findIndex((s) => s.toLowerCase().includes(term));
      return idx >= 0 ? idx : 0;
    }

    const handled = new Set<string>();

    Object.entries(clusters).forEach(([base, extras]) => {
      if (lower.includes(base)) {
        const relevant = missingUnique.filter((m) => m.includes(base) || extras.some((e) => m.includes(e)));
        if (relevant.length) {
          const sIdx = findSentenceIndexWith(base);
          injections[sIdx] = (injections[sIdx] || []).concat(relevant);
          relevant.forEach((r) => handled.add(r));
        }
      }
    });

    const remaining = missingUnique.filter((m) => !handled.has(m));
    if (remaining.length) {
      injections[0] = (injections[0] || []).concat(remaining);
    }

    // Build updated content by weaving keywords into existing sentences
    const updatedSentences = sentences.map((s, i) => {
      const add = injections[i];
      if (!add || add.length === 0) return s;
      // create phrase like: " including Django framework, NumPy library"
      const phrase = ' including ' + Array.from(new Set(add)).slice(0, 8).map((k) => {
        if (k.includes('django')) return 'Django framework';
        if (k.includes('numpy')) return 'NumPy library';
        if (k.includes('react')) return 'React';
        if (k.includes('node')) return 'Node.js';
        return k;
      }).join(', ');
      // inject before final punctuation if present
      const m = s.match(/[\.!?]$/);
      if (m) return s.slice(0, -1) + phrase + s.slice(-1);
      return s + phrase;
    });

    const updatedResume = updatedSentences.join('\n');

    const { score: newScore, missingKeywords: stillMissing } = scoreResume(updatedResume, jd);

    res.json({ success: true, data: { updatedResume, newScore, stillMissing } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return next({ statusCode: 400, message: 'Invalid input' });
    next(err);
  }
}

export async function scoreText(req: Request, res: Response, next: NextFunction) {
  try {
    const bodySchema = z.object({ resumeText: z.string().min(20), jd: z.string().min(10) });
    const { resumeText, jd } = bodySchema.parse(req.body);
    const { score, missingKeywords } = scoreResume(resumeText, jd);
    res.json({ success: true, data: { score, missingKeywords } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return next({ statusCode: 400, message: 'Invalid input' });
    next(err);
  }
}
