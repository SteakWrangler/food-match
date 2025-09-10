
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
        const success = await onJoinRoom(roomId.trim(), name.trim());
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-in">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Join Room</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 text-sm sm:text-base">Enter unique name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter unique name"
                className="mt-1 text-sm sm:text-base"
                autoFocus={!initialRoomId}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="roomId" className="text-gray-700 text-sm sm:text-base">Room ID</Label>
              <Input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="mt-1 text-sm sm:text-base"
                autoFocus={!!initialRoomId}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-xs sm:text-sm">{error}</div>
            )}

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1 text-sm sm:text-base"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-sm sm:text-base"
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
