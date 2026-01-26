// api/ratingApi.ts

import apiClient from "./apiClient";

export interface Trait {
    trait: string;
    score: number;
}

export interface RatingTopic {
    topic: string;
    traits: Trait[];
    comment: string;
}

export interface RatingData {
    emailOrPhone: string;
    sender_relation: string;
    rating_data: RatingTopic[];
    contact_name?: string; // Contact name from device if scored via contact
}
// Create
export const createRating = async (data: RatingData) => {
    const response = await apiClient.post("/ratings", data);
    return response.data;
};

// Read
export const getRatingByEmailOrPhone = async (emailOrPhone: string) => {
    const response = await apiClient.get(`/ratings/${emailOrPhone}`);
    return response.data;
};

// Update
export const updateRating = async (ratingId: string, data: RatingData) => {
    const response = await apiClient.post("/ratings/updateratings", {
        ...data,
        ratingId: ratingId  // Backend expects 'ratingId' not 'rating_id'
    });
    return response.data;
};

// Delete
export const deleteRating = async (emailOrPhone: string) => {
    const response = await apiClient.delete(`/ratings/${emailOrPhone}`);
    return response.data;
};
