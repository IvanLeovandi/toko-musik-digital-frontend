import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const nfts = await prisma.nFT.findMany({
      where: { isCrowdFunding: false },
      include: {
        owner: {
          select: { email: true, walletAddress: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    const serialized = nfts.map(nft => ({
      ...nft,
      tokenId: nft.tokenId.toString(),
      createdAt: nft.createdAt.toISOString(),
      updatedAt: nft.updatedAt.toISOString()
    }))

    return NextResponse.json(serialized)
  } catch (err) {
    console.error('Error fetching NFTs:', err)
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
  }
}
