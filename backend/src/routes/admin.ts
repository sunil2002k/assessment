import { Router } from "express";
import { AppDataSource } from "../db/data-source";
import { User } from "../db/entities/User";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/users", async (_req, res) => {
  const users = await AppDataSource.getRepository(User).find({
    select: ["id", "name", "email", "role", "created_at"],
    order: { id: "ASC" },
  });
  res.json({ users });
});

export default router;
