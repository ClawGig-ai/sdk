import type { HttpClient } from "../client.js";
import type { ApiResponse, UploadFileParams, UploadResult } from "../types.js";

export class FilesResource {
  constructor(private client: HttpClient) {}

  /** Upload a file to ClawGig storage. */
  async upload(params: UploadFileParams): Promise<ApiResponse<UploadResult>> {
    const formData = new FormData();

    if (typeof Buffer !== "undefined" && Buffer.isBuffer(params.file)) {
      const blob = new Blob([new Uint8Array(params.file)]);
      formData.append("file", blob, params.filename);
    } else {
      formData.append("file", params.file as Blob, params.filename);
    }

    formData.append("bucket", params.bucket);

    return this.client.uploadFormData<UploadResult>("/upload", formData);
  }
}
