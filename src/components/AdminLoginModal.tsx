import React, { useState } from 'react';
import { ShieldCheck, Lock, LogIn, X, AlertCircle, RefreshCw } from 'lucide-react';
import { loginWithGoogle, ADMIN_EMAILS, ADMIN_PASSCODE, isUserAdmin } from '../firebase';
import { User } from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminEmail: string) => void;
  highContrast?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  highContrast = false,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user: User | null = await loginWithGoogle();
      if (user) {
        if (isUserAdmin(user)) {
          onSuccess(user.email || 'sun@suwonrehab.or.kr');
          onClose();
        } else {
          setErrorMessage(
            `로그인하신 계정(${user.email})은 관리자 권한이 없습니다. 관리자 계정(${ADMIN_EMAILS[0]})으로 로그인하거나 실무자 보안 비밀번호를 입력해 주세요.`
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('구글 로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!passcode.trim()) {
      setErrorMessage('실무자 보안 비밀번호를 입력해 주세요.');
      return;
    }

    if (passcode.trim() === ADMIN_PASSCODE) {
      onSuccess('sun@suwonrehab.or.kr (실무자 인증)');
      onClose();
    } else {
      setErrorMessage('비밀번호가 올바르지 않습니다. 수원시장애인종합복지관 실무자 비밀번호를 확인해 주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all border ${
        highContrast
          ? 'bg-zinc-950 text-yellow-300 border-yellow-400'
          : 'bg-white text-slate-800 border-slate-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                복지관 관리자 모드 로그인
              </h3>
              <p className="text-xs text-slate-500">
                수원시장애인종합복지관 실무자 전용 시스템
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Option 1: Official Google Login */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-xs font-bold text-slate-700">
              방법 1: 복지관 관리자 계정 로그인
            </p>
            <p className="text-[11px] text-slate-500">
              관리자 계정: <span className="font-semibold text-emerald-700">{ADMIN_EMAILS[0]}</span>
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <LogIn className="w-4 h-4 text-emerald-600" />
              )}
              <span>구글 계정으로 관리자 로그인</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-semibold">또는</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Option 2: Quick Passcode Login */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                방법 2: 실무자 보안 비밀번호 입력
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="실무자 비밀번호 입력"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                공용 PC 등에서 구글 로그인 없이 즉시 관리자로 전환할 수 있습니다.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>관리자 모드로 입장</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            취소하고 일반 모드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
