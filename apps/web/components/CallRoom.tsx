'use client';

import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

interface CallRoomProps {
  roomId: string;
  snapshotEndpoint: string;
}

export function CallRoom({ roomId, snapshotEndpoint }: CallRoomProps) {
  const [peerId, setPeerId] = useState<string>();
  const [remoteId, setRemoteId] = useState('');
  const [networkWarning, setNetworkWarning] = useState(false);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer>();

  useEffect(() => {
    const connection = (navigator as any).connection;
    const handleConnectionChange = () => {
      if (connection && ['slow-2g', '2g'].includes(connection.effectiveType)) {
        setNetworkWarning(true);
      } else {
        setNetworkWarning(false);
      }
    };
    handleConnectionChange();
    connection?.addEventListener('change', handleConnectionChange);

    const peer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });
    peerRef.current = peer;
    peer.on('open', (id) => setPeerId(id));
    peer.on('call', (call) => {
      navigator.mediaDevices
        .getUserMedia(getConstraints())
        .then((stream) => {
          if (localVideo.current) {
            localVideo.current.srcObject = stream;
            localVideo.current.play().catch(() => {});
          }
          call.answer(stream);
          call.on('stream', (remote) => {
            if (remoteVideo.current) {
              remoteVideo.current.srcObject = remote;
              remoteVideo.current.play().catch(() => {});
            }
          });
        })
        .catch(() => {});
    });
    return () => {
      connection?.removeEventListener('change', handleConnectionChange);
      peer.destroy();
    };
  }, [roomId]);

  function getConstraints() {
    const connection = (navigator as any).connection;
    if (connection && (connection.saveData || ['slow-2g', '2g'].includes(connection.effectiveType))) {
      return { video: false, audio: true };
    }
    return { video: true, audio: true };
  }

  function startCall() {
    navigator.mediaDevices
      .getUserMedia(getConstraints())
      .then((stream) => {
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
          localVideo.current.play().catch(() => {});
        }
        const call = peerRef.current?.call(remoteId, stream);
        call?.on('stream', (remote) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = remote;
            remoteVideo.current.play().catch(() => {});
          }
        });
      })
      .catch(() => {});
  }

  async function captureSnapshot() {
    const video = remoteVideo.current || localVideo.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    await fetch(`${apiBase}${snapshotEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    }).catch(() => {});
  }

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <video ref={localVideo} muted className="w-1/2 bg-black" />
        <video ref={remoteVideo} className="w-1/2 bg-black" />
      </div>
      {networkWarning && (
        <p className="text-yellow-600">Network is weak - using audio only.</p>
      )}
      <div className="flex space-x-2 items-center">
        <span className="text-sm">Your ID: {peerId}</span>
        <input
          className="border px-2 py-1 text-sm"
          value={remoteId}
          onChange={(e) => setRemoteId(e.target.value)}
          placeholder="Remote ID"
        />
        <button
          onClick={startCall}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Call
        </button>
        <button
          onClick={captureSnapshot}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Capture Snapshot
        </button>
      </div>
    </div>
  );
}

