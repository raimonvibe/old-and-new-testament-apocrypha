import { NextResponse } from 'next/server'
import apocryphaData from '@/data/apocrypha-data.json'

export async function GET() {
  return NextResponse.json(apocryphaData)
}
