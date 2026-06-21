import api from './api';

// Downloads a CSV (or other file) from an authenticated API endpoint.
// Axios is used so the Authorization header is attached automatically.
export async function downloadFile(url, filename) {
  const response = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: response.headers['content-type'] || 'text/csv' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);

  // Prefer filename from Content-Disposition header when provided by server
  const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
  const resolvedFilename = (() => {
    if (contentDisposition) {
      // Try to extract filename*=UTF-8''fname or filename="fname"
      const fnStarMatch = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;\n\r]+)/i);
      if (fnStarMatch && fnStarMatch[1]) return decodeURIComponent(fnStarMatch[1].replace(/"/g, ''));
      const fnMatch = contentDisposition.match(/filename=\"?([^\";]+)/i);
      if (fnMatch && fnMatch[1]) return fnMatch[1].replace(/\"/g, '');
    }
    return filename;
  })();

  link.download = resolvedFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}
