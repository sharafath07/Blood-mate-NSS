import type { Request, Response } from "express";
import { z } from "zod";
import { BloodGroup, RequestStatus, RequestUrgency } from "../generated/prisma/client.js";
import { createBloodRequest, deleteBloodRequest, getAllBloodRequests, getBloodRequestById, updateBloodRequest } from "../services/blood-request.service.js";
import { normalizePhone } from "../utils/phone.util.js";
import { RequestError } from "../utils/request-error.js";

const optionalText = z.string().trim().max(160).nullable().optional();
const requestInput = z.object({
    patientName: z.string().trim().min(1).max(160),
    bystanderName: z.string().trim().min(1).max(160),
    bystanderPhone: z.string().transform((text) => normalizePhone(text) ?? "")
        .refine((phone) => /^\+?[0-9]{8,15}$/.test(phone), "Invalid contact number"),
    hospital: z.string().trim().min(1).max(160),
    location: optionalText,
    bloodGroup: z.enum(BloodGroup),
    units: z.number().int().min(1).max(100).optional(),
    requiredAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)).nullable().optional(),
    urgency: z.enum(RequestUrgency).optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
});
const updateInput = requestInput.partial().extend({ status: z.enum(RequestStatus).optional() });

function failed(res: Response, error: unknown) {
    if (error instanceof RequestError) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Blood request operation failed", error instanceof Error ? error.name : "");
    return res.status(500).json({ success: false, message: "Blood request operation failed" });
}

export async function createRequest(req: Request, res: Response) {
    const parsed = requestInput.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid request details", issues: parsed.error.issues });
    }
    try {
        return res.status(201).json({ success: true, data: await createBloodRequest(parsed.data) });
    } catch (error) {
        return failed(res, error);
    }
}

export async function getRequests(req: Request, res: Response) {
    const query = z.object({
        limit: z.coerce.number().int().min(1).max(100).default(100),
        offset: z.coerce.number().int().min(0).max(1000000).default(0),
        summary: z.enum(["true", "false"]).default("false"),
        search: z.string().trim().max(160).optional(),
        status: z.enum(RequestStatus).optional(),
        urgency: z.enum(RequestUrgency).optional(),
        bloodGroup: z.enum(BloodGroup).optional(),
    }).safeParse(req.query);
    if (!query.success) return res.status(400).json({ success: false, message: "Invalid request pagination" });
    try {
        const { limit, offset, summary, ...filters } = query.data;
        return res.json({ success: true, data: await getAllBloodRequests(limit, offset, summary === "true", filters) });
    } catch (error) {
        return failed(res, error);
    }
}

export async function getRequestById(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== "string") return failed(res, new RequestError(400, "Invalid request ID"));
    try {
        const data = await getBloodRequestById(id);
        if (!data) throw new RequestError(404, "Blood request not found");
        return res.json({ success: true, data });
    } catch (error) {
        return failed(res, error);
    }
}

async function update(req: Request, res: Response, statusOnly: boolean) {
    const { id } = req.params;
    const parsed = (statusOnly ? z.object({ status: z.enum(RequestStatus) }) : updateInput).safeParse(req.body);
    if (typeof id !== "string" || !parsed.success || Object.keys(parsed.data).length === 0) {
        return res.status(400).json({ success: false, message: "Invalid request update" });
    }
    try {
        return res.json({ success: true, data: await updateBloodRequest(id, parsed.data) });
    } catch (error) {
        return failed(res, error);
    }
}

export const updateRequest = (req: Request, res: Response) => update(req, res, false);
export const updateRequestStatus = (req: Request, res: Response) => update(req, res, true);

export async function deleteRequest(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== "string") return failed(res, new RequestError(400, "Invalid request ID"));
    try {
        await deleteBloodRequest(id);
        return res.json({ success: true, message: "Blood request deleted" });
    } catch (error) {
        return failed(res, error);
    }
}
