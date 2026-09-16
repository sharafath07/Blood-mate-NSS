import prisma from "../config/database.js";

export async function getStudents() {
    return prisma.student.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

export async function getStudentById(id: string) {
    return prisma.student.findUnique({
        where: {
            id,
        },
    });
}