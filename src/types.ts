export type ScanStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label?: string;
  confidence?: number;
}

export interface DetectedProduct {
  product_name: string;
  quantity_visible: number;
  confidence?: number;
  category?: string;
  sku_code?: string;
  unit_price_bdt?: number;
  facing_count?: number;
  bbox?: BoundingBox;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
}

export interface UploadRecord {
  upload_id: string;
  status: ScanStatus;
  shop_id: string | null;
  merchandiser_id: string | null;
  image_url: string;
  detected_products: DetectedProduct[] | null;
  token_usage?: TokenUsage;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  estimated_cost_usd?: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  image_base64?: string;
  processing_duration_ms?: number;
  model_used?: string;
  confidence_score?: number;
  total_units?: number;
}

export interface UploadsListResponse {
  total: number;
  limit: number;
  offset: number;
  items: UploadRecord[];
}

export interface TopProductSummary {
  product_name: string;
  total_quantity: number;
  scan_appearances: number;
  category?: string;
  avg_per_rack?: number;
}

export interface SummaryResponse {
  total_scans: number;
  completed_scans: number;
  processing_scans: number;
  pending_scans: number;
  failed_scans: number;
  total_products_detected: number;
  unique_products_count: number;
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_tokens?: number;
  total_estimated_cost_usd?: number;
  avg_tokens_per_scan?: number;
  avg_cost_per_scan_usd?: number;
  top_products: TopProductSummary[];
  recent_uploads: UploadRecord[];
}

export interface SampleRackImage {
  id: string;
  title: string;
  shop_id: string;
  merchandiser_id: string;
  category: string;
  description: string;
  imageUrl: string;
  detectedHint: {
    product_name: string;
    quantity_visible: number;
  }[];
}

export interface ApiEndpointSpec {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  description: string;
  tag: 'System' | 'Uploads & Recognition' | 'Media' | 'Analytics';
  requestParams?: {
    name: string;
    type: string;
    required: boolean;
    location: 'query' | 'path' | 'formData' | 'body';
    description: string;
    default?: string;
  }[];
  sampleCurl: string;
  samplePython: string;
  sampleJs: string;
}
