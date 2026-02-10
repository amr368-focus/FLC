import { useState, type FormEvent } from 'react';
import { Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  domain: string;
  companyName: string;
  onAuthenticate: (email: string) => void;
}

export function AuthModal({ isOpen, domain, companyName, onAuthenticate }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      setError('Please enter your company email.');
      return;
    }

    if (!normalized.endsWith(`@${domain}`)) {
      setError(`Use your @${domain} email to continue.`);
      return;
    }

    setError(null);
    onAuthenticate(normalized);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
              <Lock className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sign in required</h2>
              <p className="text-sm text-gray-500">Restricted access for {companyName} team members</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="auth-email">
              Work email
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-200">
              <Mail className="h-4 w-4 text-gray-400" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={`name@${domain}`}
                className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            className="btn-teal w-full rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            Continue
          </button>

          <p className="text-xs text-gray-500">
            This is a lightweight access gate. For stronger security, connect an SSO or identity provider.
          </p>
        </form>
      </div>
    </div>
  );
}
