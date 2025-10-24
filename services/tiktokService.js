import axios from "axios";

const BASE_URL = "https://business-api.tiktok.com/open_api/v1.3";
const ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID;

/**
 * Helper to call TikTok API safely
 */
const tiktokRequest = async (endpoint, payload) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, payload, {
      headers: {
        "Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.message || "TikTok API error");
    }

    return response.data.data;
  } catch (err) {
    console.error("❌ TikTok API Request Failed:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * Step 1 — Create Campaign
 */
export const createTikTokCampaign = async (campaign) => {
  const payload = {
    advertiser_id: ADVERTISER_ID,
    campaign_name: `LM_${campaign._id}_${Date.now()}`,
    objective_type: "TRAFFIC",
    budget_mode: "BUDGET_MODE_DAY",
    budget: campaign.budget || 100,
  };

  const data = await tiktokRequest("/campaign/create/", payload);
  return data;
};

/**
 * Step 2 — Create Ad Group
 */
export const createTikTokAdGroup = async (campaignId, targeting) => {
  const payload = {
    advertiser_id: ADVERTISER_ID,
    campaign_id: campaignId,
    adgroup_name: `Group_${Date.now()}`,
    placement_type: "PLACEMENT_TYPE_AUTO",
    schedule_type: "SCHEDULE_FROM_NOW",
    bid_type: "BID_TYPE_CPC",
    bid: 1,
    budget_mode: "BUDGET_MODE_DAY",
    budget: 50,
    optimization_goal: "CLICK",
    targeting: targeting || {
      gender: "GENDER_FEMALE",
      age: ["AGE_18_24", "AGE_25_34"],
      location: ["NG"], // Nigeria as example
    },
  };

  const data = await tiktokRequest("/adgroup/create/", payload);
  return data;
};

/**
 * Step 3 — Create Ad Creative
 */
export const createTikTokAdCreative = async (adgroupId, mediaUrl, caption) => {
  const payload = {
    advertiser_id: ADVERTISER_ID,
    adgroup_id: adgroupId,
    ad_name: `Ad_${Date.now()}`,
    ad_format: "SINGLE_VIDEO",
    creatives: [
      {
        ad_name: caption?.slice(0, 30) || "LinkMart Ad",
        call_to_action: "SHOP_NOW",
        image_mode: "VIDEO",
        video_id: mediaUrl, // Must be an uploaded TikTok video asset ID
      },
    ],
  };

  const data = await tiktokRequest("/ad/create/", payload);
  return data;
};

/**
 * Full TikTok Flow — Create Campaign + AdGroup + Ad
 */
export const createFullTikTokFlow = async (campaign) => {
  // Step 1: Campaign
  const createdCampaign = await createTikTokCampaign(campaign);
  const campaignId = createdCampaign?.campaign_id;

  // Step 2: AdGroup
  const createdGroup = await createTikTokAdGroup(campaignId, campaign.targeting);
  const adgroupId = createdGroup?.adgroup_id;

  // Step 3: Ad
  const createdAd = await createTikTokAdCreative(adgroupId, campaign.mediaUrl, campaign.caption);
  const adId = createdAd?.ad_id;

  return { campaignId, adgroupId, adId };
};