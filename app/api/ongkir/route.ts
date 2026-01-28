import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const {
      courier,
      destination_city_id,
      weight
    } = await req.json();

    const response = await axios.post(
      'https://komerce.rajaongkir.com/api/v1/cost',
      {
        origin_city_id: 152,       // Jakarta (contoh)
        destination_city_id,       // HARUS ANGKA
        weight,                    // gram
        courier                    // jne | sicepat | pos
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KOMERCE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Ambil ongkir termurah
    const cost =
      response.data?.data?.[0]?.costs?.[0]?.cost?.[0]?.value || 0;

    return NextResponse.json({ cost });

  } catch (error: any) {
    console.error(
      'ONGKIR ERROR:',
      error.response?.data || error.message
    );

    return NextResponse.json(
      { message: 'Gagal cek ongkir' },
      { status: 500 }
    );
  }
}
