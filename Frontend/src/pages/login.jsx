import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';


import { useLogin } from '../hooks/useAuth';
import { loginSchema } from '../schema/authschema';

export default function Login() {
  const { mutate: login, isPending, error: serverError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 border-r border-zinc-900 
                      flex-col justify-between p-12">
        <span className="text-red-500 font-bold text-xl tracking-tight">TrialGuard</span>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Never <span className="text-red-500">Pay</span> for a<br />
            Trial You Forgot<br />About
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Track your free trials, get reminders before they end,
            and stay in control of your subscriptions.
          </p>
        </div>
        <p className="text-zinc-600 text-xs">Your Free Trials | Under Control</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <span className="text-red-500 font-bold text-xl">TrialGuard</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-zinc-500 text-sm mb-8">Sign in to your account to continue</p>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400
                            rounded-lg px-4 py-3 mb-6 text-sm">
              {serverError.response?.data?.message || 'Something went wrong'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-zinc-900 border border-zinc-800 text-white 
                           rounded-lg px-4 py-3 text-sm placeholder-zinc-600
                           focus:outline-none focus:border-red-500/50 focus:ring-1 
                           focus:ring-red-500/20 transition-all"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 text-white 
                           rounded-lg px-4 py-3 text-sm placeholder-zinc-600
                           focus:outline-none focus:border-red-500/50 focus:ring-1 
                           focus:ring-red-500/20 transition-all"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40
                         disabled:cursor-not-allowed text-white font-medium rounded-lg 
                         py-3 text-sm transition-colors"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-zinc-600 text-sm text-center mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-400 hover:text-red-300 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}