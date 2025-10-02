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

// The prompt generation logic is moved to the backend function.
function createPrompt(data: RPMInput): string {
  const {
    teacherName,
    teacherNip,
    className,
    subject,
    learningObjectives,
    subjectMatter,
    language,
    meetings,
    pedagogicalPractices,
    graduateDimensions
  } = data;

  const practicesText = pedagogicalPractices
    .map((practice, index) => `Pertemuan ${index + 1}: ${practice}`)
    .join(', ');

  return `
    Anda adalah asisten ahli dalam pembuatan Rencana Pembelajaran Mendalam (RPM) untuk kurikulum madrasah di Indonesia, khususnya untuk MTsN 4 Jombang.

    Berdasarkan input berikut:
    - Nama Guru: ${teacherName}
    - NIP Guru: ${teacherNip}
    - Kelas: ${className}
    - Mata Pelajaran: ${subject}
    - Tujuan Pembelajaran: ${learningObjectives}
    - Materi Pelajaran: ${subjectMatter}
    - Bahasa Pembuka/Penutup: ${language}
    - Jumlah Pertemuan: ${meetings}
    - Praktik Pedagogis per Pertemuan: ${practicesText}
    - Dimensi Lulusan: ${graduateDimensions.join(', ')}

    Tugas Anda adalah membuat dokumen RPM yang lengkap, terstruktur, dan siap pakai dalam format HTML. Ikuti struktur dan instruksi di bawah ini dengan SANGAT TELITI menggunakan Ejaan Bahasa Indonesia yang baik dan benar.

    **ATURAN KRITIS UNTUK WARNA TEKS:**
    - Semua teks HARUS berwarna gelap (hitam atau abu-abu sangat gelap, contoh: #000000 atau #333333).
    - JANGAN PERNAH menggunakan teks berwarna putih, kuning, atau warna terang lainnya.
    - JANGAN PERNAH menyertakan properti CSS \`color: ...\` dengan nilai warna terang (misalnya, \`color: white\`) di dalam atribut \`style\` mana pun. Teks harus terlihat jelas di atas latar belakang putih.

    Jangan gunakan sintaks Markdown seperti **teks tebal** di dalam output HTML Anda; sebagai gantinya, gunakan tag HTML yang sesuai seperti \`<b>\` atau \`<strong>\`.

    **STRUKTUR OUTPUT HTML UTAMA:**

    Gunakan sebuah div kontainer utama dengan gaya \`style="color: #000;"\`. Di dalamnya, buatlah struktur berikut:

    1.  **Tabel RPM (Dua Kolom):** Buat sebuah tabel HTML (\`<table>\`) dengan kelas 'w-full border-collapse'. Kolom pertama adalah "Komponen" dan kedua "Isi". 
        - Gunakan \`<thead>\` untuk header.
        - Gunakan \`<tbody>\` untuk konten.
        - Untuk setiap baris komponen, gunakan \`<tr>\`.
        - Kolom "Komponen" (\`<td>\`) harus bold dan rata atas (\`style="font-weight: bold; vertical-align: top; width: 30%; padding: 8px; border: 1px solid #ddd;"\`).
        - Kolom "Isi" (\`<td>\`) harus rata kanan-kiri (\`style="text-align: justify; padding: 8px; border: 1px solid #ddd;"\`).
        - Untuk header seksi seperti "IDENTITAS", gunakan \`<tr style="background-color: #f2f2f2;"><td colspan="2" style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">NAMA SEKSI</td></tr>\`.

    **Isi Tabel RPM:**

    a. **IDENTITAS**
       - Nama Madrasah: MTsN 4 Jombang
       - Mata Pelajaran: ${subject}
       - Kelas/Semester: ${className} / [Generate semester ganjil/genap secara logis]
       - Durasi Pertemuan: ${meetings} x (2 x 40 menit)

    b. **IDENTIFIKASI**
       - Siswa: Generate deskripsi singkat karakteristik umum siswa kelas ${className} di madrasah tsanawiyah.
       - Materi Pelajaran: ${subjectMatter}
       - Capaian Dimensi Lulusan: ${graduateDimensions.join(', ')}
       - Topik Panca Cinta: Pilih 2-3 dimensi Kurikulum Berbasis Cinta (KBC) yang paling relevan dari [Cinta Allah dan Rasul-Nya, Cinta Ilmu, Cinta Lingkungan, Cinta Diri dan Sesama, Cinta Tanah Air] berdasarkan materi pelajaran.
       - Materi Insersi: Untuk setiap Topik Panca Cinta yang dipilih, tuliskan satu kalimat singkat yang menggambarkan nilai cinta yang diintegrasikan dalam pembelajaran.

    c. **DESAIN PEMBELAJARAN**
       - Lintas Disiplin Ilmu: Generate 1-2 disiplin ilmu lain yang relevan dengan materi.
       - Tujuan Pembelajaran: ${learningObjectives}
       - Topik Pembelajaran: Buat judul topik yang lebih spesifik dan menarik dari input 'Materi Pelajaran'.
       - Praktik Pedagogis per Pertemuan: ${practicesText}
       - Kemitraan Pembelajaran: Generate saran kemitraan yang relevan (misal: orang tua, perpustakaan sekolah).
       - Lingkungan Pembelajaran: Generate saran lingkungan belajar yang sesuai (misal: di dalam kelas, di luar kelas, laboratorium).
       - Pemanfaatan Digital: Generate saran tools digital relevan beserta tautan (contoh: Quizizz, Canva, YouTube).

    d. **PENGALAMAN BELAJAR**
       - Memahami (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan awal. **Mulai kegiatan awal ini dengan salam pembuka yang sesuai dalam ${language}.** Setelah menjelaskan tujuan, tambahkan satu paragraf singkat untuk membangun koneksi emosional siswa dengan mengaitkan materi pada salah satu nilai KBC.
       - Mengaplikasi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan inti detail sesuai sintaks dari praktik pedagogis (${practicesText}). Tambahkan instruksi spesifik untuk mendorong refleksi nilai KBC dalam aktivitas.
       - Refleksi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan penutup. **Akhiri kegiatan penutup ini dengan salam penutup yang sesuai dalam ${language}.**

    e. **ASESMEN PEMBELAJARAN**
       - Asesmen Awal (diagnostik/apersepsi): Jelaskan metode asesmen awal (misal: pertanyaan pemantik lisan).
       - Asesmen Formatif (for/as learning): Jelaskan metode asesmen formatif (misal: observasi, penilaian LKPD).
       - Asesmen Sumatif (of learning): Jelaskan metode asesmen sumatif (misal: tes tulis, penilaian proyek).

    2.  **Tanda Tangan:** Setelah tabel utama, buatlah sebuah tabel baru untuk bagian tanda tangan dengan gaya \`<table style="width: 100%; margin-top: 40px; border: none;">\`. Tabel ini harus memiliki satu baris (\`<tr>\`) dan dua kolom (\`<td>\`).
        - Kolom kiri: \`<td style="width: 50%; vertical-align: top; border: none;">Mengetahui,<br/>Kepala MTsN 4 Jombang<br/><br/><br/><br/><b>Sulthon Sulaiman, M.Pd.I.</b><br/>NIP. 19810616 2005011003</td>\`
        - Kolom kanan: \`<td style="width: 50%; vertical-align: top; border: none;">Jombang, [Generate tanggal hari ini format DD MMMM YYYY]<br/>Guru Mata Pelajaran<br/><br/><br/><br/><b>${teacherName}</b><br/>NIP. ${teacherNip}</td>\`

    3.  **LAMPIRAN:** Gunakan \`<div style="page-break-before: always;">\` untuk memulai di halaman baru.
        - \`<h2>Lampiran</h2>\`
        - **Lampiran 1: Lembar Kerja Peserta Didik (LKPD)** (Buat LKPD yang LENGKAP)
          - \`<h3>A. Identitas</h3>\` (Nama, Kelas, No. Absen, dll.)
          - \`<h3>B. Petunjuk Penggunaan</h3>\`
          - \`<h3>C. Kegiatan Pembelajaran</h3>\` (Integrasikan sintaks dan pengalaman belajar tanpa tabel)
            - \`<h4>1. Memahami</h4>\` (Sajikan materi singkat + 3 pertanyaan pemahaman)
            - \`<h4>2. Mengaplikasikan</h4>\` (1 tugas studi kasus nyata + instruksi)
            - \`<h4>3. Merefleksikan</h4>\` (2-3 pertanyaan refleksi)
          - \`<h3>D. Penutup</h3>\` (Kata penyemangat + checklist pemahaman diri)
        - **Lampiran 2: Instrumen Asesmen**
          - \`<h4>Asesmen Awal</h4>\` (Buat 5 soal [pilih tipe soal yang sesuai] beserta kunci jawabannya)
          - \`<h4>Rubrik Penilaian Sikap</h4>\` (Buat tabel HTML 4x5 untuk menilai sikap)
          - \`<h4>Rubrik Penilaian Pengetahuan</h4>\` (Buat tabel HTML 4x5 untuk menilai pengetahuan)
          - \`<h4>Rubrik Penilaian Keterampilan</h4>\` (Buat tabel HTML 4x5 untuk menilai keterampilan)

    Pastikan seluruh output adalah satu blok kode HTML yang valid dan rapi.
    `;
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
    const model = 'gemini-2.5-flash';
    const prompt = createPrompt(data);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
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
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal pada server AI.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Gagal menghasilkan RPM dari layanan AI: ${errorMessage}` }),
    };
  }
};

export { handler };
