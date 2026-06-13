export const BASE_RATE = 2000;

export const travelerMultipliers: Record<string, number> = {
    solo: 1.8,
    couple: 2.0,
    family: 3.5,
    school: 6.0,
    college: 6.0,
    corporate: 4.0,
};

export const packageMultipliers: Record<string, number> = {
    essential: 1.0,
    premium: 2.5,
};

export const mealMultipliers: Record<string, number> = {
    none: 0,
    breakfast: 0.15,
    half: 0.3,
    full: 0.5,
};

export const activityPrices: Record<string, number> = {
    meditation: 1500,
    cooking: 2000,
    photography: 2500,
    spa: 3500,
    adventure: 3000,
    cultural: 1500,
};

interface PricingInput {
    destinations: { id: string; days: number }[];
    travelerType: string;
    travelerCount: number;
    packageType: string;
    mealOption: string;
    activities: string[];
}

export function calculatePrice(data: PricingInput) {
    const totalDays = data.destinations.reduce(
        (acc, d) => acc + d.days,
        0
    );

    const baseCost =
        BASE_RATE *
        totalDays *
        (travelerMultipliers[data.travelerType] || 1);

    const packageCost =
        baseCost * (packageMultipliers[data.packageType] || 1);

    const mealCost =
        baseCost * (mealMultipliers[data.mealOption] || 0);

    const activitiesCost = data.activities.reduce(
        (acc, activity) =>
            acc +
            (activityPrices[activity] || 0) * data.travelerCount,
        0
    );

    const subtotal = packageCost + mealCost + activitiesCost;
    const discount = subtotal > 50000 ? subtotal * 0.1 : 0;

    return {
        totalDays,
        baseCost,
        packageCost,
        mealCost,
        activitiesCost,
        discount,
        total: subtotal - discount,
    };
}
