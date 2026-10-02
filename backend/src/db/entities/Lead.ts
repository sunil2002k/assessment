import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export type LeadStatus = "new" | "contacted" | "qualified" | "lost";

@Entity({ name: "leads" })
@Index("leads_owner_id_index", ["owner_id"])
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 100 })
  company!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  website!: string | null;

  @Column({ type: "varchar", length: 255, default: "new" })
  status!: LeadStatus;

  @Column({ type: "integer" })
  owner_id!: number;

  @Column({ type: "timestamptz", default: () => "now()" })
  created_at!: Date;
}
