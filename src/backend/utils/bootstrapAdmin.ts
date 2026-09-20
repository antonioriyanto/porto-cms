import { db } from '../../db';
import { adminUsers } from '../../db/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function bootstrap() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.error('Please set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD in your environment variables.');
    process.exit(1);
  }

  const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  if (existing.length > 0) {
    console.log(`Admin user ${email} already exists.`);
    process.exit(0);
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  await db.insert(adminUsers).values({
    email,
    passwordHash,
    role: 'SUPER_ADMIN',
  });

  console.log(`Admin user ${email} successfully created.`);
  process.exit(0);
}

bootstrap().catch(console.error);
