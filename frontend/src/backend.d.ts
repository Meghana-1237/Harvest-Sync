import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HarvestListing {
    id: bigint;
    readinessScore: number;
    diagnosis?: CropAnalysisReport;
    quantity: bigint;
    cropType: string;
    qualityCertificate: boolean;
    harvestDate: Time;
    daysPassed: bigint;
    location: string;
    farmer: Principal;
    totalGrowthCycle: bigint;
}
export interface TransportOffer {
    vehicleType: VehicleType;
    transporter: Principal;
    listingId: bigint;
    commitmentId: bigint;
    routeEnd: string;
    estimatedDeliveryTime: string;
    trackingStatus: string;
    loadCapacity: bigint;
    routeStart: string;
    currentLocation: string;
    accepted: boolean;
}
export type Time = bigint;
export interface RouteLocation {
    quantity: bigint;
    location: string;
}
export interface PredictYieldResult {
    predictedPrice: number;
    predictedYield: number;
}
export interface OptimizedRoute {
    deliveryLocations: Array<RouteLocation>;
    costSavings: number;
    distance: number;
    pickupLocations: Array<RouteLocation>;
}
export interface Commitment {
    id: bigint;
    listingId: bigint;
    quantity: bigint;
    buyer: Principal;
    price: bigint;
}
export type VehicleType = {
    __kind__: "Van";
    Van: null;
} | {
    __kind__: "Bike";
    Bike: null;
} | {
    __kind__: "Truck";
    Truck: null;
} | {
    __kind__: "Other";
    Other: string;
};
export interface Disease {
    name: string;
    severity: bigint;
}
export interface ParsedHarvestData {
    quantity: bigint;
    cropType: string;
    harvestDate: bigint;
    location: string;
}
export interface ListingFilterCriteria {
    minReadinessScore?: number;
    qualityCertificateRequired?: boolean;
    cropType?: string;
    location?: string;
}
export interface BuyerDemand {
    id: bigint;
    status: string;
    createdAt: Time;
    pricePerKg: bigint;
    linkedListing?: bigint;
    buyerId: Principal;
    quantity: bigint;
    cropType: string;
    destinationSupply: string;
}
export interface CropAnalysisReport {
    harvestReadinessScore: number;
    healthFactors: {
        nutrientDeficiencies: Array<NutrientDeficiency>;
        pestDetection: boolean;
        diseases: Array<Disease>;
    };
    qualityGrade: Variant_Premium_Reject_Standard;
}
export interface NutrientDeficiency {
    impact: bigint;
    name: string;
}
export interface UserProfile {
    contact: string;
    appRole: AppRole;
    name: string;
    location: string;
}
export enum AppRole {
    Transporter = "Transporter",
    Farmer = "Farmer",
    Buyer = "Buyer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Premium_Reject_Standard {
    Premium = "Premium",
    Reject = "Reject",
    Standard = "Standard"
}
export interface backendInterface {
    acceptBuyerDemand(demandId: bigint, listingId: bigint): Promise<void>;
    acceptTransportOffer(listingId: bigint, transporter: Principal, commitmentId: bigint): Promise<void>;
    analyzeCropMaturity(_image: Uint8Array): Promise<number>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateReadinessScore(daysPassed: bigint, totalGrowthCycle: bigint, cropType: string, location: string, farmerAssessmentScore: number): Promise<number>;
    createBuyerDemand(cropType: string, quantity: bigint, pricePerKg: bigint, destinationSupply: string): Promise<bigint>;
    createHarvestListing(cropType: string, quantity: bigint, harvestDate: Time, location: string, readinessScore: number, qualityCertificate: boolean, daysPassed: bigint, totalGrowthCycle: bigint): Promise<bigint>;
    deleteListing(listingId: bigint): Promise<void>;
    diagnoseCrop(listingId: bigint, _image: Uint8Array): Promise<CropAnalysisReport>;
    filterListings(criteria: ListingFilterCriteria): Promise<Array<HarvestListing>>;
    getAllBuyerDemands(): Promise<Array<BuyerDemand>>;
    getAvailableListings(): Promise<Array<HarvestListing>>;
    getBuyerDemands(): Promise<Array<BuyerDemand>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommitments(listingId: bigint): Promise<Array<Commitment>>;
    getCommitmentsByBuyer(): Promise<Array<Commitment>>;
    getListingDetails(listingId: bigint): Promise<HarvestListing>;
    getSortedCommitments(listingId: bigint): Promise<Array<Commitment>>;
    getSortedListings(): Promise<Array<HarvestListing>>;
    getTransportOffers(listingId: bigint): Promise<Array<TransportOffer>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    makeCommitment(listingId: bigint, quantity: bigint, price: bigint): Promise<bigint>;
    makeTransportOffer(listingId: bigint, vehicleType: VehicleType, loadCapacity: bigint, routeStart: string, routeEnd: string): Promise<void>;
    optimizeLogisticsRoutes(vehicleCapacity: bigint, vehicleType: VehicleType, startLocation: string, deliveryLocation: string): Promise<Array<OptimizedRoute>>;
    parseHarvestInput(_rawInput: string): Promise<ParsedHarvestData>;
    predictYieldAndPrice(cropType: string, location: string, daysPassed: bigint, totalGrowthCycle: bigint, quantity: bigint): Promise<PredictYieldResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListingsByCrop(cropType: string): Promise<Array<HarvestListing>>;
    updateTracking(listingId: bigint, currentLocation: string, estimatedDeliveryTime: string, trackingStatus: string): Promise<void>;
}
