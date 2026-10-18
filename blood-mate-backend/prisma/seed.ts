
import "dotenv/config";
import bcrypt from "bcryptjs";

import prisma from "../src/config/database.js";
import { UserRole } from "../src/generated/prisma/client.js";

async function main() {
    const accounts = [
        {
            name: "Blood Mate Admin",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: UserRole.ADMIN,
        },
        {
            name: "Blood Mate Volunteer",
            email: process.env.VOLUNTEER_EMAIL,
            password: process.env.VOLUNTEER_PASSWORD,
            role: UserRole.VOLUNTEER,
        },
    ];

    for (const account of accounts) {
        if (!account.email || !account.password) {
            throw new Error(
                `Missing email or password for role ${account.role}. ` +
                "Check your .env file."
            );
        }

        if (account.password.length < 8) {
            throw new Error(
                `Password for ${account.role} must be at least 8 characters.`
            );
        }
    }

    if (accounts[0].email === accounts[1].email) {
        throw new Error(
            "Admin and volunteer must have different email addresses."
        );
    }

    for (const account of accounts) {
        const passwordHash = await bcrypt.hash(account.password!, 12);

        const existingUser = await prisma.user.findUnique({
            where: { email: account.email! },
        });

        if (existingUser) {
            await prisma.user.update({
                where: { email: account.email! },
                data: {
                    name: account.name,
                    role: account.role,
                },
            });

            console.log(
                `Updated ${account.role} account: ${account.email} ` +
                "(existing password preserved)"
            );
        } else {
            await prisma.user.create({
                data: {
                    name: account.name,
                    email: account.email!,
                    passwordHash,
                    role: account.role,
                },
            });

            console.log(
                `Created ${account.role} account: ${account.email}`
            );
        }
    }

    console.log("Blood Mate account seeding completed.");
}

main()
    .catch((error) => {
        console.error("Failed to seed accounts:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
