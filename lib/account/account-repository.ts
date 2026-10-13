import type { ApiRequestOptions } from "../api/client.ts";
import type {
  ApiFarmLocationStatus,
  ApiProfile,
  UpdateProfileRequest,
} from "../api/contracts.ts";
import type { FarmLocationInput } from "../farmer/farmer-repository.ts";

type ApiRequester = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

/** Profile, avatar and farm-location calls for the signed-in user (any role). */
export class AccountRepository {
  private readonly client: ApiRequester;

  constructor({ client }: { client: ApiRequester }) {
    this.client = client;
  }

  getProfile(): Promise<ApiProfile> {
    return this.client.request<ApiProfile>("/auth/me/profile");
  }

  updateProfile(changes: UpdateProfileRequest): Promise<ApiProfile> {
    return this.client.request<ApiProfile>("/auth/me/profile", {
      method: "PATCH",
      body: changes,
    });
  }

  updateFarmLocation(input: FarmLocationInput): Promise<ApiFarmLocationStatus> {
    return this.client.request<ApiFarmLocationStatus>("/farmers/me/farm-location", {
      method: "PATCH",
      body: input,
    });
  }

  /** Uploads an already-cropped square image as multipart field `file`. */
  uploadAvatar(file: Blob, filename = "avatar.jpg"): Promise<ApiProfile> {
    const body = new FormData();
    body.append("file", file, filename);
    return this.client.request<ApiProfile>("/auth/me/avatar", {
      method: "PUT",
      body,
    });
  }

  removeAvatar(): Promise<ApiProfile> {
    return this.client.request<ApiProfile>("/auth/me/avatar", { method: "DELETE" });
  }
}
