import Product from "../models/product.js";

// Create product
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, whatsapp, platforms, images } = req.body;
    const newProduct = new Product({
      user: req.user.id,
      title,
      description,
      price,
      category,
      whatsapp,
      platforms,
      images,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user's products
export const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};