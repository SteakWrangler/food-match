
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface JoinRoomModalProps {
  roomId?: string;
  onJoinRoom: (roomId: string, name: string) => Promise<boolean>;
  onClose: () => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ roomId: initialRoomId, onJoinRoom, onClose }) => {
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomId.trim()) {
      setIsLoading(true);
      setError('');
      try {
        const success = await onJoinRoom(roomId.trim().toUpperCase(), name.trim());
        if (!success) {
          setError('Room not found. Please check the room ID.');
        }
      } catch (error) {
        setError('Failed to join room. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Join Room</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
                autoFocus={!initialRoomId}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="roomId" className="text-gray-700">Room ID</Label>
              <Input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID"
                className="mt-1"
                autoFocus={!!initialRoomId}
                disabled={!!initialRoomId || isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                disabled={!name.trim() || !roomId.trim() || isLoading}
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default JoinRoomModal;
