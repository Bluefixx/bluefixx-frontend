import { apiClient } from "./client";
import {
  CustomerDashboardResponse,
  CatalogGroup,
  TradeCategory,
  ArtisanListItem,
  ArtisanQueryParams,
  ArtisanDetailResponse,
} from "@/types/customer";

/**
 * Customer dashboard aggregate
 * GET /api/v1/dashboard
 */
export async function getCustomerDashboardApi(): Promise<CustomerDashboardResponse> {
  return apiClient.get<CustomerDashboardResponse>("/dashboard");
}

/**
 * Screen catalog grouped by category with real starting prices
 * GET /api/v1/catalog
 */
export async function getCatalogApi(): Promise<CatalogGroup[]> {
  return apiClient.get<CatalogGroup[]>("/catalog");
}

/**
 * Trade and service catalog
 * GET /api/v1/services
 */
export async function getServicesApi(): Promise<TradeCategory[]> {
  return apiClient.get<TradeCategory[]>("/services");
}

/**
 * Discover approved nearby artisans
 * GET /api/v1/artisans
 */
export async function getArtisansApi(params: ArtisanQueryParams): Promise<ArtisanListItem[]> {
  return apiClient.get<ArtisanListItem[]>("/artisans", {
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
      distance: params.distance ?? 15,
      ...(params.tradeId ? { tradeId: params.tradeId } : {}),
      ...(params.minimumLevel ? { minimumLevel: params.minimumLevel } : {}),
      ...(params.available !== undefined ? { available: params.available } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
      limit: params.limit ?? 30,
      offset: params.offset ?? 0,
    },
  });
}

/**
 * Public artisan profile, portfolio and reviews
 * GET /api/v1/artisans/{id}
 */
export async function getArtisanByIdApi(id: string): Promise<ArtisanDetailResponse> {
  return apiClient.get<ArtisanDetailResponse>(`/artisans/${id}`);
}
