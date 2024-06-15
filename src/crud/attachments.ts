import db from './db'

export async function createAttachment(userId: bigint, file: string, type: string) {
    return await db.attachments.create({
        data: {
            file,
            userId,
            type,
            time: Math.floor(Date.now() / 1000)
        }
    })
}

export async function getAttachments(userId: bigint) {
    return await db.attachments.findMany({
        select: {
            id: true,
            file: true,
            userId: true,
            type: true
        },
        where: {
            userId
        },
        orderBy: {
            id: 'desc'
        }
    })
}

export async function clearAttachments(userId: bigint) {
    return await db.attachments.deleteMany({
        where: {
            userId
        }
    })
}

export type TAttachments = Awaited<ReturnType<typeof getAttachments>>
