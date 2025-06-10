import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface RSVPData {
  inviteCode: string;
  primaryGuest: {
    name: string;
    phone: string;
  };
  additionalGuests: string[];
  submittedAt: string;
  totalGuests: number;
}

export async function GET() {
  try {
    // Query only used invitations
    const invitesRef = collection(db, 'invites');
    const usedInvitesQuery = query(invitesRef, where('isUsed', '==', true));
    const querySnapshot = await getDocs(usedInvitesQuery);
    
    const rsvpData: RSVPData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rsvpData.push({
        inviteCode: doc.id,
        primaryGuest: data.primaryGuest,
        additionalGuests: data.additionalGuests || [],
        submittedAt: data.modifiedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        totalGuests: 1 + (data.additionalGuests?.length || 0)
      });
    });

    // Sort by submission date (most recent first)
    rsvpData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const totalFamilies = rsvpData.length;
    const totalGuests = rsvpData.reduce((sum, family) => sum + family.totalGuests, 0);

    return NextResponse.json({
      success: true,
      data: rsvpData,
      summary: {
        totalFamilies,
        totalGuests,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching RSVP data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RSVP data' },
      { status: 500 }
    );
  }
} 