import mammoth from "mammoth";
import pdf from "pdf-parse";

export async function parseResumeFile(file) {
  if (!file) throw new Error("No resume file was provided.");
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const result = await pdf(file.buffer);
    return result.text;
  }
  if (file.mimetype.includes("wordprocessingml") || file.originalname.toLowerCase().endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  if (file.mimetype.startsWith("text/") || file.originalname.toLowerCase().endsWith(".txt")) return file.buffer.toString("utf8");
  throw new Error("Supported resume formats are PDF, DOCX and TXT.");
}
