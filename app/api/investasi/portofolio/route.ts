import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'Parameter user_id diperlukan.' },
        { status: 400 }
      );
    }

    // Lakukan SELECT JOIN antara portofolio dan produk_investasi untuk user_id tertentu dengan status 'aktif'
    const [rows]: any = await dbPool.query(
      `SELECT 
        p.id, 
        p.user_id, 
        p.produk_id, 
        p.nominal_investasi, 
        p.tgl_mulai, 
        p.tgl_jatuh_tempo, 
        p.status,
        prod.nama_produk,
        prod.tipe,
        prod.bunga_pa,
        prod.tenor_bulan
       FROM portofolio p
       JOIN produk_investasi prod ON p.produk_id = prod.id
       WHERE p.user_id = ? AND p.status = 'aktif'`,
      [user_id]
    );

    const now = new Date();

    const result = rows.map((row: any) => {
      const tglMulai = new Date(row.tgl_mulai);
      const nominalInvestasi = parseFloat(row.nominal_investasi);
      const bungaPa = parseFloat(row.bunga_pa);

      // Hitung selisih_hari = (Tanggal Hari Ini - tgl_mulai)
      const diffTime = Math.max(0, now.getTime() - tglMulai.getTime());
      const selisih_hari = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Hitung estimasi_profit = nominal_investasi * (bunga_pa / 100) * (selisih_hari / 365)
      const estimasi_profit = nominalInvestasi * (bungaPa / 100) * (selisih_hari / 365);

      // Hitung is_locked (true jika waktu sekarang < tgl_jatuh_tempo untuk produk tenor)
      let is_locked = false;
      if (row.tipe === 'tenor' && row.tgl_jatuh_tempo) {
        const tglJatuhTempo = new Date(row.tgl_jatuh_tempo);
        is_locked = now.getTime() < tglJatuhTempo.getTime();
      }

      return {
        ...row,
        selisih_hari,
        estimasi_profit: parseFloat(estimasi_profit.toFixed(2)),
        is_locked
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in GET /api/investasi/portofolio:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
