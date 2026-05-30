import { NextResponse } from 'next/server';
import { dbPool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { portofolio_id, bulan_dimajukan } = body;

    // 1. Validasi Input
    if (!portofolio_id || bulan_dimajukan === undefined) {
      return NextResponse.json(
        { success: false, error: 'Input tidak lengkap. Harus mengirimkan portofolio_id dan bulan_dimajukan.' },
        { status: 400 }
      );
    }

    const months = parseInt(bulan_dimajukan);
    if (isNaN(months) || months < 0) {
      return NextResponse.json(
        { success: false, error: 'bulan_dimajukan harus berupa angka integer non-negatif.' },
        { status: 400 }
      );
    }

    // 2. Jalankan Query Update Time Travel
    // Mundurkan tgl_mulai sebesar 'bulan_dimajukan' bulan, dan set tgl_jatuh_tempo ke saat ini (NOW())
    const [result]: any = await dbPool.query(
      `UPDATE portofolio 
       SET tgl_mulai = DATE_SUB(tgl_mulai, INTERVAL ? MONTH),
           tgl_jatuh_tempo = NOW()
       WHERE id = ?`,
      [months, portofolio_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Portofolio tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 3. Ambil data terbaru hasil update untuk dikembalikan dalam respon
    const [updatedPortofolio]: any = await dbPool.query(
      'SELECT * FROM portofolio WHERE id = ?',
      [portofolio_id]
    );

    return NextResponse.json({
      success: true,
      message: `Time-travel berhasil! Tanggal mulai portofolio dimundurkan ${months} bulan dan tgl_jatuh_tempo diset menjadi hari ini.`,
      data: updatedPortofolio[0]
    });

  } catch (error: any) {
    console.error('Error in POST /api/investasi/demo-time-travel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
