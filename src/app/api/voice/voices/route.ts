import { NextResponse } from 'next/server'

const VOICES = [
  {
    id: 'VsQmyFHffusQDewmHB5v',
    name: 'Eddie Stirling',
    description: 'Confident and articulate male voice with a British accent',
    default: true,
  },
  {
    id: 'wWWn96OtTHu1sn8SRGEr',
    name: 'Hale',
    description: 'Warm and authoritative male voice',
    default: false,
  },
  {
    id: 'AXdMgz6evoL7OPd7eU12',
    name: 'Elizabeth',
    description: 'Clear and professional female voice',
    default: false,
  },
  {
    id: 'gJx1vCzNCD1EQHT212Ls',
    name: 'Ava',
    description: 'Friendly and expressive female voice',
    default: false,
  },
  {
    id: 'sB7vwSCyX0tQmU24cW2C',
    name: 'Jon',
    description: 'Deep and steady male voice',
    default: false,
  },
  {
    id: 'jqcCZkN6Knx8BJ5TBdYR',
    name: 'Zara',
    description: 'Smooth and engaging female voice',
    default: false,
  },
]

export async function GET() {
  return NextResponse.json({ voices: VOICES })
}
