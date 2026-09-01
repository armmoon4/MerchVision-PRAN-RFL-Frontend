import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Enable JSON body parsing for other JSON routes
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload media directories exist
const mediaBaseDir = path.join(process.cwd(), 'media', 'uploads');
if (!fs.existsSync(mediaBaseDir)) {
  fs.mkdirSync(mediaBaseDir, { recursive: true });
}

// Multer storage configuration for /uploads endpoint
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const shopId = (req.body && req.body.shop_id) ? req.body.shop_id.replace(/[^a-zA-Z0-9_-]/g, '_') : 'unassigned';
    const targetDir = path.join(mediaBaseDir, shopId);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${uuidv4().replace(/-/g, '')}${ext}`;
    cb(null, uniqueName);
  }
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Types & In-Memory Data Store
export interface DetectedProductItem {
  product_name: string;
  quantity_visible: number;
  confidence?: number;
  category?: string;
  sku_code?: string;
  unit_price_bdt?: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UploadRecordItem {
  upload_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  shop_id: string | null;
  merchandiser_id: string | null;
  image_url: string;
  detected_products: DetectedProductItem[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  file_path?: string;
  image_base64?: string;
  processing_duration_ms?: number;
  model_used?: string;
  confidence_score?: number;
  total_units?: number;
}

// In-Memory Database for Fast Persistence (starts clean with no pre-seeded bulk data)
const uploadsDatabase = new Map<string, UploadRecordItem>();

// Background task simulation (for when user tests in preview mode without their FastAPI server connected)
async function processRackRecognitionJob(uploadId: string, _imageBuffer: Buffer, _mimeType: string, _shopId: string | null) {
  const record = uploadsDatabase.get(uploadId);
  if (!record) return;

  const startTime = Date.now();
  record.status = 'PROCESSING';
  record.updated_at = new Date().toISOString();
  uploadsDatabase.set(uploadId, record);

  // Short processing delay to reflect async pipeline
  setTimeout(() => {
    const current = uploadsDatabase.get(uploadId);
    if (!current) return;
    
    current.status = 'COMPLETED';
    current.detected_products = [
      { product_name: 'PRAN Mango Juice 250ml', quantity_visible: 6, confidence: 0.98, category: 'Beverage & Juices', bbox: { x: 15, y: 20, width: 25, height: 40 } },
      { product_name: 'PRAN Frooto 250ml', quantity_visible: 4, confidence: 0.95, category: 'Beverage & Juices', bbox: { x: 45, y: 20, width: 22, height: 40 } },
      { product_name: 'RFL Water Bottle 1L', quantity_visible: 2, confidence: 0.92, category: 'RFL Plastics & Houseware', bbox: { x: 72, y: 15, width: 18, height: 50 } }
    ];
    current.error_message = null;
    current.updated_at = new Date().toISOString();
    current.processing_duration_ms = Date.now() - startTime;
    current.confidence_score = 0.96;
    current.total_units = 12;
    uploadsDatabase.set(uploadId, current);
  }, 1200);
}

// ----------------------------------------------------
// API ROUTES (Conforms strictly to provided API docs)
// ----------------------------------------------------

// 3.1. System & Health: GET /health
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 3.2. Rack Uploads: POST /uploads
app.post('/uploads', uploadMiddleware.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const body = req.body || {};
    const shopId = body.shop_id ? String(body.shop_id).trim() : null;
    const merchandiserId = body.merchandiser_id ? String(body.merchandiser_id).trim() : null;

    let imageBuffer: Buffer;
    let mimeType = 'image/jpeg';
    let imageUrl = '';
    let filePath = '';

    if (file) {
      imageBuffer = fs.readFileSync(file.path);
      mimeType = file.mimetype;
      filePath = file.path;
      const safeShop = shopId ? shopId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'unassigned';
      imageUrl = `/media/uploads/${safeShop}/${file.filename}`;
    } else if (body.image_base64) {
      // Support base64 upload fallback for web camera/canvas tests
      const base64Data = body.image_base64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      const filename = `${uuidv4().replace(/-/g, '')}.jpg`;
      const safeShop = shopId ? shopId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'unassigned';
      const targetDir = path.join(mediaBaseDir, safeShop);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      filePath = path.join(targetDir, filename);
      fs.writeFileSync(filePath, imageBuffer);
      imageUrl = `/media/uploads/${safeShop}/${filename}`;
    } else if (body.sample_image_url) {
      // Direct sample image testing
      imageUrl = body.sample_image_url;
      imageBuffer = Buffer.from('');
    } else {
      res.status(400).json({ detail: 'Field "file" is required (multipart/form-data) or "image_base64"' });
      return;
    }

    const uploadId = uuidv4();
    const now = new Date().toISOString();

    const record: UploadRecordItem = {
      upload_id: uploadId,
      status: 'PENDING',
      shop_id: shopId,
      merchandiser_id: merchandiserId,
      image_url: imageUrl,
      detected_products: null,
      error_message: null,
      created_at: now,
      updated_at: now,
      file_path: filePath,
      image_base64: imageBuffer.length > 0 ? imageBuffer.toString('base64') : undefined
    };

    uploadsDatabase.set(uploadId, record);

    // Trigger async background analysis
    setTimeout(() => {
      processRackRecognitionJob(uploadId, imageBuffer, mimeType, shopId);
    }, 100);

    // Return 202 Accepted immediately
    res.status(202).json({
      upload_id: uploadId,
      status: 'PENDING',
      message: 'Image received. Processing started.'
    });
  } catch (error: any) {
    console.error('Error processing POST /uploads:', error);
    res.status(500).json({ detail: error.message || 'Internal Server Error saving rack image' });
  }
});

// 3.2. Rack Uploads via URL: POST /uploads/url
app.post('/uploads/url', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body || {};
    const imageUrl = body.image_url ? String(body.image_url).trim() : '';
    const shopId = body.shop_id ? String(body.shop_id).trim() : null;
    const merchandiserId = body.merchandiser_id ? String(body.merchandiser_id).trim() : null;

    if (!imageUrl) {
      res.status(400).json({ detail: 'Field "image_url" is required in JSON body.' });
      return;
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      res.status(400).json({ detail: 'Invalid URL scheme. Only HTTP and HTTPS image URLs are supported.' });
      return;
    }

    const uploadId = uuidv4();
    const now = new Date().toISOString();

    const record: UploadRecordItem = {
      upload_id: uploadId,
      status: 'PENDING',
      shop_id: shopId,
      merchandiser_id: merchandiserId,
      image_url: imageUrl,
      detected_products: null,
      error_message: null,
      created_at: now,
      updated_at: now
    };

    uploadsDatabase.set(uploadId, record);

    // Trigger async background analysis
    setTimeout(() => {
      processRackRecognitionJob(uploadId, Buffer.from(''), 'image/jpeg', shopId);
    }, 100);

    // Return 202 Accepted immediately
    res.status(202).json({
      upload_id: uploadId,
      status: 'PENDING',
      message: 'Image URL received. Processing started.'
    });
  } catch (error: any) {
    console.error('Error processing POST /uploads/url:', error);
    res.status(500).json({ detail: error.message || 'Internal Server Error saving image from URL' });
  }
});

// 3.2. GET /uploads/summary & /analysis/summary (Must be declared before /uploads/:upload_id)
app.get(['/uploads/summary', '/analysis/summary'], (_req: Request, res: Response) => {
  const allItems = Array.from(uploadsDatabase.values());
  const completedScans = allItems.filter(i => i.status === 'COMPLETED');
  const processingScans = allItems.filter(i => i.status === 'PROCESSING');
  const pendingScans = allItems.filter(i => i.status === 'PENDING');
  const failedScans = allItems.filter(i => i.status === 'FAILED');

  const productStats = new Map<string, { total_quantity: number; scan_appearances: number; category?: string }>();
  let totalProductsDetected = 0;

  for (const scan of completedScans) {
    if (scan.detected_products) {
      for (const prod of scan.detected_products) {
        totalProductsDetected += prod.quantity_visible;
        const existing = productStats.get(prod.product_name) || { total_quantity: 0, scan_appearances: 0, category: prod.category };
        existing.total_quantity += prod.quantity_visible;
        existing.scan_appearances += 1;
        if (prod.category && !existing.category) existing.category = prod.category;
        productStats.set(prod.product_name, existing);
      }
    }
  }

  const topProducts = Array.from(productStats.entries())
    .map(([product_name, stats]) => ({
      product_name,
      total_quantity: stats.total_quantity,
      scan_appearances: stats.scan_appearances,
      category: stats.category,
      avg_per_rack: Number((stats.total_quantity / Math.max(1, stats.scan_appearances)).toFixed(1))
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 10);

  const recentUploads = [...allItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  res.status(200).json({
    total_scans: allItems.length,
    completed_scans: completedScans.length,
    processing_scans: processingScans.length,
    pending_scans: pendingScans.length,
    failed_scans: failedScans.length,
    total_products_detected: totalProductsDetected,
    unique_products_count: productStats.size,
    top_products: topProducts,
    recent_uploads: recentUploads
  });
});

// 3.2. GET /uploads/:upload_id and /uploads/:upload_id/result
app.get(['/uploads/:upload_id', '/uploads/:upload_id/result'], (req: Request, res: Response): void => {
  const { upload_id } = req.params;
  const record = uploadsDatabase.get(upload_id);

  if (!record) {
    res.status(404).json({ detail: `Upload ID '${upload_id}' not found` });
    return;
  }

  res.status(200).json({
    upload_id: record.upload_id,
    status: record.status,
    shop_id: record.shop_id,
    merchandiser_id: record.merchandiser_id,
    image_url: record.image_url,
    detected_products: record.detected_products,
    error_message: record.error_message,
    created_at: record.created_at,
    updated_at: record.updated_at,
    processing_duration_ms: record.processing_duration_ms,
    confidence_score: record.confidence_score,
    total_units: record.total_units
  });
});

// 3.2. GET /uploads, /analysis, /results (with search, filter, pagination)
app.get(['/uploads', '/analysis', '/results'], (req: Request, res: Response) => {
  const statusFilter = req.query.status ? String(req.query.status).toUpperCase() : null;
  const shopIdFilter = req.query.shop_id ? String(req.query.shop_id).toLowerCase() : null;
  const merchandiserIdFilter = req.query.merchandiser_id ? String(req.query.merchandiser_id).toLowerCase() : null;
  const searchFilter = req.query.search ? String(req.query.search).toLowerCase() : null;
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
  const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10));

  let filtered = Array.from(uploadsDatabase.values());

  if (statusFilter) {
    filtered = filtered.filter(item => item.status === statusFilter);
  }

  if (shopIdFilter) {
    filtered = filtered.filter(item => item.shop_id && item.shop_id.toLowerCase().includes(shopIdFilter));
  }

  if (merchandiserIdFilter) {
    filtered = filtered.filter(item => item.merchandiser_id && item.merchandiser_id.toLowerCase().includes(merchandiserIdFilter));
  }

  if (searchFilter) {
    filtered = filtered.filter(item => {
      const matchId = item.upload_id.toLowerCase().includes(searchFilter);
      const matchShop = item.shop_id ? item.shop_id.toLowerCase().includes(searchFilter) : false;
      const matchMerch = item.merchandiser_id ? item.merchandiser_id.toLowerCase().includes(searchFilter) : false;
      const matchError = item.error_message ? item.error_message.toLowerCase().includes(searchFilter) : false;
      const matchProducts = item.detected_products ? item.detected_products.some(p => p.product_name.toLowerCase().includes(searchFilter)) : false;
      return matchId || matchShop || matchMerch || matchError || matchProducts;
    });
  }

  // Sort descending by created_at
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);

  res.status(200).json({
    total,
    limit,
    offset,
    items
  });
});

// 3.2. DELETE /uploads/:upload_id
app.delete('/uploads/:upload_id', (req: Request, res: Response): void => {
  const { upload_id } = req.params;
  const record = uploadsDatabase.get(upload_id);

  if (!record) {
    res.status(404).json({ detail: `Upload ID '${upload_id}' not found` });
    return;
  }

  if (record.file_path && fs.existsSync(record.file_path)) {
    try {
      fs.unlinkSync(record.file_path);
    } catch (e) {
      console.warn('Could not delete image file on disk:', e);
    }
  }

  uploadsDatabase.delete(upload_id);

  res.status(200).json({
    upload_id,
    message: `Upload '${upload_id}' and associated media deleted successfully.`
  });
});

// 3.3. Static Media Access: GET /media/uploads/:shop_id/:filename
app.get('/media/uploads/:shop_id/:filename', (req: Request, res: Response) => {
  const { shop_id, filename } = req.params;
  const safeShop = shop_id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFile = path.basename(filename);
  const filePath = path.join(mediaBaseDir, safeShop, safeFile);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // If not on disk, return a generic placeholder or 404
    res.status(404).json({ detail: 'Media not found on server storage' });
  }
});

// Start the server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MerchVision Rack Recognition Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
