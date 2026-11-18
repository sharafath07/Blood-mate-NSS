import "dotenv/config";
import app from "./app.js";
import prisma from "./config/database.js";

async function start() {
    const port = Number(process.env.PORT || 5000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid API port");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
    if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
        throw new Error("Production JWT_SECRET must have at least 32 characters");
    }
    await prisma.$queryRaw`SELECT 1`;

    const server = app.listen(port, () => console.log(`Blood Mate API listening on port ${port}`));
    server.on("error", (error) => {
        console.error("API listener failed", error.name);
        void prisma.$disconnect().finally(() => process.exit(1));
    });

    function stop() {
        const deadline = setTimeout(() => server.closeAllConnections(), 10000);
        deadline.unref();
        server.close(() => {
            clearTimeout(deadline);
            void prisma.$disconnect();
        });
    }
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
}

void start().catch(async (error: unknown) => {
    console.error("API startup failed:", error instanceof Error && error.name === "Error" ? error.message : "Database unavailable");
    await prisma.$disconnect();
    process.exitCode = 1;
});
