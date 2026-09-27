export function downloadFile(url, filename) {
    const token = localStorage.getItem('token');

    return fetch(url, {
        method: 'GET',
        headers: {
            ...(token ? { Authorization: 'Bearer ' + token } : {})
        }
    })
        .then(async (response) => {
            if (!response.ok) {
                let message = 'Download failed';
                const contentType = response.headers.get('content-type') || '';

                if (contentType.includes('application/json')) {
                    try {
                        const payload = await response.json();
                        message = payload?.message || payload?.error || message;
                    } catch {
                        // Ignore JSON parsing failures and fall back to generic message.
                    }
                }

                throw new Error(message);
            }

            const disposition = response.headers.get('content-disposition') || '';
            let finalFilename = filename;
            const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);

            if (match) {
                finalFilename = decodeURIComponent(match[1].replace(/['"]/g, ''));
            }

            const blob = await response.blob();
            return { blob, filename: finalFilename };
        })
        .then(({ blob, filename }) => {
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        });
}
