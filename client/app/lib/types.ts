export type UploadStatus = "idle" | "processing" | "completed" | "failed";

export type ProgressData = {
  processed: number;
  total: number;
  valid: number;
  invalid: number;
  percentage: number;
};

export type TrendPoint = {
  _id: string;
  uploads: number;
};

export type AgeBucket = {
  _id: number | string;
  count: number;
};

export type DomainCount = {
  _id: string;
  count: number;
};

export type AnalyticsResponse = {
  totalUsers: number;
  status: {
    processing: number;
    completed: number;
    failed: number;
  };
  trends: TrendPoint[];
  ageDistribution: AgeBucket[];
  domains: DomainCount[];
};

export type UploadResponse = {
  jobId: string;
  message?: string;
};
