import axios from "axios";
import type { ContextResponse } from "../types/context";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export async function analyzeContext(
  text: string
): Promise<ContextResponse> {
  const response = await api.post<ContextResponse>("/context/analyze", {
    text,
  });

  return response.data;
}

export default api;