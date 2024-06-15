// Constants
import { MAX_AGE, MIN_AGE } from '../constants/limitations'
import {
    LOOKING_FOR_FEMALE,
    LOOKING_FOR_MALE,
    LOOKING_FOR_NOT_IMPORTANT,
    LOOKING_FOR_MIN_AGE_RANGE,
    LOOKING_FOR_MAX_AGE_RANGE
} from '../constants/lookingFor'
import { SEX_FEMALE_LINE, SEX_MALE_LINE } from '../constants/sex'

export default function () {
    function isSexValid(value: string) {
        return [SEX_MALE_LINE, SEX_FEMALE_LINE].includes(value)
    }

    const isLookingForValid = (value: string) =>
        [LOOKING_FOR_FEMALE, LOOKING_FOR_MALE, LOOKING_FOR_NOT_IMPORTANT].includes(value)

    function isAgeRangeValid(range: number[]) {
        return (
            range[1] >= range[0] &&
            !isNaN(range[0]) &&
            !isNaN(range[1]) &&
            Math.abs(range[0]) <= LOOKING_FOR_MAX_AGE_RANGE &&
            Math.abs(range[1]) >= LOOKING_FOR_MIN_AGE_RANGE
        )
    }

    function isAgeValid(value: string) {
        const age = +value

        return !isNaN(age) && age > MIN_AGE && age <= MAX_AGE
    }

    return {
        isSexValid,
        isLookingForValid,
        isAgeRangeValid,
        isAgeValid
    }
}
