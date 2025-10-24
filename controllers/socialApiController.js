// This will later handle posting to Facebook, Instagram, etc.
import axios from "axios";

export const postToSocialMedia = async (req, res) => {
  const { platform, content } = req.body;

  try {
    switch (platform) {
      case "facebook":
        // Example (Meta Graph API)
        await axios.post(`https://graph.facebook.com/v20.0/me/feed`, {
          message: content,
          access_token: process.env.FB_ACCESS_TOKEN,
        });
        break;
      // other platforms later
    }
    res.json({ success: true, message: "Posted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};