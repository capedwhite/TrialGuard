import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <nav className="border-b border-zinc-900 bg-black px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <span className="text-red-500 font-bold text-xl tracking-tight">
          TrialGuard
        </span>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 text-sm hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="text-sm text-zinc-400 hover:text-white border border-zinc-800 
                       hover:border-zinc-600 rounded-lg px-4 py-2 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </nav>
  );
}