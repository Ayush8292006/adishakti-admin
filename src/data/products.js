// All 46 products from the store stock list.
// NOTE: prices are SAMPLE prices for the prototype — replace with real rates.
// stock = real quantity from the stock list (bundles/boxes counted as units).

export const CATEGORIES = [
  'Cake Toppers',
  'Silicone Moulds',
  'Baking Tools',
  'Cake Base & Boards',
  'Packing Materials',
  'Decoration Ribbons',
  'Cake Stands',
];

const P = (id, slug, name, category, price, stock, unit, extra = {}) => ({
  id, slug, name, category, price, stock, unit,
  img: `/products/${slug}.jpg`,
  isNew: false,
  variants: null,
  ...extra,
});

export const PRODUCTS = [
  P(1, 'ginkgo-topper', 'Gold Ginkgo Leaf Cake Topper', 'Cake Toppers', 149, 10, 'pc'),
  P(2, 'mixing-bowl-big', 'Big Mixing Bowl', 'Baking Tools', 299, 3, 'pc'),
  P(3, 'mixing-bowl-small', 'Small Mixing Bowl', 'Baking Tools', 129, 20, 'pc'),
  P(4, 'mdf-cake-board', 'MDF Round Cake Board', 'Cake Base & Boards', 89, 5, 'pc'),
  P(5, 'teddy-topper', 'Teddy Bear Cake Topper', 'Cake Toppers', 99, 20, 'pc'),
  P(6, 'happy-birthday-mould', 'Happy Birthday + Numbers Silicone Mould', 'Silicone Moulds', 189, 5, 'pc'),
  P(7, 'satin-ribbon-red', 'Red Satin Ribbon Roll', 'Decoration Ribbons', 249, 1, 'bundle'),
  P(8, 'star-mould', 'Star Chocolate Mould', 'Silicone Moulds', 149, 5, 'pc'),
  P(9, 'flower-mould', 'Flower Chocolate Mould', 'Silicone Moulds', 149, 10, 'pc'),
  P(10, 'star-heart-topper', 'Gold Acrylic Star / Heart Topper', 'Cake Toppers', 39, 100, 'pc', { variants: [{ name: 'Star', stock: 50 }, { name: 'Heart', stock: 50 }] }),
  P(11, 'pompom-topper', 'Pom-pom Ring Topper', 'Cake Toppers', 129, 20, 'pc', { variants: [{ name: 'Blue', stock: 10 }, { name: 'Purple', stock: 10 }] }),
  P(12, 'heart-mould', 'Heart Shape Chocolate Mould', 'Silicone Moulds', 149, 10, 'pc'),
  P(13, 'gold-foil', 'Gold Foil Wrapper Sheets', 'Packing Materials', 79, 30, 'pack'),
  P(14, 'bar-mould-6', 'Chocolate Bar Mould (6 cavity)', 'Silicone Moulds', 179, 2, 'pc'),
  P(15, 'mix-colour-sheets', 'Mix Colours Sheets', 'Packing Materials', 99, 5, 'pack'),
  P(16, 'mini-bar-mould', 'Mini Chocolate Bar Mould (12 cavity)', 'Silicone Moulds', 159, 5, 'pc'),
  P(17, 'cake-base-5', 'White Plastic Cake Base 5"', 'Cake Base & Boards', 35, 10, 'pc'),
  P(18, 'acrylic-stand', 'Transparent Acrylic Cake Stand', 'Cake Stands', 899, 1, 'pc'),
  P(19, 'alphabet-mould', 'Alphabet Silicone Mould', 'Silicone Moulds', 219, 4, 'pc'),
  P(20, 'fairy-topper', 'Fairy Doll Cake Topper', 'Cake Toppers', 249, 9, 'pc'),
  P(21, 'hb-coin', 'Happy Birthday Gold Coin Topper', 'Cake Toppers', 15, 100, 'pc'),
  P(22, 'mini-crown', 'Mini Gold Crown with Stone', 'Cake Toppers', 79, 15, 'pc'),
  P(23, 'cake-dowels', 'Cake Dowels / Tier Support', 'Cake Base & Boards', 12, 25, 'pc'),
  P(24, 'cake-base-6', 'White Plastic Cake Base 6"', 'Cake Base & Boards', 45, 10, 'pc'),
  P(25, 'rainbow-topper', 'Rainbow & Cloud Cake Topper', 'Cake Toppers', 119, 5, 'bundle', { variants: [{ name: 'Big', stock: 2 }, { name: 'Small', stock: 3 }] }),
  P(26, 'nozzle-set', 'Piping Nozzle Set', 'Baking Tools', 349, 5, 'box'),
  P(27, 'long-mould', 'Long Cavity Chocolate Mould', 'Silicone Moulds', 159, 5, 'pc'),
  P(28, 'colour-foil', 'Colour Foil Sheets', 'Packing Materials', 89, 10, 'pack'),
  P(29, 'elephant-topper', 'Elephant Hot-air Balloon Topper', 'Cake Toppers', 299, 2, 'pc'),
  P(30, 'measuring-set', 'Gold Measuring Cup & Spoon Set (8 pcs)', 'Baking Tools', 699, 2, 'box'),
  P(31, 'acrylic-box', 'Transparent Acrylic Cake Box', 'Packing Materials', 399, 5, 'pc'),
  P(32, 'white-bar-mould', 'White Silicone Bar Mould', 'Silicone Moulds', 199, 5, 'pc'),
  P(33, 'comb-scraper', 'Cake Comb Scraper Set', 'Baking Tools', 59, 10, 'set'),
  P(34, 'butterfly-gold', 'Gold Butterfly Toppers', 'Cake Toppers', 69, 15, 'pack'),
  P(35, 'animal-toppers', 'Animal Figurine Toppers', 'Cake Toppers', 199, 5, 'bundle'),
  P(36, 'fondant-mould', 'Fondant Silicone Mould', 'Silicone Moulds', 99, 10, 'pc'),
  P(37, 'oven-mitt', 'Quilted Oven Mitt', 'Baking Tools', 149, 5, 'pc'),
  P(38, 'fondant-smoother', 'Fondant / Cake Smoother', 'Baking Tools', 69, 20, 'pc'),
  P(39, 'diamond-mesh', 'Diamond Mesh Ribbon Roll', 'Decoration Ribbons', 449, 4, 'roll', { variants: [{ name: 'Silver', stock: 2 }, { name: 'Gold', stock: 2 }] }),
  P(40, 'measuring-scraper', 'Measuring Scraper (with scale)', 'Baking Tools', 49, 15, 'pc'),
  P(41, 'rose-mould', 'Rose & Sunflower Chocolate Mould', 'Silicone Moulds', 169, 10, 'pc', { isNew: true }),
  P(42, 'plunger-cutter', 'Fondant Plunger Cutter Set', 'Baking Tools', 249, 5, 'bundle', { isNew: true }),
  P(43, 'dough-scraper', 'Dough / Cake Scraper', 'Baking Tools', 29, 15, 'pc', { isNew: true }),
  P(44, 'steel-cup', 'Steel Round Cup with Pin', 'Baking Tools', 39, 20, 'pc', { isNew: true, note: 'Name & stock to confirm' }),
  P(45, 'filigree-butterfly', 'Filigree Butterfly Topper', 'Cake Toppers', 59, 35, 'pack', { isNew: true, variants: [{ name: 'Gold', stock: 25 }, { name: 'Silver', stock: 10 }] }),
  P(46, 'mini-choc-mould', 'Mini Chocolate Bar Mould (Grid)', 'Silicone Moulds', 149, null, 'pc', { isNew: true, note: 'Stock to confirm' }),
];

export const stockLabel = (p) => (p.stock == null ? 'Stock to confirm' : `${p.stock} ${p.unit} in stock`);
export const isLowStock = (p) => p.stock != null && p.stock <= 5;
export const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

export const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

export const catSlug = (c) => c.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const catFromSlug = (s) => CATEGORIES.find((c) => catSlug(c) === s) || null;

export const CAT_IMG = {
  'Cake Toppers': '/products/filigree-butterfly.jpg',
  'Silicone Moulds': '/products/rose-mould.jpg',
  'Baking Tools': '/products/nozzle-set.jpg',
  'Cake Base & Boards': '/products/mdf-cake-board.jpg',
  'Packing Materials': '/products/gold-foil.jpg',
  'Decoration Ribbons': '/products/diamond-mesh.jpg',
  'Cake Stands': '/products/acrylic-stand.jpg',
};
