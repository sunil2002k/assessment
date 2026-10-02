import { Router } from "express";
import { AppDataSource } from "../db/data-source";
import { Lead } from "../db/entities/Lead";
import { User } from "../db/entities/User";
import { requireAuth } from "../middleware/auth";
import { createLeadSchema } from "../schemas";

const router = Router();
router.use(requireAuth);

interface LeadWithOwner extends Lead {
  owner_name: string;
}

router.get("/", async (req, res) => {
  const { id, role } = req.user!;
  const leadsRepository = AppDataSource.getRepository(Lead);
  const leads =
    role === "admin"
      ? await AppDataSource.getRepository(Lead)
          .createQueryBuilder("lead")
          .innerJoin(User, "owner", "owner.id = lead.owner_id")
          .select("lead")
          .addSelect("owner.name", "owner_name")
          .orderBy("lead.created_at", "DESC")
          .addOrderBy("lead.id", "DESC")
          .getRawAndEntities()
          .then(
            ({ entities, raw }) =>
              entities.map((lead, index) => ({
                ...lead,
                owner_name: (raw[index] as { owner_name: string }).owner_name,
              })) as LeadWithOwner[],
          )
      : await leadsRepository.find({
          where: { owner_id: id },
          order: { created_at: "DESC", id: "DESC" },
        });
  res.json({ leads });
});

router.post("/", async (req, res) => {
  const data = createLeadSchema.parse(req.body);
  const lead = await AppDataSource.getRepository(Lead).save(
    AppDataSource.getRepository(Lead).create({
      ...data,
      owner_id: req.user!.id,
    }),
  );
  res.status(201).json({ lead });
});

export default router;
