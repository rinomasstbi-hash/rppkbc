import type { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

// Types need to be redefined here as the function is self-contained.
enum PedagogicalPractice {
  INQUIRY_DISCOVERY = 'Inkuiri-Discovery',
  PJBL = 'PjBL',
  PROBLEM_SOLVING = 'Problem Solving',
  GAME_BASED = 'Game Based Learning',
  STATION_LEARNING = 'Station Learning',
}

enum GraduateDimension {
  FAITH = 'Keimanan & Ketakwaan',
  CITIZENSHIP = 'Kewargaan',
  CRITICAL_REASONING = 'Penalaran Kritis',
  CREATIVITY = 'Kreativitas',
  COLLABORATION = 'Kolaborasi',
  INDEPENDENCE = 'Kemandirian',
  HEALTH = 'Kesehatan',
  COMMUNICATION = 'Komunikasi',
}

interface RPMInput {
  teacherName: string;
  teacherNip: string;
  className: string;
  subject: string;
  learningObjectives: string;
  subjectMatter: string;
  language: 'Bahasa Inggris' | 'Bahasa Arab';
  meetings: number;
  pedagogicalPractices: PedagogicalPractice[];
  graduateDimensions: GraduateDimension[];
}


const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Konfigurasi API Key tidak ditemukan di server. Pastikan variabel API_KEY sudah diatur di Netlify." })
    };
  }

  try {
    const data: RPMInput = JSON.parse(event.body || '{}');
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `Anda adalah asisten ahli dalam pembuatan Rencana Pembelajaran Mendalam (RPM) untuk kurikulum madrasah di Indonesia. Tugas Anda adalah membuat dokumen RPM yang lengkap dan siap pakai dalam format HTML berdasarkan data yang diberikan pengguna.

**ATURAN OUTPUT HTML YANG KETAT:**
1.  **Format Wajib:** Seluruh output HARUS berupa satu blok kode HTML yang valid. Jangan sertakan \`\`\`html atau markdown lainnya.
2.  **Warna Teks:** Semua teks HARUS berwarna gelap (hitam atau #333333) agar dapat dicetak dengan baik. JANGAN PERNAH menggunakan \`color: white\` atau warna terang lainnya pada styling.
3.  **Styling:** Gunakan tag HTML seperti \`<b>\` untuk teks tebal, bukan sintaks Markdown.
4.  **Bahasa:** Gunakan Ejaan Bahasa Indonesia (EBI) yang baik dan benar.

**DETAIL STRUKTUR & KONTEN HTML:**

1.  **Kontainer Utama:** Gunakan sebuah div kontainer utama dengan gaya \`style="color: #000;"\`.

2.  **Tabel RPM Utama (\`<table class='w-full border-collapse'>\`):**
    -   Terdiri dari dua kolom: "Komponen" (lebar 30%, bold, rata atas) dan "Isi" (rata kanan-kiri).
    -   Gaya sel: \`padding: 8px; border: 1px solid #ddd;\`.
    -   Header seksi (IDENTITAS, dll.) menggunakan \`<tr style="background-color: #f2f2f2;"><td colspan="2" style="font-weight: bold; ...">\`.
    -   **Isi Seksi:**
        -   **IDENTITAS:**
            -   Nama Madrasah: MTsN 4 Jombang
            -   Kelas/Semester: [Kelas dari input] / [Generate semester ganjil/genap secara logis]
            -   Durasi Pertemuan: [Jumlah dari input] x (2 x 40 menit)
        -   **IDENTIFIKASI:**
            -   Siswa: Generate deskripsi singkat karakteristik umum siswa kelas tersebut.
            -   Topik Panca Cinta: Pilih 2-3 dimensi KBC yang paling relevan dari [Cinta Allah dan Rasul-Nya, Cinta Ilmu, Cinta Lingkungan, Cinta Diri dan Sesama, Cinta Tanah Air].
            -   Materi Insersi: Tuliskan satu kalimat singkat integrasi nilai untuk setiap Topik Panca Cinta yang dipilih.
        -   **DESAIN PEMBELAJARAN:**
            -   Lintas Disiplin Ilmu: Generate 1-2 disiplin ilmu lain yang relevan.
            -   Topik Pembelajaran: Buat judul topik yang menarik dari materi pelajaran.
            -   Kemitraan & Lingkungan: Generate saran relevan.
            -   Pemanfaatan Digital: Generate saran tools digital relevan beserta tautan.
        -   **PENGALAMAN BELAJAR:**
            -   Memahami (Kegiatan Awal): Mulai dengan salam pembuka dalam bahasa yang diminta. Tambahkan paragraf koneksi emosional KBC.
            -   Mengaplikasi (Kegiatan Inti): Detailkan langkah sesuai sintaks praktik pedagogis yang diberikan.
            -   Refleksi (Kegiatan Penutup): Akhiri dengan salam penutup dalam bahasa yang diminta.
        -   **ASESMEN PEMBELAJARAN:** Jelaskan metode untuk asesmen Awal, Formatif, dan Sumatif.

3.  **Tabel Tanda Tangan (\`<table style="width: 100%; margin-top: 40px; border: none;">\`):**
    -   Kolom kiri: Mengetahui, Kepala MTsN 4 Jombang (Sulthon Sulaiman, M.Pd.I., NIP. 19810616 2005011003).
    -   Kolom kanan: Jombang, [Generate tanggal hari ini format DD MMMM YYYY], Guru Mata Pelajaran ([Nama Guru], NIP. [NIP Guru]).

4.  **LAMPIRAN (Gunakan \`<div style="page-break-before: always;">\`):**
    -   **Lampiran 1: LKPD:** Harus LENGKAP dengan bagian Identitas, Petunjuk, Kegiatan Pembelajaran (Memahami, Mengaplikasikan, Merefleksikan dengan tugas dan pertanyaan konkret), dan Penutup.
    -   **Lampiran 2: Instrumen Asesmen:**
        -   Asesmen Awal: Buat 5 soal (tipe soal sesuai materi) beserta kunci jawabannya.
        -   Rubrik Penilaian: Buat 3 tabel HTML terpisah (4x5) untuk rubrik penilaian Sikap, Pengetahuan, dan Keterampilan.`;

    const userPrompt = `
      Buatkan saya RPM HTML berdasarkan data berikut. Ikuti semua aturan dan struktur yang diberikan dalam System Instruction.

      **DATA INPUT:**
      - Nama Guru: ${data.teacherName}
      - NIP Guru: ${data.teacherNip}
      - Kelas: ${data.className}
      - Mata Pelajaran: ${data.subject}
      - Tujuan Pembelajaran: ${data.learningObjectives}
      - Materi Pelajaran: ${data.subjectMatter}
      - Bahasa Pembuka/Penutup: ${data.language}
      - Jumlah Pertemuan: ${data.meetings}
      - Praktik Pedagogis per Pertemuan: ${data.pedagogicalPractices.map((p, i) => `Pertemuan ${i + 1}: ${p}`).join(', ')}
      - Dimensi Lulusan: ${data.graduateDimensions.join(', ')}

      **PENGINGAT STRUKTUR UTAMA YANG DIMINTA:**
      1.  **Tabel RPM Utama:** Dengan seksi IDENTITAS, IDENTIFIKASI, DESAIN PEMBELAJARAN, PENGALAMAN BELAJAR, ASESMEN PEMBELAJARAN.
      2.  **Tabel Tanda Tangan:** Untuk Kepala Sekolah dan Guru.
      3.  **Lampiran (di halaman baru):** Lampiran 1 (LKPD) dan Lampiran 2 (Instrumen Asesmen).
      
      Pastikan untuk men-generate konten untuk semua bagian yang diminta (misalnya deskripsi siswa, Topik Panca Cinta, asesmen, isi LKPD, dan rubrik).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
          systemInstruction: systemInstruction,
      }
    });

    let cleanedText = response.text.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    cleanedText = cleanedText.replace(/style="([^"]*)"/g, (match, styleString) => {
      const newStyle = styleString.replace(/color\s*:[^;]+;?/gi, ' ');
      return `style="${newStyle.trim()}"`;
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rpm: cleanedText }),
    };
  } catch (error) {
    console.error("Error in Netlify function:", error);
    let userFriendlyMessage = "Terjadi kesalahan internal pada server AI.";

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key not valid')) {
            userFriendlyMessage = "API Key yang Anda gunakan tidak valid. Mohon periksa kembali kunci Anda di pengaturan environment Netlify.";
        } else if (errorMessage.includes('billing') || errorMessage.includes('billing account')) {
            userFriendlyMessage = "Proyek Google Cloud Anda tidak memiliki akun penagihan (billing) yang aktif. Gemini API memerlukannya untuk berfungsi. Silakan aktifkan penagihan di Google Cloud Console.";
        } else if (errorMessage.includes('permission denied') || errorMessage.includes('generative language api has not been used')) {
             userFriendlyMessage = "API Key tidak memiliki izin yang diperlukan. Pastikan 'Generative Language API' telah diaktifkan di Google Cloud Console Anda.";
        } else if (errorMessage.includes('quota')) {
            userFriendlyMessage = "Anda telah melebihi kuota penggunaan API. Silakan coba lagi nanti atau periksa kuota Anda di Google Cloud Console.";
        } else {
            userFriendlyMessage = error.message; // Fallback to the original, more technical message if it's a different issue.
        }
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Gagal menghasilkan RPM dari layanan AI: ${userFriendlyMessage}` }),
    };
  }
};

export { handler };