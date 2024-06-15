import { Prisma } from '@prisma/client'
import db from './db'
import CyrillicToTranslit from 'cyrillic-to-translit-js'

// Constants
import { ESex } from '../constants/sex'

export async function getRandom(
    id: bigint,
    sex: number,
    lookingFor: number,
    city: string,
    minAgeRange: number,
    maxAgeRange: number,
    lat: number,
    lng: number
) {
    const cyrillicToTranslit = new (CyrillicToTranslit as any)()
    const translittedCity = cyrillicToTranslit.transform(city)

    const lookingForQuery =
        lookingFor === ESex.NOT_IMPORTANT ? Prisma.empty : Prisma.sql`AND sex = ${lookingFor}`

    return await db.$queryRaw<
        {
            id: bigint
            name: string
            age: number
            description: string
            city: string
            sex: number
            lookingFor: number
            ageRange: string
            disabled: boolean
            lng: number
            lat: number
            premium: number
        }[]
    >`
        SELECT
            users.*,
            (6371 * acos(cos(radians(${lat})) * cos(radians(users.lat)) * cos(radians(users.lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(users.lat)))) AS distance
        FROM users
        LEFT JOIN matches
            ON ((matches.firstUserId = ${id} AND matches.secondUserId = users.id) OR (matches.firstUserId = users.id AND matches.secondUserId = ${id}))
            AND matches.isConfirmed IS NULL
        LEFT JOIN attachments ON attachments.userId = ${id}
        WHERE (LOWER(city) = LOWER(${city}) OR LOWER(city) = LOWER(${translittedCity}))
        AND users.id != ${id}
        AND (lookingFor = ${sex} OR lookingFor = ${ESex.NOT_IMPORTANT})
        ${lookingForQuery}
        AND (age >= ${minAgeRange} AND age <= ${maxAgeRange})
        AND disabled = 0
        AND attachments.id IS NOT NULL
        AND matches.id IS NULL
        ORDER BY RAND(), distance
        LIMIT 1
    `
}

export async function get(id: bigint) {
    return await db.users.findFirst({
        select: {
            id: true,
            name: true,
            age: true,
            description: true,
            city: true,
            sex: true,
            lookingFor: true,
            ageRange: true,
            disabled: true,
            lng: true,
            lat: true,
            premium: true
        },
        where: {
            id
        }
    })
}

export async function create(
    id: bigint,
    name: string = '',
    age: number = 0,
    description: string = '',
    city: string = '',
    disabled: boolean = true
) {
    return await db.users.create({
        data: {
            id,
            name,
            age,
            description,
            city,
            disabled
        }
    })
}

export async function updatePremium(id: bigint, date: number) {
    return await db.users.update({
        data: {
            premium: date
        },
        where: {
            id
        }
    })
}

export async function updateName(id: bigint, name: string) {
    return await db.users.update({
        data: {
            name
        },
        where: {
            id
        }
    })
}

export async function updateAge(id: bigint, age: number) {
    return await db.users.update({
        data: {
            age
        },
        where: {
            id
        }
    })
}

export async function updateCity(id: bigint, city: string) {
    return await db.users.update({
        data: {
            city
        },
        where: {
            id
        }
    })
}

export async function updateDescription(id: bigint, description: string) {
    return await db.users.update({
        data: {
            description
        },
        where: {
            id
        }
    })
}

export async function updateSex(id: bigint, sex: number) {
    return await db.users.update({
        data: {
            sex
        },
        where: {
            id
        }
    })
}

export async function updateLookingFor(id: bigint, lookingFor: number) {
    return await db.users.update({
        data: {
            lookingFor
        },
        where: {
            id
        }
    })
}

export async function updateAgeRange(id: bigint, minusRange: number, plusRange: number) {
    return await db.users.update({
        data: {
            ageRange: `${minusRange},${plusRange}`
        },
        where: {
            id
        }
    })
}

export async function updateDisabled(id: bigint, disabled: boolean) {
    return await db.users.update({
        data: {
            disabled
        },
        where: {
            id
        }
    })
}

export async function updateLocation(id: bigint, lat: number, lng: number) {
    return await db.users.update({
        data: {
            lat,
            lng
        },
        where: {
            id
        }
    })
}

export type TUser = Awaited<ReturnType<typeof get>>
