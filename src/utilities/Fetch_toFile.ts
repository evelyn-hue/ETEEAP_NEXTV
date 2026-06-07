type SingleFileUploadInput = {
  file: File;
  fields?: Record<string, string | number>;
};

type BatchFileUploadInput = {
  files: File[];
  documentTypes: string[];
  fields?: Record<string, string | number>;
};

type FetchToFileOptions = {
  headers?: Record<string, string>;
  retries?: number;
  delay?: number;
  onProgress?: (progress: number, message: string) => void;
};

type FetchToFileInput = SingleFileUploadInput | BatchFileUploadInput;

export default async function Fetch_toFile(
  dir: string,
  input: FetchToFileInput,
  options: FetchToFileOptions = {},
) {
  const {
    headers = {},
    retries = 3,
    delay = 1000,
    onProgress,
  } = options;

  if (!dir || dir === "") {
    if (typeof window !== "undefined") alert("Invalid API Directory not found");
    return { success: false, message: "Invalid API Directory" };
  }

  const formData = new FormData();

  if ("file" in input) {
    if (!input.file) {
      return { success: false, message: "No file provided" };
    }

    formData.append("file", input.file);

    for (const key in input.fields ?? {}) {
      formData.append(key, String(input.fields?.[key]));
    }
  } else {
    if (!input.files?.length) {
      return { success: false, message: "No files provided" };
    }

    if (input.files.length !== input.documentTypes.length) {
      return {
        success: false,
        message: "Each file must have a matching document type",
      };
    }

    input.files.forEach((file, index) => {
      formData.append("files", file);
      formData.append("documentTypes", input.documentTypes[index]);
    });

    for (const key in input.fields ?? {}) {
      formData.append(key, String(input.fields?.[key]));
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      onProgress?.(25, "Uploading files...");

      const response = await fetch(dir, {
        method: "POST",
        headers: {
          ...headers,
        },
        body: formData,
      });

      onProgress?.(75, "Reading response...");

      const data = await response.json().catch(() => null);

      if (response.ok) {
        onProgress?.(100, "Upload complete");
        return { success: true, data };
      }

      return {
        success: false,
        message: data?.error || `Request failed: ${response.status}`,
      };
    } catch (err: unknown) {
      let message = "Unknown fetch error";
      if (err instanceof Error) message = err.message;
      console.error(`Attempt ${attempt} fetch error:`, message);
    }

    if (attempt < retries) await new Promise((res) => setTimeout(res, delay));
  }

  return { success: false, message: `All ${retries} attempts failed for ${dir}` };
}
