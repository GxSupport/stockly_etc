import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SmsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  onSuccess: () => void;
}

export default function SmsConfirmationModal({ 
  isOpen, 
  onClose, 
  documentId, 
  onSuccess 
}: SmsConfirmationModalProps) {
  const [token, setToken] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/documents/send-otp', {
        document_id: documentId,
        type: 'confirm',
      });

      if (response.data.success) {
        setToken(response.data.token);
        setOtpSent(true);
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setError('Ошибка при отправке кода. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`/documents/${documentId}/confirm-code`, {
        code: code,
        token: token,
      });

      if (response.data.success) {
        handleClose();
        // Small delay to ensure modal is closed before navigation
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      
      if (error.response?.data?.errors?.message) {
        setError(error.response.data.errors.message);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Неверный код подтверждения. Попробуйте еще раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setToken('');
    setCode('');
    setOtpSent(false);
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  // Send OTP automatically when modal opens
  useEffect(() => {
    if (isOpen && !otpSent && !token) {
      sendOtp();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>SMS подтверждение</DialogTitle>
          <DialogDescription>
            {otpSent 
              ? "Введите код, отправленный в Telegram-бот для подтверждения"
              : "Отправляем код подтверждения..."
            }
          </DialogDescription>
        </DialogHeader>

        {otpSent ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Введите код"
                  className="col-span-3"
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отменить
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !code}
              >
                {isSubmitting ? 'Подтверждение...' : 'Подтвердить'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center">
            {error ? (
              <div className="space-y-4">
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
                <Button onClick={sendOtp} disabled={isLoading}>
                  {isLoading ? 'Отправка...' : 'Попробовать еще раз'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Отправляем код подтверждения...</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}