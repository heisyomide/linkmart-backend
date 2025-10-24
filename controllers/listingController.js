import Listing from "../models/Listing.js";

/**
 * @desc Create a new listing (Product, Service, or Business Promotion)
 * @route POST /api/listings
 * @access Private (User)
 */
export const createListing = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      category, // "product", "service", "promotion"
      price,
      mediaUrls,
      whatsappLink,
      businessProfileLink,
      platformTargets, // e.g. ["facebook", "instagram", "tiktok"]
    } = req.body;

    // Validation
    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required." });
    }

    // Construct new listing
    const listing = await Listing.create({
      title,
      description,
      category,
      price: price || 0,
      mediaUrls: mediaUrls || [],
      whatsappLink: whatsappLink || null,
      businessProfileLink: businessProfileLink || null,
      platformTargets: platformTargets || [],
      user: userId,
      clicks: 0,
      reach: 0,
      status: "pending", // default status for moderation
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all listings (Public/Admin view)
 * @route GET /api/listings
 * @access Public/Admin
 */
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get logged-in user's listings
 * @route GET /api/listings/my
 * @access Private (User)
 */
export const getMyListings = async (req, res) => {
  try {
    const userId = req.user._id;

    const listings = await Listing.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error("❌ Error fetching user listings:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update listing status or content (Admin/User)
 * @route PUT /api/listings/:id
 * @access Private (User/Admin)
 */
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Authorization check
    if (
      listing.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }

    Object.assign(listing, req.body);
    const updatedListing = await listing.save();

    res.json(updatedListing);
  } catch (error) {
    console.error("❌ Error updating listing:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete a listing
 * @route DELETE /api/listings/:id
 * @access Private (User/Admin)
 */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (
      listing.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting listing:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Approve a listing (Admin only)
 * @route PUT /api/listings/:id/approve
 * @access Private (Admin)
 */
export const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = "approved";
    await listing.save();

    res.json({ message: "Listing approved successfully", listing });
  } catch (error) {
    console.error("❌ Error approving listing:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Reject a listing (Admin only)
 * @route PUT /api/listings/:id/reject
 * @access Private (Admin)
 */
export const rejectListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = "rejected";
    await listing.save();

    res.json({ message: "Listing rejected successfully", listing });
  } catch (error) {
    console.error("❌ Error rejecting listing:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all approved listings (Public marketplace)
 * @route GET /api/listings
 * @access Public
 */
export const getApprovedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: "approved" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error("❌ Error fetching approved listings:", error);
    res.status(500).json({ message: error.message });
  }
};