import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions } from 'livekit-server-sdk';
import { RoomConfiguration } from '@livekit/protocol';

export const runtime = 'nodejs';
export const revalidate = 0;

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export async function POST(req: Request) {
  if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
    return new NextResponse('Missing environment variables', { status: 500 });
  }

const body = await req.json();  
const agentName: string | undefined = body?.room_config?.agents?.[0]?.agent_name;



const participantName = 'user';
const participantIdentity = `voice_user_${Math.floor(Math.random() * 10000)}`;
const roomName = `voice_room_${Math.floor(Math.random() * 10000)}`;


const token = createParticipantToken({ identity: participantIdentity }, roomName, agentName);

  return NextResponse.json({
    serverUrl: LIVEKIT_URL,
    room_name: roomName,
    participant_token: participantToken,
    participant_name: participantName,
  });
}

async function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentName?: string
): Promise<string> {
  const at = new AccessToken(API_KEY!, API_SECRET!, {
    ...userInfo,
    ttl: '15m',
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [{ agentName }],
    });
  }

  return await at.toJwt();
}
