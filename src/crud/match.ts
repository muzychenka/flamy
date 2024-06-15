import db from './db'

export async function create(firstUserId: bigint, secondUserId: bigint, message: string = '') {
    return await db.matches.create({
        data: {
            firstUserId,
            secondUserId,
            message
        }
    })
}

export async function get(firstUserId: bigint, secondUserId: bigint) {
    return await db.matches.findFirst({
        select: {
            id: true,
            firstUserId: true,
            secondUserId: true,
            message: true
        },
        where: {
            firstUserId,
            secondUserId,
            isConfirmed: null
        }
    })
}

export async function getById(id: bigint) {
    return await db.matches.findFirst({
        select: {
            id: true,
            firstUserId: true,
            secondUserId: true,
            isConfirmed: true,
            message: true
        },
        where: {
            id
        }
    })
}

export async function getUnchecked(secondUserId: bigint) {
    return await db.matches.findFirst({
        select: {
            id: true,
            firstUserId: true,
            secondUserId: true,
            isConfirmed: true,
            message: true
        },
        where: {
            secondUserId,
            isConfirmed: null
        }
    })
}

export async function getLastUnchecked(secondUserId: bigint) {
    return await db.matches.findFirst({
        select: {
            id: true,
            firstUserId: true,
            secondUserId: true,
            isConfirmed: true,
            message: true
        },
        where: {
            secondUserId,
            isConfirmed: null
        }
    })
}

export async function updateConfirmation(isConfirmed: boolean, id: bigint) {
    return await db.matches.update({
        where: {
            id
        },
        data: {
            isConfirmed
        }
    })
}
