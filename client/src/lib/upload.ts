export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Ошибка загрузки");
  return data.url;
}
