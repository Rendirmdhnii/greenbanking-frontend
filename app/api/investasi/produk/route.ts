import { NextResponse } from 'next/server';
import { dbPool } from '@/lib/db';

// Menonaktifkan caching dinamis agar data selalu ter-update dari database
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await dbPool.query('SELECT * FROM produk_investasi');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching produk_investasi:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
