import { NextResponse } from 'next/server';
import { dbPool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, produk_id, nominal } = body;

    // 1. Validasi Input Dasar
    if (!user_id || !produk_id || nominal === undefined) {
      return NextResponse.json(
        { success: false, error: 'Input tidak lengkap. Harus mengirimkan user_id, produk_id, dan nominal.' },
        { status: 400 }
      );
    }

    const nominalNum = parseFloat(nominal);
    if (isNaN(nominalNum) || nominalNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Nominal investasi harus berupa angka positif.' },
        { status: 400 }
      );
    }

    // 2. Membuka Koneksi Database & Mulai Transaksi
    const connection = await dbPool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 3. Mengambil Data User (Mengunci Baris untuk Mencegah Race Condition dengan FOR UPDATE)
      const [users]: any = await connection.query(
        'SELECT * FROM users WHERE id = ? FOR UPDATE',
        [user_id]
      );

      if (users.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: 'User tidak ditemukan.' },
          { status: 404 }
        );
      }
      const user = users[0];

      // 4. Mengambil Data Produk Investasi
      const [products]: any = await connection.query(
        'SELECT * FROM produk_investasi WHERE id = ?',
        [produk_id]
      );

      if (products.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: 'Produk investasi tidak ditemukan.' },
          { status: 404 }
        );
      }
      const product = products[0];

      const saldoUtamaNum = parseFloat(user.saldo_utama);
      const minInvestNum = parseFloat(product.min_invest);

      // 5. Validasi Aturan Investasi
      if (nominalNum > saldoUtamaNum) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: 'Saldo tidak cukup untuk melakukan investasi ini.' },
          { status: 400 }
        );
      }

      if (nominalNum < minInvestNum) {
        await connection.rollback();
        return NextResponse.json(
          { 
            success: false, 
            error: `Nominal investasi Rp${nominalNum.toLocaleString('id-ID')} kurang dari batas minimal Rp${minInvestNum.toLocaleString('id-ID')}.` 
          },
          { status: 400 }
        );
      }

      // 6. Jalankan Perubahan: Kurangi Saldo Utama User
      await connection.query(
        'UPDATE users SET saldo_utama = saldo_utama - ? WHERE id = ?',
        [nominalNum, user_id]
      );

      // 7. Jalankan Perubahan: Insert ke Tabel Portofolio
      // Jika produk bertipe 'tenor', hitung tgl_jatuh_tempo = DATE_ADD(NOW(), INTERVAL tenor_bulan MONTH)
      // Jika produk bertipe 'liquid', tgl_jatuh_tempo = NULL
      if (product.tipe === 'tenor') {
        await connection.query(
          `INSERT INTO portofolio (user_id, produk_id, nominal_investasi, tgl_mulai, tgl_jatuh_tempo, status) 
           VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MONTH), 'aktif')`,
          [user_id, produk_id, nominalNum, product.tenor_bulan]
        );
      } else {
        await connection.query(
          `INSERT INTO portofolio (user_id, produk_id, nominal_investasi, tgl_mulai, tgl_jatuh_tempo, status) 
           VALUES (?, ?, ?, NOW(), NULL, 'aktif')`,
          [user_id, produk_id, nominalNum]
        );
      }

      // 8. Commit Transaksi
      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Investasi berhasil dibeli.',
        data: {
          user_id,
          produk_id,
          nominal_investasi: nominalNum,
          produk: product.nama_produk
        }
      });

    } catch (transactionError: any) {
      // Rollback jika ada error SQL di tengah transaksi
      await connection.rollback();
      throw transactionError;
    } finally {
      // Selalu release koneksi kembali ke pool
      connection.release();
    }

  } catch (error: any) {
    console.error('Error in POST /api/investasi/beli:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
