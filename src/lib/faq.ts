/**
 * FAQ bersama untuk halaman /jasa dan /tentang-kami.
 *
 * Dipisah dari komponen supaya teks yang tampil dan FAQPage JSON-LD selalu
 * identik — Google memvalidasi keduanya harus sama.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const SERVICE_FAQS: FaqItem[] = [
  {
    q: 'Apakah saya harus membeli komponen di KSS Komputer?',
    a: 'Tidak. Anda boleh membawa komponen sendiri. Kami tetap melakukan pengecekan kompatibilitas dan kondisi fisik sebelum perakitan.',
  },
  {
    q: 'Berapa lama pengerjaan rakit PC?',
    a: 'Rakit standar 1 - 3 hari kerja, tergantung antrean dan ketersediaan komponen. Paket premium 2 - 4 hari kerja karena cable management dan dokumentasi build.',
  },
  {
    q: 'Apakah ada garansi untuk jasa servis?',
    a: 'Ya. Pengerjaan jasa bergaransi toko. Jika keluhan yang sama muncul kembali dalam masa garansi, pengecekan ulang tidak dikenakan biaya jasa.',
  },
  {
    q: 'Bisakah booking di luar jam operasional?',
    a: 'Jadwal normal Senin - Sabtu, 09:00 - 18:00 WIB. Untuk kebutuhan mendesak, silakan chat teknisi via WhatsApp terlebih dahulu.',
  },
  {
    q: 'Apakah data saya aman saat instalasi ulang?',
    a: 'Backup data tersedia sebagai opsi tambahan. Tanpa backup, proses fresh install akan menghapus data pada partisi sistem.',
  },
];

export const STORE_FAQS: FaqItem[] = [
  {
    q: 'Apakah KSS Komputer hanya toko online?',
    a: 'Bukan. KSS Komputer adalah bengkel rakit dan servis PC dengan lokasi fisik di Mangga Dua Mall, Jakarta. Anda bisa datang langsung untuk konsultasi, perakitan, maupun klaim garansi.',
  },
  {
    q: 'Bagaimana prosedur klaim garansi?',
    a: 'Hubungi teknisi via WhatsApp dengan menyertakan kode order atau nota. Unit akan dicek ulang untuk memastikan penyebab masalah. Jika termasuk cakupan garansi, perbaikan dilakukan tanpa biaya jasa.',
  },
  {
    q: 'Apakah komponen yang dibeli di luar KSS bisa dirakit?',
    a: 'Bisa. Kami tetap memeriksa kompatibilitas, kelengkapan aksesori, dan kondisi fisik komponen sebelum proses perakitan dimulai.',
  },
  {
    q: 'Berapa lama stress test sebelum unit diserahkan?',
    a: 'Unit rakitan menjalani stress test dan QC. Durasi menyesuaikan kompleksitas build; hasil pengujian suhu dan stabilitas dilaporkan saat serah terima.',
  },
  {
    q: 'Apakah bisa kirim unit ke luar kota?',
    a: 'Bisa dengan packing kayu dan ekspedisi berasuransi. Biaya packing serta ongkir dihitung terpisah sesuai ukuran dan tujuan.',
  },
];
