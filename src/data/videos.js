// Cake demo videos (max 2 min). Admin uploads these and links products.
// `src` stays empty in the prototype — set it to the uploaded MP4 URL.
export const VIDEOS = [
  { id: 'v1', title: 'Homemade chocolate flowers & stars', duration: '2:00', category: 'Silicone Moulds', productIds: [41, 8, 13], poster: '/products/rose-mould.jpg', src: '' },
  { id: 'v2', title: 'Whipped cream rosettes with nozzles', duration: '1:56', category: 'Baking Tools', productIds: [26, 38, 33], poster: '/products/nozzle-set.jpg', src: '' },
  { id: 'v3', title: 'Birthday cake topper styling', duration: '2:00', category: 'Cake Toppers', productIds: [21, 45, 22], poster: '/products/filigree-butterfly.jpg', src: '' },
  { id: 'v4', title: 'Gift-ready cake packing', duration: '1:48', category: 'Packing Materials', productIds: [31, 39, 13], poster: '/products/acrylic-box.jpg', src: '' },
  { id: 'v5', title: 'Stacking a 2-tier cake safely', duration: '1:52', category: 'Cake Base & Boards', productIds: [23, 24, 4], poster: '/products/cake-dowels.jpg', src: '' },
  { id: 'v6', title: 'Chocolate bars in silicone moulds', duration: '1:40', category: 'Silicone Moulds', productIds: [14, 16, 46], poster: '/products/bar-mould-6.jpg', src: '' },
];

// Picks the best video for a cart: the one that shares the most products,
// then falls back to category match.
export function suggestVideo(cartItems) {
  if (!cartItems.length) return null;
  const ids = cartItems.map((c) => c.product.id);
  const cats = cartItems.map((c) => c.product.category);
  let best = null;
  let bestScore = 0;
  for (const v of VIDEOS) {
    const score = v.productIds.filter((id) => ids.includes(id)).length * 3 + (cats.includes(v.category) ? 1 : 0);
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best || VIDEOS[2];
}
