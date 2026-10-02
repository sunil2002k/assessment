import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
@Index('refresh_tokens_user_id_index', ['user_id'])
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  user_id!: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  token_hash!: string;

  @Column({ type: 'timestamptz' })
  expires_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at!: Date | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at!: Date;
}
