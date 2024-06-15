import db from './db'

export async function createMatch(firstUserId: bigint, secondUserId: bigint, message: string = '') {
    return await db.matches.create({
        data: {
            firstUserId,
            secondUserId,
            message
        }
    })
}

export async function getMatch(firstUserId: bigint, secondUserId: bigint) {
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

export async function getMatchById(id: bigint) {
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

export async function getUncheckedMatch(secondUserId: bigint) {
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

export async function getLastUncheckedMatch(secondUserId: bigint) {
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

export async function updateConfirm(isConfirmed: boolean, id: bigint) {
    return await db.matches.update({
        where: {
            id
        },
        data: {
            isConfirmed
        }
    })
}
