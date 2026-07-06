import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import logo from "../../assets/preproute-logo.jpg";
import loginIllustration from "../../assets/login-illustration.jpg";

const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      navigate("/dashboard");
    } catch {
      // error
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-brand-semi-white">
      <div className="hidden lg:flex lg:w-[710px] shrink-0 items-center justify-center relative overflow-hidden">
        <img
          src={loginIllustration}
          alt="Person working at a laptop"
          className="w-[70%] max-w-[420px] object-contain"
        />
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px] bg-bg-page rounded-xl border border-border-light p-8 lg:p-0 lg:bg-transparent lg:border-none">
          <div className="flex items-center gap-2 mb-8">
            <img src={logo} alt="PrepRoute" className="h-8 w-auto" />
          </div>

          <h1 className="text-xl font-semibold text-text-primary mb-1">
            Login
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Use your company provided Login credentials
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                User ID
              </label>
              <input
                type="text"
                placeholder="Enter User ID"
                className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                {...register("userId")}
              />
              {errors.userId && (
                <p className="text-xs text-danger mt-1">
                  {errors.userId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-danger mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button type="button" className="text-sm text-brand font-medium">
              Forgot password?
            </button>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}