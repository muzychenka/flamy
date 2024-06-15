import { Context } from 'telegraf'

export interface AppContext extends Context {
    session?: SessionData
}

interface SessionData {
    selectedMedia: number
    editStep: number
    isEdit: boolean
    isSearch: boolean
    isApplicationReady: boolean
    currentApplicationId: bigint
    lastApplicationId: bigint
    matchApplicationId: bigint
    isMessaging: boolean
}
