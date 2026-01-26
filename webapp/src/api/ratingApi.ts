import apiClient from './apiClient';

// Get ratings given **by me** (logged-in user)
export const getUserRatings = async () => {
  const response = await apiClient.get('/ratings/getuser_rating');
  return response.data;
};
export const checkIfScored = async (receiver_id: string, sender_relation: string) => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📡 API Call: checkIfScored');
  console.log('   URL: /ratings/check-if-scored');
  console.log('   Params:', { receiver_id, sender_relation });
  console.log('   receiver_id type:', typeof receiver_id);
  console.log('   sender_relation type:', typeof sender_relation);
  console.log('   receiver_id value:', receiver_id);
  console.log('   sender_relation value:', sender_relation);

  try {
    const url = `/ratings/check-if-scored?receiver_id=${receiver_id}&sender_relation=${sender_relation}`;
    console.log('   Full URL:', url);

    const response = await apiClient.get(url);

    console.log('✅ API Response received');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    console.log('   alreadyScored:', response.data.alreadyScored);
    console.log('   alreadyScored type:', typeof response.data.alreadyScored);
    console.log('═══════════════════════════════════════════════════════\n');

    return response.data;
  } catch (error: any) {
    console.error('❌❌❌ API Error in checkIfScored ❌❌❌');
    console.error('   Error message:', error.message);
    console.error('   Error response status:', error.response?.status);
    console.error('   Error response data:', JSON.stringify(error.response?.data, null, 2));
    console.error('   Full error:', error);
    console.log('═══════════════════════════════════════════════════════\n');
    throw error;
  }
};

// Get all relations that the logged user has already scored for a specific receiver
export const getScoredRelationsForReceiver = async (receiver_id: string) => {
  console.log('📡 API Call: getScoredRelationsForReceiver');
  console.log('   URL: /ratings/scored-relations-for-receiver');
  console.log('   Params:', { receiver_id });

  try {
    const response = await apiClient.get(`/ratings/scored-relations-for-receiver?receiver_id=${receiver_id}`);
    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ API Error in getScoredRelationsForReceiver:', error.response?.data || error.message);
    throw error;
  }
};

// Get ratings given **to me** (who scored me)
// Normalize return shape to always be { data: Array<any> }
export const getRatingsForMe = async () => {
  const response = await apiClient.get('/ratings/who-scored-me');
  const raw = response.data as any;
  const data = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
  return { data };
};
export const getSapienwhoIScored = async () => {
  const response = await apiClient.get('/ratings/whom-i-scored');
  const raw = response.data as any;
  const data = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
  return { data };
};

// Update rating status (pending -> accepted/rejected)
export const updateRatingStatus = async (ratingId: string, status: string) => {
  const response = await apiClient.patch(`/ratings/${ratingId}/status`, { status });
  return response.data;
};

// Submit/Create a new rating
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
  receiver_id?: string;
  emailOrPhone?: string;
  relation?: string;
  sender_relation?: string;
  rating_data: RatingTopic[];
  existing_rating_id?: string;
}

export const submitRating = async (data: RatingData) => {
  console.log('📡 Submitting rating:', data);
  const response = await apiClient.post('/ratings', {
    ...data,
    sender_relation: data.relation || data.sender_relation,
    emailOrPhone: data.receiver_id || data.emailOrPhone
  });
  return response.data;
};

// Alias for compatibility
export const createRating = submitRating;
