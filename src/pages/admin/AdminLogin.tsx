import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onLogin: () => void;
  onNavigateHome: () => void;
}

const ADMIN_PASS = "admin123";

export default function AdminLogin({ onLogin, onNavigateHome }: Props) {
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);

  const handleLogin = () => {
    if (pass === ADMIN_PASS) {
      onLogin();
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[hsl(var(--muted))]">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[hsl(var(--border))] p-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--terra))] flex items-center justify-center">
            <Icon name="Shield" size={18} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[hsl(var(--foreground))]">Админ-панель</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">НавигаторПомощи</div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Пароль</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setPassError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Введите пароль..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition ${passError ? "border-red-400 bg-red-50" : "border-[hsl(var(--border))]"}`}
            />
            {passError && <p className="text-xs text-red-600 mt-1">Неверный пароль</p>}
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-semibold hover:bg-[hsl(16,55%,42%)] transition-colors"
          >
            Войти
          </button>
        </div>
        <button
          onClick={onNavigateHome}
          className="mt-4 w-full text-center text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--terra))] transition-colors"
        >
          ← Вернуться на сайт
        </button>
      </div>
    </div>
  );
}
