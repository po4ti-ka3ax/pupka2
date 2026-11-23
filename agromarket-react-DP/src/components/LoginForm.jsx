import { useContext, useState } from "react";
import { apiFetch, errorMessages } from "../api.js";
import { AuthContext } from "../context/AuthContext.jsx";

export default function LoginForm({ onLogin, initialMode = "login" }) {
  // Внутри <AuthProvider> вход сохраняется в контекст; onLogin — чтобы переопределить
  const auth = useContext(AuthContext);
  const handleLogin = onLogin ?? auth?.login;

  const [mode, setMode] = useState(initialMode); // 'login' или 'register'
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return; // повторный клик во время запроса ничего не шлёт
    setErrors([]);
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      // /auth/login или /auth/register — оба возвращают { user, token }
      const result = await apiFetch(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      handleLogin?.(result.user, result.token);
    } catch (err) {
      // 401 — «Неверный e-mail или пароль», 429 — «Слишком много попыток...»,
      // 400 — список ошибок из details (ЛР11)
      setErrors(errorMessages(err));
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h3>{isLogin ? "Вход" : "Регистрация"}</h3>

      {!isLogin && (
        <>
          <label htmlFor="name">Имя</label>
          <input id="name" name="name" placeholder="Имя" required />
        </>
      )}

      <label htmlFor="email">E-mail</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        required
      />

      <label htmlFor="password">Пароль</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Пароль (от 8 символов)"
        required
        minLength={8}
      />

      {errors.length > 0 && (
        <div role="alert" className="error">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Подождите…" : isLogin ? "Войти" : "Зарегистрироваться"}
      </button>
      <button
        type="button"
        onClick={() => {
          setErrors([]);
          setMode(isLogin ? "register" : "login");
        }}
      >
        {isLogin ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
      </button>
    </form>
  );
}
