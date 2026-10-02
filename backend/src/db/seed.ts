import bcrypt from 'bcryptjs';
import { In } from 'typeorm';
import { AppDataSource } from './data-source';
import { Lead, type LeadStatus } from './entities/Lead';
import { User } from './entities/User';

const users = [
  { name: 'Alice Admin', email: 'admin@leaddesk.test', password: 'Admin@123', role: 'admin' },
  { name: 'Mike Member', email: 'member@leaddesk.test', password: 'Member@123', role: 'member' },
] as const;

const sampleLeads = (
  prefix: string,
): Pick<Lead, 'name' | 'email' | 'company' | 'website' | 'status'>[] => [
  { name: 'Priya Sharma', email: `priya.${prefix}@acme.example`, company: 'Acme Corp', website: 'https://acme.example', status: 'new' },
  { name: 'Tom Becker', email: `tom.${prefix}@globex.example`, company: 'Globex', website: null, status: 'contacted' },
  { name: 'Lena Novak', email: `lena.${prefix}@initech.example`, company: 'Initech', website: 'https://initech.example', status: 'qualified' },
  { name: 'Omar Haddad', email: `omar.${prefix}@umbrella.example`, company: 'Umbrella', website: null, status: 'lost' },
];

// Idempotent: safe to run on every container start.
export async function seed(): Promise<void> {
  const usersRepository = AppDataSource.getRepository(User);
  const leadsRepository = AppDataSource.getRepository(Lead);

  for (const u of users) {
    await usersRepository
      .createQueryBuilder()
      .insert()
      .values({
        name: u.name,
        email: u.email,
        password_hash: await bcrypt.hash(u.password, 10),
        role: u.role,
      })
      .orIgnore()
      .execute();

    const user = await usersRepository.findOneByOrFail({ email: u.email });
    const samples = sampleLeads(u.role);
    const existingSamples = await leadsRepository.findBy({
      owner_id: user.id,
      email: In(samples.map((lead) => lead.email)),
    });
    const existingEmails = new Set(existingSamples.map((lead) => lead.email));
    const missingSamples = samples.filter((lead) => !existingEmails.has(lead.email));
    if (missingSamples.length > 0)
      await leadsRepository.insert(missingSamples.map((lead) => ({ ...lead, owner_id: user.id })));
  }
}
