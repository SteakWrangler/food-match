
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Copy } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  roomId: string;
  participants: Array<{ id: string; name: string }>;
  onClose: () => void;
  onContinue?: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ roomId, participants, onClose, onContinue }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const roomUrl = `${window.location.origin}?room=${roomId}`;

  useEffect(() => {
    QRCode.toDataURL(roomUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    }).then(setQrCodeUrl);
  }, [roomUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Share Room</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className="text-center space-y-3 sm:space-y-4 md:space-y-6">
            <div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4">
                Have others scan this QR code or share the link:
              </p>
              
              {qrCodeUrl && (
                <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="Room QR Code"
                    className="w-20 h-20 sm:w-48 sm:h-48 md:w-56 md:h-56 border-2 border-gray-200 rounded-xl sm:rounded-2xl"
                  />
                </div>
              )}

              {/* Room Code Section */}
              <div className="bg-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Room Code</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-800 font-mono">{roomId}</p>
                  </div>
                  <Button
                    onClick={copyRoomCode}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-xs sm:text-sm text-gray-700 font-mono break-all">
                {roomUrl}
              </div>
            </div>

            <Button
              onClick={copyToClipboard}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-sm sm:text-base"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>

            {onContinue && (
              <Button
                onClick={onContinue}
                variant="outline"
                className="w-full border-orange-200 hover:bg-orange-50 text-sm sm:text-base"
              >
                Continue to Room
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QRCodeModal;
