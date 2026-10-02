import { CookieOptions, Response, Router } from "express";
import { config } from "../config";
import { HttpError } from "../errors";
import { ACCESS_COOKIE, REFRESH_COOKIE, requireAuth } from "../middleware/auth";
import { loginSchema } from "../schemas";
import * as auth from "../services/auth";

const router = Router();

const REFRESH_PATH = "/api/auth";
const base: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.cookieSecure,
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...base,
    path: "/",
    maxAge: config.accessTtlMin * 60_000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    path: REFRESH_PATH,
    maxAge: config.refreshTtlDays * 86_400_000,
  });
}

// clearCookie must use the same path the cookie was set with
function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...base, path: "/" });
  res.clearCookie(REFRESH_COOKIE, { ...base, path: REFRESH_PATH });
}

router.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await auth.login(email, password);
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ user });
});

router.post("/refresh", async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) throw new HttpError(401, "No refresh token");
  try {
    const { user, accessToken, refreshToken } =
      await auth.rotateRefreshToken(raw);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user });
  } catch (err) {
    clearAuthCookies(res);
    throw err;
  }
});

// Works with an expired access token: only the refresh cookie is needed to revoke.
router.post("/logout", async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (raw) await auth.revokeRefreshToken(raw);
  clearAuthCookies(res);
  res.status(204).end();
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await auth.getUserById(req.user!.id);
  if (!user) throw new HttpError(401, "User no longer exists");
  res.json({ user });
});

export default router;
